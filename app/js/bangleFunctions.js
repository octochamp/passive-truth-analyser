
async function setLCD(onOff) {
    if (onOff === "on") {
        await Puck.write("Bangle.setLCDPower(1); \n");
        await Puck.write("Bangle.setLCDBrightness(1); \n");
        console.log("Turning on LCD");
    } else {
        await Puck.write("Bangle.setLCDPower(1); \n");
        await Puck.write("Bangle.setLCDBrightness(0.1); \n");
        console.log("Turning off LCD");
    }
}

async function setLCDTimeout(time) {
    await Puck.write("Bangle.setLCDTimeout("+time+"); \n");
    console.log("Setting LCD timeout to " + time + " ms");
}

async function setFontAlign() {
    await Puck.write("g.setFontAlign(0,0,0); \n");
    console.log("Setting font alignment to centre");
}

async function clearScreen() {
    await Puck.write("g.clear(); \n");
    console.log("Clearing text from screen");
}

async function clearScreenAll() {
    await Puck.write("g.clear(1); \n");
    console.log("Clearing everything from screen");
}

async function setBgColor(colour) {
    await Puck.write("g.setBgColor(" + colour +"); \n");
    console.log("Setting background colour to " + colour);
}

async function setColor(r,g,b) {
    await Puck.write("g.setColor(" + r + "," + g + "," + b +"); \n");
    console.log("Setting text colour to rgb("+ r + "," + g + "," + b + ")");
}

async function setFontScore() {
    await Puck.write("g.setFont('Vector:24'); \n");
    console.log("Setting font to Vector:24");
}

async function setFontSmall() {
    await Puck.write("g.setFont('Vector:14'); \n");
    console.log("Setting font to Vector:14");
}

async function setFontBig() {
    await Puck.write("g.setFont('Vector:14'); \n");
    console.log("Setting font to Vector:14");
}

async function setFontVector(px) {
    await Puck.write("g.setFont('Vector:" + px + "'); \n");
    console.log("Setting font to Vector:" + px);
}

async function drawString(text, x, y) {
    await Puck.write("g.drawString('" + text + "'," + x + ", " + y + "); \n");
    await delay(100);
    // console.log("🔠️ --- " + text + " --- x: " + x + ", and y: " + y);
    console.log("🔠️ " + text);
}

async function bangleVibrate(time) {
    await Puck.write("Bangle.buzz(" + time + "); \n")
    console.log("Vibrating for " + time + "ms");
}