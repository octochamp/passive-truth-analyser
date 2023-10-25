import osproc
import deques,math,strutils,parseopt,tables,strformat
import alsa,webrtcvad,wav
import deepspeech
import asyncdispatch, asynchttpserver, ws
import re
import json, httpclient

# Build the LLM sentence commands
var
    ollamaPull:string = "curl -X POST http://localhost:11434/api/pull -d '{\"name\": \"llama2:7b\"}'"
    cmdEvalOne:string = "Respond only with a single digit numeral between 0 and 9: On a scale where 0 is totally false and 9 is totally true, how accurate is it to say, \'"
    cmdEvalTwo:string = "\'?"
    cmdExplainOne:string = "Explain why the statement \'"
    cmdExplainTwo:string = "\' is "
    cmdExplainThree:string = ", in only 8 words."
    textAsBytes: seq[byte] # <-- for converting cstrings to text we can use

# --------- open WebSocket --------

var clientWs = waitFor newWebSocket("ws://127.0.0.1:9002/ws")
proc webSocketSend(output:string) {.async.} = 
    await clientWs.send(output)

# ---------------------------------

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

proc requestCommand(request:string) {.async.} =
    # Get evaluation score from LLM
    #let evalCmd = "curl -s -S -X POST http://localhost:11434/api/generate -d \"{\'model\': \'mistral-openorca\', \'stream\': false, \'prompt\': \'" & cmdEvalOne & request & cmdEvalTwo & "\'}\""
    #let evalRequest = execCmdEx(evalCmd)
    var client = newHttpClient()
    client.headers = newHttpHeaders({"Content-Type": "application/json"})  # set content type to JSON

    let payload = %*{
        "model": "mistral-openorca",
        "stream": false,
        "prompt": cmdEvalOne & request & cmdEvalTwo
        }

    let evalJsonString = client.post("http://localhost:11434/api/generate", $(payload))
    #let evalJsonString = evalRequest.output
    let evalJsonObject = parseJson(evalJsonString.body)
    var evalResult = evalJsonObject["response"].getStr()

    # Check if evalResult has single-digit numerals
    # Compile the regex pattern only once for performance
    let digitPattern = re(r"\d")
    let nonDigitPattern = re(r"[^\d]")

    # Check if evalResult has single-digit numerals
    let foundIndex = evalResult.find(digitPattern)
    if foundIndex != -1:
        evalResult = replace(evalResult, nonDigitPattern, "")  # Remove all non-numeric characters
    else:
        evalResult = "X"  # If no numerals found, set to "X"
    
    # If we have a score then get explanation from LLM and send all to WebSocket. If not, pass `X` to WebSocket.
    if evalResult != "X" :
        let readableEval = makeReadableEval(evalResult)
        var client = newHttpClient()
        echo cmdExplainOne & request & cmdExplainTwo & readableEval & cmdExplainThree
        client.headers = newHttpHeaders({"Content-Type": "application/json"})  # set content type to JSON
        let payload = %*{
            "model": "mistral-openorca",
            "stream": false,
            "prompt": cmdExplainOne & request & cmdExplainTwo & readableEval & cmdExplainThree
            }
        let explainJsonString = client.post("http://localhost:11434/api/generate", $(payload))
        let explainJsonObject = parseJson(explainJsonString.body)
        let explainResult = explainJsonObject["response"].getStr()

        # Format results as an array and send to WebSocket
        let outputPackage = "[`" & request & "`,`" & evalResult & "`,`" & explainResult & "`]"
        echo "OUTPUT: " & outputPackage
        waitFor webSocketSend(outputPackage)
    else:
        let outputPackage = "[`" & request & "`,`" & evalResult & "`]"
        waitFor webSocketSend(outputPackage)

################ ---- ------------------------------ ---- ################


# --------- DeepSpeech ------------
var 
    args = initTable[string, string]()
    saveWav = false
for kind,key,value in getopt():
    if key.toLower() == "savewav":
        saveWav = true
    else:
        args[key] = value

doAssert "model" in args

const
    rate = 16000'u32
    sampleRate = rate
    kernelBuffer = 8192'u32 #KernelBuffer size for storing micData..must not be overrun.
    nChannels = 1'u32
    format = SND_PCM_FORMAT_S16_LE
    mode = NON_BLOCKING_MODE
    frameDuration = 20  #in milliseconds.
    windowSize = 12
let
    capture_handle: snd_pcm_ref = nil
    hw_params: snd_pcm_hw_params_ref = nil
    size = (int((frameDuration*int(rate))/1000))
    modelPtr: ModelState = nil  #deepSpeech model  
    deepStreamPtr: StreamingState = nil  #deepSpeech model stream
    modelPath = args["model"]
    device_name = "plughw:1,0"  # !IMPORTANT Choose the PCM hardware ALSA Device here
    
var
    text:cstring
    err: cint
    count = 0
    dir:cint
    vad:vadObj  #VAD Object declaration
    codeV: cint  #to hold the error codes for VAD.
    codeD: cint #to hold the error codes for deepSpeech
    #to get the data from the channel.
    frame : seq[int16]
    buff = initDeque[tuple[data: seq[int16],flag:int32]](nextPowerOfTwo(windowSize))
    triggered = false
    fwav: wavObj
    scorerPath:string

var chan: Channel[seq[int16]]

proc record(deviceName:string){.thread.} =
    var recordBuff = newSeq[int16](size)  #userSpace buffer to record mic data.
    var framesLen: clong
    err = snd_pcm_open_nim(unsafeAddr(capture_handle),deviceName,SND_PCM_STREAM_CAPTURE,mode)
    doAssert err == 0'i32
    #
    err = snd_pcm_hw_params_malloc_nim(unsafeAddr(hw_params))
    doAssert err == 0'i32
    err = snd_pcm_hw_params_any_nim(capture_handle,hw_params)
    doAssert err == 0'i32
    #set InterLeaved access
    err = snd_pcm_hw_params_set_access_nim(capture_handle,hw_params,SND_PCM_ACCESS_RW_INTERLEAVED)
    doAssert err == 0'i32
    #set format
    err = snd_pcm_hw_params_set_format_nim(capture_handle,hw_params,format)
    doAssert err == 0'i32
    #Set rate
    err = snd_pcm_hw_params_set_rate_nim(capture_handle,hw_params,rate,dir)
    doAssert err == 0'i32
    #   set  nCHannels
    err = snd_pcm_hw_params_set_channels_nim(capture_handle,hw_params,nChannels)
    doAssert err == 0'i32
    err = snd_pcm_hw_params_set_buffer_size_nim(capture_handle,hw_params,kernelBuffer)

    #apply hw_params
    err = snd_pcm_hw_params_nim(capture_handle,hw_params) 
    doAssert err == 0'i32

    echo("hw_params successfully applied..")
    snd_pcm_hw_params_free_nim(hw_params)

    while true:
        #reading 512 samples ..singlechannel,each 2 bytes..hence 1024 bytes.
        framesLen = snd_pcm_readi_nim(capture_handle,addr(recordBuff[0]),culong(size))
        assert framesLen == clong(size)
        
            
        chan.send(recordBuff)

proc sum[T](temp: Deque[T]): int = 
    for i in 0..<len(temp):
        result = result + temp[i].flag

codeV = initVad(vad)
if codeV == 0'i32:
    echo("vad Initialized")
codeV = setMode(vad,3'i32)
assert codeV == 0'i32

codeD = createModel(modelPath,unsafeaddr(modelPtr))
if codeD == 0'i32:
    echo("Model Created Successfully")
let beamWidth = getBeamWidth(modelPtr)
echo("Default Beam Width is : ",int(beamWidth))
#enable External Scorer.
if "scorer" in args:
    codeD = enableExternalScorer(modelPtr, scorerPath)
    if codeD == 0'i32:
        echo("External Scorer Enabled.")
else:
    echo("No scorer Used")

chan.open()

var thread: Thread[string]
createThread[string](thread,record,device_name)
echo("Thread Created")
#receive the data from the channel..blocking call.

while true:
    frame = chan.recv()
    codeV = vad.isSpeech(frame,int(rate))
    #echo(audioData[0],"  ",codeV)

    if triggered == false:
    #now check if there is enough voiceActivity based on last `windowSize` samples
        if buff.len < windowSize:
            buff.addLast((frame,codeV))
        else:
            buff.popFirst()
            buff.addLast((frame,codeV))
        #also check the percentage of voiced samples:
        if float(sum(buff))  > float(0.5*float(windowSize)):
            triggered = true

            #START THE DEEP SPEECH STREAM...here.
            codeD = createStream(modelPtr,unsafeAddr(deepStreamPtr))
            echo("Voice detected")
            if saveWav:
                fwav = wavWrite(fmt"chunk-{count:03}.wav",uint32(sampleRate),uint16(nChannels))

            for i in 0..<len(buff):
                if saveWav:
                    fwav.writeChunk(buff[i].data)
                feedAudioContent(deepStreamPtr,cast[ptr cshort](addr(buff[i].data[0])),cuint(len(buff[i].data)))
            buff.clear()

    else:
        if buff.len < windowSize:
            buff.addLast((frame,codeV))
        else:
            buff.popFirst()
            buff.addLast((frame,codeV))
        feedAudioContent(deepStreamPtr,cast[ptr cshort](addr(frame[0])),cuint(len(frame)))    
        if saveWav:
            fwav.writeChunk(frame)
        #check the percentage of unvoiced samples
        if float(buff.len - sum(buff)) > 0.85*float(windowSize):
            #echo("Done")
            triggered = false
            buff.clear()
            text = finishStream(deepStreamPtr)
            if len(text)>8:
                for c in text:
                    textAsBytes.add(byte(c)) # convert the cstring `text` to bytes which can be used in a string
                let textString = cast[string](textAsBytes) # convert the byte sequence textAsBytes to a string called textString
                let sanitisedTextString = textString.replace("'", "\\'")  # Escape single quotes
                waitFor requestCommand(sanitisedTextString) # Run the proc to process and deliver to websocket
                textAsBytes = @[]  # Clear the textAsBytes sequence
                freeString(text)

        if saveWav:
                fwav.close()
                echo("Written")
                count = count + 1