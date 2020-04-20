let holes = [];
let holeNum = 20;

const ColorPalette = Object.freeze({
  "blue": "#202040",
  "darkgreen" : "#522d5b",
  "green" : "#ff6363",
  "lightgreen": "#ffbd69"
});

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(200);
 
  for(let i=0; i<holeNum; i++){
    let depth = map(i, 0, holeNum-1, 1.0, 0);
    let minSize =  0.0;
    let maxSize = width * 0.5 * sqrt(2);
    let offset = 0.3;
    let hole = new Hole(createVector(width * 0.5, height * 0.5, depth), minSize, maxSize, offset, random(1000.0));
    holes.push(hole);
    hole.draw();
  }

  // drawingContext.shadowBlur = height * 0.25;
  // drawingContext.shadowColor = "black";
}

function draw() {
  background(ColorPalette.blue);
  for(let i=0; i<holes.length; i++){
    let hole = holes[i];
    hole.update();
  }

  
  for(let i=0; i<holes.length; i++){
    let hole = holes[i];
    hole.draw();
  }
}

class Hole{
  constructor(pos, minRad, maxRad, offset, seed){
    this.offset = offset;
    this.origPos = pos;
    this.offsetrad = map(pos.z, 0.0, 1.0, maxRad, minRad) * offset;
    this.pos = p5.Vector.add(pos, createVector(random(-this.offsetrad, this.offsetrad), random(-this.offsetrad, this.offsetrad), 0.0));
    this.minRad = minRad;
    this.maxRad = maxRad;
    this.seed = seed;
    this.pg = createGraphics(width, height);
  }

  update(){
    this.pos.z -= 0.002;
    if(this.pos.z <= 0.0){
      this.pos.x = this.origPos.x + random(-this.offsetrad, this.offsetrad);
      this.pos.y = this.origPos.y + random(-this.offsetrad, this.offsetrad);
      this.pos.z = 1.0;
      this.seed = random(1000.0);
      holes.pop();
      holes.unshift(this);
      
    }
  }

  draw(){
    let colmin = 0.5;
    let colval = map(max(this.pos.z, colmin), colmin, 1.0, 0.0, 1.0);
    let col1 = lerpColor(color(ColorPalette.lightgreen), color(ColorPalette.green), min(colval, 0.5));
    let col2 = lerpColor(color(ColorPalette.darkgreen), color(ColorPalette.blue), max(colval, 0.5));
    let col = lerpColor(col1, col2, colval);
    this.pg.background(col);
    this.pg.erase();
    this.pg.beginShape();
    let res = 128;
    let rad = map(this.pos.z, 0.0, 1.0, this.maxRad, this.minRad);
    for(let i=0; i<res; i++){
      let ang = map(i, 0, res, 0, TWO_PI);
      let len = rad + (noise(cos(ang) * 1.0 + this.pos.x, sin(ang) * 1.0 + this.pos.y, this.seed)) * rad;
      this.pg.vertex(cos(ang) * len + this.pos.x, sin(ang) * len + this.pos.y);
    }
    this.pg.endShape(CLOSE);
    this.pg.noErase();

    image(this.pg, 0, 0);
  }
}

