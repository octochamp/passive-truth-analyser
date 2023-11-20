g.setBgColor(0); 
g.setColor(-1); 
g.clear(); 
g.setFont('Vector:23');
g.setFontAlign(0,0,0);
g.drawString('ABCDEFGHIJ',88, 26);
g.drawString('KLMNOPQRST',88, 54);
// g.drawString('ABCDEFGHIJ',88, 40);
Bangle.buzz(50);
Bangle.setLCDPower(1);
 g.setFont('Vector:14');
//g.setFont('6x15:1');

const one = () => {
	g.clear();
	g.drawString('The phrase alludes to',88, 125); // line 1
};

const two = () => {
	g.clear();
	g.drawString('The phrase alludes to',88, 116); // line 1
	g.drawString('seizing opportunities',88, 134); // line 2
};

const three = () => {
	g.clear();
	g.drawString('The phrase alludes to',88, 107); // line 2
	g.drawString('seizing opportunities',88, 125); // line 3
	g.drawString('and making the most',88, 143); // line 4

};

const four = () => {
	g.clear();
	g.drawString('The phrase alludes to',88, 98); // line 1
	g.drawString('seizing opportunities',88, 116); // line 2
	g.drawString('and making the most',88, 134); // line 3
	g.drawString('of situations such',88, 152); // line 4
};

const five = () => {
	g.clear();
	g.drawString('The phrase alludes to',88, 89); // line 1
	g.drawString('seizing opportunities',88, 107); // line 2
	g.drawString('and making the most',88, 125); // line 3
	g.drawString('of situations such',88, 143); // line 4
	g.drawString('as these.',88, 161); // line 5
};

setTimeout(() => {
	one();
	}, 1000);

setTimeout(() => {
	two();
	}, 2000);

setTimeout(() => {
	three();
	}, 3000);

setTimeout(() => {
	four();
	}, 4000);

setTimeout(() => {
	five();
	}, 5000);