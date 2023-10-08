# Passive Verification Device
A prototype wearable device to analyse factual statements in real-time.

## Prerequisites
- [Ollama](https://ollama.ai) + [Mistral-7B](https://mistral.ai/)
- [inotify-tools](https://github.com/inotify-tools)
- Mozilla DeepSpeech models as setup [here](https://github.com/mozilla/DeepSpeech-examples/tree/r0.9/nim_mic_vad_streaming)
- [Nim](https://nim-lang.org/install.html), also as setup [here](https://github.com/mozilla/DeepSpeech-examples/tree/r0.9/nim_mic_vad_streaming)

## Notes
- It's become very convoluted :)
- Ollama/Mistral have to run on Linux, but because I'm using WSL2 which doesn't access mic audio natively, the DeepSpeech voice recognition has to run on Windows and dump its output into a folder (voice-output) which is symlinked to a folder in WSL2 :) :)

## Usage
1. Build vad_stream.nim (in nim_mic_vad_streaming)
2. Make sure DeepSpeech-models are in their folder and libdeepspeech.so exists inside nim_mic_vad_streaming
3. Launch init-voice.ps1 in Powershell
4. Launch ./init-ai in WSL