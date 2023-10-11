# Set the source and target folders
$sourceFolder = "D:\Dropbox (BBC)\RCA IED\2023 10 Future Cities\live_link\2-ai-input-dropbox"
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