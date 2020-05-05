let renderer;
let grid;
let curTime = 0;

const ColorPalette = Object.freeze({
	"dark": "#1a3263",
  "light": "#e8e2db",
  "col1": "#fab95b",
  "col2": "#f5564e"
});


function setup() {
  renderer = createCanvas(windowWidth, windowHeight, WEBGL);
  
  ortho(-width/2, width/2, -height/2, height/2, 0.01, 10000);
  
  noStroke();
  grid = new Grid(5, 6, 250);
}

function draw() {
  background(ColorPalette.light);
  grid.draw();

  curTime += deltaTime * 0.001;
}

class Grid{
  constructor(x, y, size){
    this.x = x;
    this.y = y;
    this.size = size;
    this.manholes = [];
    this.backPG = createGraphics(width, height, WEBGL);
    this.backPG.background(ColorPalette.dark);
    this.backPG.noStroke();

    let id = 0;
    for(let i=0; i<x; i++){
      for(let n=0; n<y; n++){
        let xsize = this.size * 2.0;
        let ysize = this.size * 2.0 * sin(radians(60.));

        let pos = createVector(-xsize * (x + 0.5) * 0.5 + (i + (n % 2) * 0.5)* xsize, -ysize * y * 0.5 + ysize * n, 0);
        let manhole = new Manhole(id, pos, this.size, this.backPG);
        this.manholes.push(manhole);
        id++;
      }
    }
  }

  draw(){
    push();
    translate(0,this.size * 0.5, 0);
    rotateX(radians(60));
    rotateZ(radians(45));
    
    for(let i=0; i<this.manholes.length; i++){
      this.manholes[i].draw();
    }
    push();
    scale(4);
    image(this.backPG, -width * 0.5, -height * 0.5);
    pop();
    pop();
  }
}

class Manhole{
  constructor(id, pos, size, pg){
    this.id = id;
    this.pos = pos;
    this.size = size * 0.8;
    this.pg = pg;
    this.shift1 = random();
    this.shift2 = floor(random(3));
    this.speed = (floor(random(2)) == 0 ? -1 : 1) ;
    this.maxtimecount = 200;
    this.colshift = random();
    this.timecount = floor(random(4)) * 100 / 4;
    this.prevtime = 0;
    this.timereached = false;
    this.count = 0;
    this.show = random() < 0.5 ? false : true;

    this.pg.push();
    this.pg.noStroke();
    this.pg.scale(0.25);
    this.pg.translate(this.pos.x, this.pos.y, this.pos.z);
    this.pg.erase();
    this.pg.ellipse(0,0,this.size * 2, this.size * 2, 36);
    this.pg.noErase();
    this.pg.pop();
  }

  draw(){
    push();
    translate(this.pos.x, this.pos.y, this.pos.z + 0.05);
    rotateZ(radians(120) * this.shift2);

    let time = min((abs(this.timecount) % (this.maxtimecount * 2)) / this.maxtimecount, 1.0);
    time = easeOutBounce(time);

    let ang = time * PI;
    let col = lerpColor(color(ColorPalette.dark), color(ColorPalette.light), pow(sin(abs(ang) % PI) * 0.5, 1.0));
    let sizeoffset = 5.0;
    rotateX(ang + this.count * PI);
    col = color(col);
    
    fill(col);
    ellipse(0,0,this.size * 2. + sizeoffset, this.size * 2. + sizeoffset, 36);

    if(this.show){
      push();
      translate(0,0,this.size * 0.5);
      fill(lerpColor(color(ColorPalette.col1), color(ColorPalette.col2), this.colshift));
      sphere(this.size * 0.5);
      pop();
    }
    pop();


    if(abs(this.timecount) > this.maxtimecount && this.timereached == false){
      this.shift2 = floor(random(3));
      this.timereached = true;
    }

    this.timecount+= this.speed;

    if(this.timereached == true && (abs(this.timecount) % (this.maxtimecount * 2))== 0){
      this.count ++;
      this.shift2 = floor(random(3));
      if(this.count % 2 == 1){
        this.show = random() < 0.5 ? false : true;
      }
      this.timereached = false;
    }
  }
}




function easeOutSine(t){
  return sin(( t * PI) / 2.0);
}

function easeOutCubic(t){
  return 1.0 - pow(1.0 - t, 3);
}

function easeOutQuint(t, n){
  return 1 - pow(1 - t, n);
}

function easeOutBack(t) {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  
  return 1 + c3 * pow(t - 1, 3) + c1 * pow(t - 1, 2);
}

function easeOutBounce(t) {
  const n1 = 7.5625;
  const d1 = 2.75;
  
  if (t < 1 / d1) {
      return n1 * t * t;
  } else if (t < 2 / d1) {
      return n1 * (t -= 1.5 / d1) * t + 0.75;
  } else if (t < 2.5 / d1) {
      return n1 * (t -= 2.25 / d1) * t + 0.9375;
  } else {
      return n1 * (t -= 2.625 / d1) * t + 0.984375;
  }
}

function easeOutElastic(t) {
  const c4 = (2 * Math.PI) / 3;
  
  return t === 0
    ? 0
    : t === 1
    ? 1
    : pow(2, -10 * t) * sin((t * 10 - 0.75) * c4) + 1;
  }

function easeInExpo(t) {
  return t === 0 ? 0 : pow(2, 10 * t - 10);
}

function easeOutExpo(t){
  return t === 1 ? 1 : 1 - pow(2, -10 * t);
}
