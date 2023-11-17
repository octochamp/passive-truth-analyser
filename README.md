# Passive Verification Device
A fully-functioning application built as a piece of speculative design, which analyses the accuracy (according to an LLM) of spoken statements in real-time and delivers the results to a wearable device. Uses OpenAI's [Whisper](https://github.com/openai/whisper) for voice recognition and Mistral-OpenOrca with the Ollama API for offline LLM functions, and works with a Bangle.js smartwatch. All of this works as the backend for a live performance called *Sparring Partners*.

![Screenshot of Sparring Partners](/images/Screenshot.png)

## Prerequisites
- [Ollama](https://ollama.ai) + [Mistral](https://mistral.ai/)-[OpenOrca](https://huggingface.co/Open-Orca/Mistral-7B-OpenOrca)
- A modern Linux distro, at time of writing there's no Windows version of Ollama and Mac OS is untested.
- Python and the dependencies for Whisper AI, as per [this](https://github.com/davabase/whisper_real_time) just run `pip install -r requirements.txt`
- [FFmpeg](https://ffmpeg.org/)
- [Nim](https://nim-lang.org/install.html) (Nim is only used because in earlier versions it used to run the Mozilla DeepSpeech model and there was a Nim app I could start building from. All of that code is gone now but Nim remains. All of its functions could/should be really done in one of the python scripts or maybe even in js. I hate Nim and hope to never have to use it again)
- Google Chrome, because it's the only browser to currently support Web Bluetooth
- a [Bangle.js](https://banglejs.com/) device, but you can see results in browser without one.
- a machine with enough VRAM + GPU power to run both Whisper AI and a ~7B parameter LLM. Theoretically with some rewriting one of them could run off CPU instead though!

## Notes
- Thanks to [@davabase](https://github.com/davabase) for the public domain [Real Time Whisper Transcription](https://github.com/davabase/whisper_real_time) python script to build on

## Usage
1. Build llmBridge with `nim c -f -d:release --threads:on ./app/llmBridge.nim`
1. Pull the Mistral-OpenOrca LLM model: `ollama pull mistral-openorca`
1. Run 'launch' (you may need to `chmod +x ./launch` in a terminal first), this will open a google-chrome window plus terminal windows running transcriber.py, websocketserver.py and llmBridge
1. Connect to Bangle.js