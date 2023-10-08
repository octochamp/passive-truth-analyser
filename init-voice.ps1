# Define the paths to the model and scorer files
$modelPath = "DeepSpeech-models\deepspeech-0.9.3-models.pbmm"
$scorerPath = "DeepSpeech-models\deepspeech-0.9.3-models.scorer"

# Build the command
$command = "nim_mic_vad_streaming\vad_stream.exe --model:`"$modelPath`" --scorer:`"$scorerPath`""

# Run it
Invoke-Expression -Command $command
