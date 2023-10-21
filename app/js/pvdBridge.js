const ws = new WebSocket('ws://localhost:9001/ws');

function connectBangle() {
    let connected = false;
    let pickCounter = 0;
    Puck.modal(function () {
        Puck.write("\n", function () {
            connected = true;
        });
    });
}

function startWebSocket() {
        async function handleMessage(event) {
        const receivedData = event.data;
        console.log('Data received: ', receivedData);
        await notifyReceived();
    }

    async function notifyReceived() {
        await setBgColor(-1);
        await setColor(0,0,0);
        await clearScreen();
        await setFontAlignCentre();
        await setFontSizeSmall();
        await setLCDPower();
        await setTimeout(drawString('Data Received'),1000);
        await clearScreen();
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