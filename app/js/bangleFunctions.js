
async function setLCDPower() {
    await Puck.write("Bangle.setLCDPower(1); \n");
}

async function setLCDTimeout(time) {
    await Puck.write("Bangle.setLCDTimeout("+time+"); \n");
}

async function clearScreen() {
    await Puck.write("g.clear(); \n");
}

async function clearScreenAll() {
    await Puck.write("g.clear(1); \n");
}

async function setBgColor(color) {
    await Puck.write("g.setBgColor("+color+"); \n");
}

async function setColor(color) {
    await Puck.write("g.setColor("+color+"); \n");
}

async function setFontAlignCentre() {
    await Puck.write("g.setFontAlign(0,0,0); \n");
}

async function setFontSmall() {
    await Puck.write("g.setFont('12x20', 1); \n");
}

async function setFontBig() {
    await Puck.write("g.setFont('12x20', 3); \n");
}

async function setFontVector(px) {
    await Puck.write("g.setFont('Vector'," + px + "); \n");
}

async function drawString(text) {
    await Puck.write("g.drawString('" + text + "', 88, 88); \n");
}

async function vibrate(time) {
    await Puck.write("Bangle.buzz(" + time + "); \n")
}