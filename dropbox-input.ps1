# Set the source and target folders
$sourceFolder = "C:\Users\natha\Documents\RCA IED\Future Cities\passive-verification-device\inputs-outputs\2-ai-input"
$targetFolder = "\\wsl.localhost\Ubuntu\home\nathan\passive-verification-device\inputs-outputs\2-ai-input"

Write-Host "monitoring $sourceFolder and moving files to $targetFolder"

# Get all files with the .txt extension in the source folder
while ($true) {
    $files = Get-ChildItem -Path $sourceFolder -Filter *.txt -Recurse

    # Loop through each file and move it to the target folder
    foreach ($file in $files) {
        Move-Item -Path $file.FullName -Destination $targetFolder -Force
        Write-Host "moved $file"
    }
}