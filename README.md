# Passive Verification Device
A prototype wearable device to analyse factual statements in real-time.

## Prerequisites
- [Ollama](https://ollama.ai) + [Mistral](https://mistral.ai/)-[OpenOrca](https://huggingface.co/Open-Orca/Mistral-7B-OpenOrca) _(pull the mistral-openorca model before first run)_
- Mozilla DeepSpeech models as setup [here](https://github.com/mozilla/DeepSpeech-examples/tree/r0.9/nim_mic_vad_streaming)
- [Nim](https://nim-lang.org/install.html), also as setup [here](https://github.com/mozilla/DeepSpeech-examples/tree/r0.9/nim_mic_vad_streaming)

## Notes
- Everything now runs in real Ubuntu, which has made life a lot easier (no audio support in WSL)
- No longer need inotify-tools, or any text file shuffling

## Usage
1. Set correct ALSA device inside vad_stream.nim for mic input
2. Build vad_stream.nim and websocket.nim (in /app)
3. Make sure DeepSpeech-models are in their folder and correct libdeepspeech.so for architecture exists inside /app/lib/
4. Launch Ollama server with `OLLAMA_ORIGINS=127.0.0.1:* ollama serve` to prevent CORS issues
5. Launch init-pvd
6. Open index.html in Web-Bluetooth compatible browser (Chrome, basically)
7. Connect to Bangle.js