const ws = new WebSocket('ws://127.0.0.1:9002/ws');

function connectBangle() {
    let connected = false;
    let pickCounter = 0;
    Puck.modal(function () {
        Puck.write("\n", function () {
            connected = true;
        });
    });
    startWebSocket();
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function alertHandler(colour, vibrate, text1, text2, lines, explanation) {
    const { expStr1, expStr2, expStr3, expStr4 } = splitTextIntoLines(explanation);
    await setBgColor(colour);
    await setColor(-1);
    await clearScreen();
    await setFontScore();
    await setFontAlign();
    if (lines === 2) {
        await drawString(text1,"88","34");
        await drawString(text2,"88","78");
    } else {
        await drawString(text1,"88","56");
    }
    await bangleVibrate(vibrate);
    await setLCDPower();
    await setFontVector(14);
    if (expStr4 === '') { // If there are only 3 lines of explanation
        await drawString(expStr1, "88","118");
        await drawString(expStr2,"88","134");
        await drawString(expStr3,"88","150");
    } else if (expStr3 === '') { // If there are only 2 lines of explanation
        await drawString(expStr1, "88","126");
        await drawString(expStr2,"88","142");
    } else if (expStr2 === '') { // If there is only 1 line of explanation
        await drawString(expStr1, "88","134");
    } else { // But if there are 4 lines
        await drawString(expStr1, "88","116");
        await drawString(expStr2,"88","128");
        await drawString(expStr3,"88","140");
        await drawString(expStr4,"88","152");
        await delay(3000); // ------ how long to display the alert for (ms)
        await clearScreen();
    }
    
}

function startWebSocket() {
    async function handleMessage(event) {
        const receivedData = event.data;
        console.log('Raw data received: ', receivedData);
        // await notifyReceived();
        await dataHandler(receivedData);
    }

    ws.onmessage = handleMessage;

    // Handle WebSocket errors
    ws.onerror = (error) => {
        console.error('WebSocket Error:', error);
    };

    // Handle connection opening
    ws.onopen = () => {
        console.log('Connected to WebSocket server.');
    };

    // Handle connection closure
    ws.onclose = (event) => {
        if (event.wasClean) {
            console.log('Closed cleanly, code=', event.code, ', reason=', event.reason);
        } else {
            console.error('Connection died');
        }
    };
}