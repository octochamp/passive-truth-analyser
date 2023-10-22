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

async function dataHandler(data) {
    // 1. Strip out braille characters (from Unicode range 2800-28FF)
    let cleanData = data.replace(/[\u2800-\u28FF]/g, '');

    // 2. Remove line spaces
    cleanData = cleanData.replace(/^\s*[\r\n]/gm, '');

    // 3. Extract the single-digit numeral
    let match = cleanData.match(/(\d)/);

    // 4. Strip out the score and put just the explanation into a string, limit the string to 12 words
    let explainString = cleanData.slice(1).trim();
    let explainStringWords = explainString.split(/\s+/); // split by whitespace
    if (explainStringWords.length > 12) {
        explainString = explainStringWords.slice(0, 12).join(' ') + '...';
    }

    // 5. Create 3 separate lines for explainString:
    let lineWords = explainString.split(/\s+/); // Split the string into words

    let explainString1 = "", explainString2 = "", explainString3 = "";

    if (lineWords.length > 0) {
        explainString1 = lineWords.slice(0, 4).join(' '); // First 4 words
    }
    if (lineWords.length > 4) {
        explainString2 = lineWords.slice(4, 8).join(' '); // Next 4 words
    }
    if (lineWords.length > 8) {
        explainString3 = lineWords.slice(8).join(' '); // Remaining words
    }

    if (match) {
        console.log("match positive: " + match)
        let evalScore = parseInt(match[1], 10);
        console.log("evalScore = " + evalScore);
        console.log("explainString = " + explainString);
        alert(evalScore, explainString1, explainString2, explainString3);
    }
    else {
        console.log("match negative: " + match)
        console.log("no data score provided");
    }
}

async function alert(score, stringOne, stringTwo, stringThree) {
    await setBgColor(-1);
    await setColor(0,0,0);
    await clearScreen();
    await setFontScore();
    await setFontBig();
    await drawString(score);;
    await vibrate(100);
    await setLCDPower();
    await setFontVector(12);
    await delay(500);
    await setFontLineOne();
    await drawString(stringOne);
    await setFontLineTwo();
    await delay(100);
    await drawString(stringTwo);
    await setFontLineThree();
    await delay(100);
    await drawString(stringThree);
    await delay(3000);
    await clearScreen();
    
}

function startWebSocket() {
    async function handleMessage(event) {
        const receivedData = event.data;
        console.log('Data received: ', receivedData);
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