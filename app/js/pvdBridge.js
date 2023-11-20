const ws = new WebSocket('ws://127.0.0.1:9002/ws1');

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

function escapeQuotes(str) {
    return str.replace(/"/g, '\\"');
}

function oneLine(expStr1) {
    setFontSmall();
    Puck.write(`
        g.drawString("${escapeQuotes(expStr1)}",88,126); \n
    `);
}

function twoLines(expStr1, expStr2) {
    setFontSmall();
    Puck.write(`
        g.drawString("${escapeQuotes(expStr1)}",88,117); \n
        g.drawString("${escapeQuotes(expStr2)}",88,135); \n
    `);
}

function threeLines(expStr1, expStr2, expStr3) {
    setFontSmall();
    Puck.write(`
        g.drawString("${escapeQuotes(expStr1)}",88,108); \n
        g.drawString("${escapeQuotes(expStr2)}",88,126); \n
        g.drawString("${escapeQuotes(expStr3)}",88,144); \n
    `);
}

function fourLines(expStr1, expStr2, expStr3, expStr4) {
    setFontSmall();
    Puck.write(`
        g.drawString("${escapeQuotes(expStr1)}",88,99); \n
        g.drawString("${escapeQuotes(expStr2)}",88,117); \n
        g.drawString("${escapeQuotes(expStr3)}",88,135); \n
        g.drawString("${escapeQuotes(expStr4)}",88,153); \n
    `);
}

function fiveLines(expStr1, expStr2, expStr3, expStr4, expStr5) {
    setFontSmall();
    Puck.write(`
        g.drawString("${escapeQuotes(expStr1)}",88,90); \n
        g.drawString("${escapeQuotes(expStr2)}",88,108); \n
        g.drawString("${escapeQuotes(expStr3)}",88,126); \n
        g.drawString("${escapeQuotes(expStr4)}",88,144); \n
        g.drawString("${escapeQuotes(expStr5)}",88,162); \n
    `);
}


function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function alertHandler(colour, vibrateTime, text1, text2, evalLines, lcd, evaluation, explanation) {
    let expStr1, expStr2, expStr3, expStr4
    let alertSound = new Audio("../audio/" + evaluation + ".wav");
    alertSound.play();
    let numberOfLines = 5; // default
    let evalOffset = 4; // default offset if 5 lines
    console.log("🎵️ Evaluation score: " + evaluation)
    if (explanation) { // if there's an explanation, split it into lines
        console.log("ℹ️ Explanation: " + explanation)
        const splitResult = splitTextIntoLines(explanation);
        expStr1 = splitResult.expStr1;
        expStr2 = splitResult.expStr2;
        expStr3 = splitResult.expStr3;
        expStr4 = splitResult.expStr4;
        expStr5 = splitResult.expStr5;
        
        if (expStr2 === '') {
            numberOfLines = 1;
            evalOffset = 36;
        } else if (expStr3 === '') {
            numberOfLines = 2;
            evalOffset = 28;
        } else if (expStr4 === '') {
            numberOfLines = 3;
            evalOffset = 20;
        } else if (expStr5 === '') {
            numberOfLines = 4;
            evalOffset = 12;
        } else {
            console.log("evalOffset is less than 1 or greater than 5")
        }

    } else { // if no explanation, then just empty strings
        console.log("No explanation")
        expStr1 = expStr2 = expStr3 = expStr4 = expStr5 = ""; // default values
    }
    Puck.write(` 
        Bangle.buzz(` + vibrateTime + `); \n
        g.setBgColor(` + colour +`); \n
        g.setColor(-1); \n
        g.clear(); \n
        g.setFont('Vector:24'); \n
        g.setFontAlign(0,0,0); \n
        `);
    if (evalLines === 2) {
        Puck.write(`
            g.drawString("${text1}",88,${26 + evalOffset}); \n
            g.drawString("${text2}",88,${54 + evalOffset}); \n
        `)
    } else {
        Puck.write(`
            g.drawString("${text1}",88,${40 + evalOffset}); \n
        `)
    }
    await setLCD(lcd);
    switch (numberOfLines) {
        case 5:
            fiveLines(expStr1, expStr2, expStr3, expStr4, expStr5);
            await delay(100);
            fiveLines(expStr1, expStr2, expStr3, expStr4, expStr5);
            break;
        case 4:
            fourLines(expStr1, expStr2, expStr3, expStr4);
            await delay(100);
            fourLines(expStr1, expStr2, expStr3, expStr4);
            break;
        case 3:
            threeLines(expStr1, expStr2, expStr3);
            await delay(100);
            threeLines(expStr1, expStr2, expStr3);
            break;
        case 2:
            twoLines(expStr1, expStr2);
            await delay(100);
            twoLines(expStr1, expStr2);
            break;
        case 1:
            oneLine(expStr1);
            await delay(100);
            oneLine(expStr1);
            break;
        default:
            console.log("ERROR: Number of lines is <1 or >5");
    }

    await delay(4000); // ------ how long to display the alert for (ms)

    Puck.write(`
        Bangle.setLCDPower(1); \n
        Bangle.setLCDBrightness(1); \n
        g.setBgColor(0,0,0); \n
        g.clear(); \n
    `)


/*     if (expStr5 === '') {

    } else if (expStr4 === '') { // If there are only 3 lines of explanation
        
        await drawString(expStr1,"88","118");
        await drawString(expStr2,"88","134");
        await drawString(expStr3,"88","150");

    } else if (expStr3 === '') { // If there are only 2 lines of explanation
        await drawString(expStr1, "88","126");
        await drawString(expStr2,"88","142");

    } else if (expStr2 === '') { // If there is only 1 line of explanation
        await drawString(expStr1, "88","134");

    } else if (expStr1 === '') { // if there are 0 lines of explanation
        console.log("-");
    } else { // But if there are 5 lines
        
        await drawString(expStr1, "88","89");
        await drawString(expStr2, "88","107");
        await drawString(expStr3,"88","125");
        await drawString(expStr4,"88","143");
        await drawString(expStr5,"88","161");
    }
 */

}

function startWebSocket() {

    let isProcessing = false;
    console.log("started");
    async function handleMessage(event) {
        if (isProcessing) {
            return;
        }
        isProcessing = true;
        const receivedData = event.data;
        await dataHandler(receivedData).finally(() => {
            isProcessing = false;
        });
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