let fileHandle; // Store the reference to the file handle
let interval;
let tempFile = "init";

function connectBangle() {
    let connected = false;
    let pickCounter = 0;
    Puck.modal(function () {
        Puck.write("\n", function () {
            connected = true;
        });
    });
}

async function selectFile() {
    try {
        fileHandle = await window.showOpenFilePicker();
        document.getElementById("startButton").removeAttribute("disabled");
    } catch (error) {
        console.error('Error selecting file: ' + error.message);
    }
    return;
}

async function pvdInit() {
    console.log("Initalising PVD");
    await setLCDPower('1');
    await setLCDTimeout('0');
    await clearScreenAll();
    await setBgColor('-1');
    await setColor('0,0,0');
    await clearScreen();
    await setFontAlignCentre();
    await setFontSizeSmall();
    await drawString('INITIALISING');
    await setBgColor('0,0,0');
    await setColor('-1');
    await clearScreen();
    return;
}

async function startChecking() {
    await pvdInit();
    interval = 5000;
    intervalId = setInterval(checkProcess, interval); // Re-read the .txt file every 5 seconds
    return;
}

async function checkProcess() {
     if (fileHandle != 0) {
        document.getElementById("stopButton").removeAttribute("disabled");
        /* document.getElementById("startButton").setAttribute("disabled", ""); */
        try {
            const file = await fileHandle[0].getFile();
            const blob = await file.text(); // Read the contents of the file as a Blob
            const fileText = await new Response(blob).text();

            if (fileText !== tempFile) {
                if (fileText === "T") {
                    console.log("Text says TRUE");

                    // Bangle commands:
                    await vibrate(200);
                    await setFontSizeBig();
                    await setBgColor('0,1,0');
                    await clearScreen();
                    await drawString('True');

                    tempFile = fileText;
                    return;

                } else if (fileText === "F") {
                    console.log("Text says FALSE");

                    // Bangle commands:
                    await vibrate(2000);
                    await setFontSizeBig();
                    await setBgColor('1,0,0');
                    await clearScreen();
                    await drawString('False');
                    tempFile = fileText;
                    return;

                } else if (fileText === "x") {
                    console.log("Listening");
                    // Bangle commands:
                    await setFontSizeSmall();
                    await setBgColor('0,0,1');
                    await clearScreen();
                    await drawString('listening...');
                    tempFile = fileText;
                    return;

                } else {
                    console.log("File is empty or contains invalid content");
                    return;
                }
            } else { return; }

        } catch (error) {
            console.error('Error fetching file: ' + error.message);
            return;
        }
    } else {
        return;
    }
}

function stopChecking() {
    clearInterval(intervalId);
    setLCDPower(0);
    setLCDTimeout(5);
    document.getElementById("startButton").removeAttribute("disabled");
    document.getElementById("stopButton").setAttribute("disabled", "");
}
