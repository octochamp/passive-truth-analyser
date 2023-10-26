
async function setLCDPower() {
    await Puck.write("Bangle.setLCDPower(1); \n");
    console.log("Bangle.setLCDPower(1); \n");
}

async function setLCDTimeout(time) {
    await Puck.write("Bangle.setLCDTimeout("+time+"); \n");
    console.log("Bangle.setLCDTimeout("+time+"); \n");
}

async function setFontAlign() {
    await Puck.write("g.setFontAlign(0,0,0) \n");
    console.log("g.setFontAlign(0,0,0) \n");
}

async function clearScreen() {
    await Puck.write("g.clear(); \n");
    console.log("g.clear(); \n");
}

async function clearScreenAll() {
    await Puck.write("g.clear(1); \n");
    console.log("g.clear(1); \n");
}

async function setBgColor(r,g,b) {
    await Puck.write("g.setBgColor(" + r + "," + g + "," + b +"); \n");
    console.log("g.setBgColor(" + r + "," + g + "," + b +"); \n");
}

async function setColor(r,g,b) {
    await Puck.write("g.setColor(" + r + "," + g + "," + b +"); \n");
    console.log("g.setColor(" + r + "," + g + "," + b +"); \n");
}

async function setFontScore() {
    await Puck.write("g.setFont('Vector:32'); \n");
    console.log("g.setFont('Vector:32'); \n");
}

async function setFontSmall() {
    await Puck.write("g.setFont('Vector:14'); \n");
    console.log("g.setFont('Vector:14'); \n");
}

async function setFontBig() {
    await Puck.write("g.setFont('12x20:3'); \n");
    console.log("g.setFont('12x20:3'); \n");
}

async function setFontVector(px) {
    await Puck.write("g.setFont('Vector:" + px + "'); \n");
    console.log("g.setFont('Vector:" + px + "'); \n");
}

async function drawString(text, x, y) {
    await Puck.write("g.drawString('" + text + "'," + x + ", " + y + "); \n");
    console.log("g.drawString('" + text + "'," + x + ", " + y + "); \n");
}

async function bangleVibrate(time) {
    await Puck.write("Bangle.buzz(" + time + "); \n")
    console.log("Bangle.buzz(" + time + "); \n");
}