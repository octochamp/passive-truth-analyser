import osproc
import deques,math,strutils,parseopt,tables,strformat
import alsa,webrtcvad,wav
import asyncdispatch, asynchttpserver, ws
import re
import json, httpclient

# Build the LLM sentence commands
var
    ollamaModel:string = "mistral-openorca" # model used for evaluation
    ollamaModelAlt:string = "mistral-openorca" # model used for explanation
    cmdEvalOne:string = "Where 0 is totally false and 9 is totally true, how accurate is it to say, \'"
    cmdEvalTwo:string = "\'?"
    cmdExplainOne:string = "Explain why this statement: \'"
    cmdExplainTwo:string = "\' is "
    cmdExplainThree:string = ". Limit response to 5 words.'"
    textAsBytes: seq[byte] # <-- for converting cstrings to text we can use

# --------- open WebSocket on 127.0.0.1:9002/ws1 for sending to pvdBridge.js --------

#var clientWs = waitFor newWebSocket("ws://127.0.0.1:9002/ws1")
proc webSocketSend(output: JsonNode) {.async.} = 
    var clientWs: WebSocket
    try:
        clientWs = await newWebSocket("ws://127.0.0.1:9002/ws1")
        await clientWs.send($output)
    except Exception as e:
        echo "Error while sending data through WebSocket:", e.msg
    finally:
        if clientWs != nil:
            clientWs.close()

# Proc to turn the number rankings the LLM provides into readable forms it can then evaluate in a sentence
proc makeReadableEval(evalResult:string): string =
    let evalInt = parseInt(evalResult)
    case evalInt
    of 0 :
        return "completely inaccurate"
    of 1 :
        return "mostly inaccurate"
    of 2 :
        return "primarily inaccurate"
    of 3 :
        return "partially inaccurate"
    of 4 :
        return "neither inaccurate nor accurate (neutral)"
    of 5 :
        return "neither accurate nor inaccurate"
    of 6 :
        return "partially accurate"
    of 7 :
        return "mainly accurate"
    of 8 :
        return "mostly accurate"
    of 9 :
        return "totally accurate"
    else:
        echo "ERROR: makeReadableEval was passed something other than a number from 0 to 9"

################ ---- Proc for when VAD is triggered ---- ################

proc llmRequest(payload: JsonNode): (string, string) =
    var client = newHttpClient()
    client.headers = newHttpHeaders({"Content-Type": "application/json"})  # set content type to JSON
    let jsonString = client.post("http://localhost:11434/api/generate", $(payload))
    let jsonObject = parseJson(jsonString.body)
    let jsonResponse = jsonObject["response"].getStr()
    let jsonContext = jsonObject["context"].getStr()
    echo jsonResponse
    return (jsonResponse, jsonContext)

proc requestCommand(request:string) {.async.} =
    # Get evaluation score from LLM
    echo "Asking: " & cmdEvalOne & request & cmdEvalTwo
    let payload = %*{
        "model": ollamaModel,
        "stream": false,
        "system": "You can only respond only using one of these single-digit numbers: 0 1 2 3 4 5 6 7 8 9 ",
        "prompt": cmdEvalOne & request & cmdEvalTwo
    }
    var (evalResult, evalContext) = llmRequest(payload)

    # Strip all non-digit characters
    let onlyDigitsPattern = re(r"\D")  # Matches non-digit characters
    evalResult = replace(evalResult, onlyDigitsPattern, "")

    # Check if the result is a single numeral
    if evalResult.len() == 1:
        echo("(Result is a single numeral:)")
    else:
        evalResult = "X"  # If no numeral or more than one numeral found, set to "X"

    echo evalResult
    
    # If we have a score then get explanation from LLM and send all to WebSocket. If not, pass `X` to WebSocket.
    if evalResult != "X" :
        let readableEval = makeReadableEval(evalResult)
        echo "------------Asking: " & cmdExplainOne & request & cmdExplainTwo & readableEval & cmdExplainThree & " --"
        let explainPayload = %*{
            "model": ollamaModelAlt,
            "stream": false,
            "system": "\'You can only respond in a single concise sentence of no more than 5 words.\'",
            "prompt": cmdExplainOne & request & cmdExplainTwo & readableEval & cmdExplainThree
            }
        let (explainResponse, explainContext) = llmRequest(explainPayload)
        echo explainResponse
        echo ""

        # Format results as a JSON array and send to WebSocket
        let outputPackage = %*{
            "request": request,
            "eval": evalResult,
            "explanation": explainResponse,
        }
        await webSocketSend(outputPackage)
        
    else:
        let outputPackage = %*{
            "request": request,
            "eval": evalResult,
            "explanation": ""
        }
        await webSocketSend(outputPackage)

################ ---- ------------------------------ ---- ################

# --------- open WebSocket server on 127.0.0.1:9002/ws2 to listen to transcriber.py --------

var connections = newSeq[WebSocket]()

# Procedure to handle incoming WebSocket messages
proc handleIncomingMessages(ws: WebSocket) {.async.} =
    while ws.readyState == Open:
        let packet = await ws.receiveStrPacket()
        let jsonObj = parseJson(packet)
        if jsonObj.hasKey("transcription"):
            let transcription = jsonObj["transcription"].getStr()
            echo "Received transcription from server: ", transcription
            let sanitisedTextString = transcription.replace("'", "\\'")  # Escape single quotes
            await requestCommand(sanitisedTextString)

# Main procedure
proc main() {.async.} =
    let ws = await newWebSocket("ws://127.0.0.1:9002/ws2") # Connect to the server
    await handleIncomingMessages(ws)

echo "llmBridge listening on ws://127.0.0.1:9002/ws2"

waitFor main()