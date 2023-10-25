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

// Generic alert for testing
async function alert(score, stringOne, stringTwo, stringThree) {
    await setBgColor(0,0,1);
    await setColor(1,1,1);
    await clearScreen();
    await setFontScore();
    await setFontAlign();
    await drawString(score,"88","34");
    await drawString(score,"88","78");
    await vibrate(50);
    await setLCDPower();
    await setFontVector(14);
    await drawString(stringOne, "88","118");
    await drawString(stringTwo,"88","134");
    await drawString(stringThree,"88","150");
    await delay(3000);
    await clearScreen();
}

function alertTest(score, stringOne, stringTwo, stringThree) {
    alert(score, stringOne, stringTwo, stringThree);
}

function alertHandler(score, stringOne, stringTwo, stringThree) {
    if (score) {
        switch(score) {
            case"0": 
                return;
            
        }
    }
    else {
        console.log("No score recorded for request")
        return;
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