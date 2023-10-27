# Passive Verification Device
A prototype offline local wearable device to analyse factual statements in real-time. Uses OpenAI's [Whisper](https://github.com/openai/whisper) for voice recognition and Mistral-OpenOrca with the Ollama API for offline LLM functions.

## Prerequisites
- [Ollama](https://ollama.ai) + [Mistral](https://mistral.ai/)-[OpenOrca](https://huggingface.co/Open-Orca/Mistral-7B-OpenOrca) _(pull the mistral-openorca model before first run)_
- Linux or Mac OS (not tested) because Ollama isn't on Windows yet
- Python and the dependencies for Whisper AI, as per [this](https://github.com/davabase/whisper_real_time) just run `pip install -r requirements.txt`
- [FFmpeg](https://ffmpeg.org/)
- [Nim](https://nim-lang.org/install.html) (Nim is only used because in earlier versions it used to run the Mozilla DeepSpeech model. All of its functions could be really done in one of the python scripts or in js. I hate Nim and hope to never have to use it again)
    - While we're at it, probably no need for two separate python scripts, and transcriber.py could also host the websockets? but uhh here we are
- a [Bangle.js](https://banglejs.com/) device. Could easily write a module that instead displays in a browser etc though
- a machine with enough VRAM to run both Whisper AI and a ~7B parameter LLM. Theoretically one of them could run off CPU instead though

## Notes
- Thanks to [@davabase](https://github.com/davabase) for the public domain [Real Time Whisper Transcription](https://github.com/davabase/whisper_real_time) python script to build on

## Usage
1. Build llmBridge.nim with `nim c -f -d:release --threads:on ./app/llmBridge.nim`
1. Launch Ollama server with `ollama serve`
1. Launch websocket: `python3 app/websocketserver.py`
1. Launch transcriber: `python3 app/transcriber.py`
1. Launch llmBridge: `app/llmBridge`
1. Open index.html in Web-Bluetooth compatible browser (Chrome, basically)
1. Connect to Bangle.js