let corns = [];
let num = 15;
let yscale = 0.7;
let rad;

const ColorPalette = Object.freeze({
  "pink": "#ffb6b6",
  "lightpink" : "#fde2e2",
  "lightgreen" : "#aacfcf",
  "green": "#679b9b"
});

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  background(ColorPalette.pink);
  camera(0, -0, (height/2.0) / tan(PI*30.0 / 180.0), 0, 0, 0, 0, 1, 0);
 
  rad = width * 0.3;
  
  let partang = PI * 2 / num;
  let cornrad = 2 * rad * sin(partang * 0.25) * 2 / 3.0;
  let hnum = height / cornrad * 2.0;
  
  
  for(let n=0; n<hnum; n++){
    for(let i=0; i<num; i++){
      let ang = i * partang + n % 2 * partang * 0.5;
      corn = new Corn((i + ceil(n / 2.0)) % num, createVector(cos(ang) * rad, cornrad * 0.5 * 3.0 / 2.0 * (n - hnum * 0.5), sin(ang) * rad), cornrad, yscale, rad);
      corns.push(corn);
    }
  }
}

function draw() {
  background(ColorPalette.pink);
  ambientLight(255);
  pointLight(10, 10, 10, -200, -800, 600);
  ambientMaterial(ColorPalette.pink);
  push();
  translate(0,0,-rad);
  noStroke();
  cylinder(rad, height * 1.25);
  for(let i=0; i<corns.length; i++){
    let corn = corns[i];
    corn.draw();
  }
  pop();
}

class Corn{
  constructor(id, pos, size, yscale, wholeRad){
    this.id = id;
    this.pos = pos;
    this.origPos = pos.copy();
    this.size = size;
    let col1 = lerpColor(color(ColorPalette.pink), color(ColorPalette.lightpink), random());
    let col2 = lerpColor(color(ColorPalette.green), color(ColorPalette.lightpink), random());
    this.color = lerpColor(col1, col2, random());
    this.yscale = yscale;
    this.wholeRad = wholeRad;
    this.shiftang = random(TWO_PI);
  }

  draw(){
    push();
    
    rotateY(radians(frameCount * 0.5));
    translate(this.pos.x, this.pos.y * this.yscale, this.pos.z);
    scale(1.0, this.yscale, 1.0);
    
    let scaleval1 = map(constrain(sin(radians(frameCount * 1.5)), 0.0, 1.0), 0.0, 1.0, 1.0, 0.0);
    let scaleval2 = map(sin(radians(frameCount * 3 ) + this.id / num * TWO_PI * 2.0), -1.0, 1.0, 0.1, 1.0);
    scale(max(scaleval1, scaleval2));
    noStroke();
    specularMaterial(this.color);
    sphere(this.size, 10, 6);
    pop();
  }
}

