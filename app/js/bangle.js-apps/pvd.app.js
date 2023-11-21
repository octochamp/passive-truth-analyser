function reset() {
	g.clear(1);
	Bangle.setLCDPower(1);
	g.setBgColor(0,0,0);
	g.clear();
	g.setColor(1,1,1);
	g.setFont("Vector:25", 0, 0);
	g.setFontAlign(0,0,0);
	g.drawString("Personal", 88, 56);
	g.drawString("Verification", 88, 88);
	g.drawString("Device", 88, 120);
}

reset();

setWatch(() => {
  Bangle.buzz();
  setTimeout(()=>reset(), 1000);
}, BTN1, {repeat:true});