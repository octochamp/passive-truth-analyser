import osproc
import deques,math,strutils,parseopt,tables,strformat
import alsa,webrtcvad,wav
import asyncdispatch, asynchttpserver, ws
import re
import json, httpclient

# Build the LLM sentence commands
var
    ollamaPull:string = "curl -X POST http://localhost:11434/api/pull -d '{\"name\": \"llama2:7b\"}'"
    cmdEvalOne:string = "Respond only with a single digit numeral between 0 and 9: On a scale where 0 is totally false and 9 is totally true, how accurate is it to say, \'"
    cmdEvalTwo:string = "\'?"
    cmdExplainOne:string = "Explain why this \'"
    cmdExplainTwo:string = "\' is "
    cmdExplainThree:string = ". Do not echo the statement. Do not use the words \'"
    cmdExplainFour:string = "\' or \'the statement\'. Limit your response to 5 words."
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


# ------- Pull the Ollama model, in case it's not been downloaded
# ~~~~~~~~~~~ TODO Build in something to check the local models (https://github.com/jmorganca/ollama/blob/main/docs/api.md#list-local-models)
# ~~~~~~~~~~~ and only pull if model isn't present

# echo execCmdEx(ollamaPull)

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

proc llmRequest(payload: JsonNode): string =
    var client = newHttpClient()
    client.headers = newHttpHeaders({"Content-Type": "application/json"})  # set content type to JSON
    let jsonString = client.post("http://localhost:11434/api/generate", $(payload))
    let jsonObject = parseJson(jsonString.body)
    return jsonObject["response"].getStr()

proc requestCommand(request:string) {.async.} =
    # Get evaluation score from LLM
    echo "Asking: " & cmdEvalOne & request & cmdEvalTwo
    let payload = %*{
        "model": "mistral-openorca",
        "stream": false,
        "prompt": cmdEvalOne & request & cmdEvalTwo
    }
    var evalResult = llmRequest(payload)

    # Strip all non-digit characters
    let onlyDigitsPattern = re(r"\D")  # Matches non-digit characters
    evalResult = replace(evalResult, onlyDigitsPattern, "")

    # Check if the result is a single numeral
    if evalResult.len() == 1:
        echo("No further action required")
    else:
        evalResult = "X"  # If no numeral or more than one numeral found, set to "X"

    echo evalResult
    
    # If we have a score then get explanation from LLM and send all to WebSocket. If not, pass `X` to WebSocket.
    if evalResult != "X" :
        let readableEval = makeReadableEval(evalResult)
        echo "------------Asking: " & cmdExplainOne & request & cmdExplainTwo & readableEval & cmdExplainThree & readableEval & cmdExplainFour & " ----------------------"
        let explainPayload = %*{
            "model": "mistral-openorca",
            "stream": false,
            "prompt": cmdExplainOne & request & cmdExplainTwo & readableEval & cmdExplainThree & readableEval & cmdExplainFour
            }
        let explainResult = llmRequest(explainPayload)
        echo explainResult

        # Format results as a JSON array and send to WebSocket
        let outputPackage = %*{
            "request": request,
            "eval": evalResult,
            "explanation": explainResult
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