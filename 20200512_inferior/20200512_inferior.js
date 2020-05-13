let renderer;
let gl;
let backShader;
let curTime = 0.0;
let inferior;
let superiors = [];
let infSize = 20;
let supSize = 0;
let numSuperior = 11;
let light;

const ColorPalette = Object.freeze({
	"color1": "#232931",
  "color2": "#f73859",
  "color3": "#f1d18a",
  "color4" : "#ededed"
});

function preload(){
  backShader = loadShader('assets/shader.vert', 'assets/shader.frag');
}

function setup() {
  renderer = createCanvas(windowWidth, windowHeight, WEBGL);
  gl = document.getElementById('defaultCanvas0').getContext('webgl');

  ortho();
  pixelDensity(1.0);

  light = createVector(cos(radians(45)), sin(radians(45)), 0.);
  inferior = new Inferior(infSize);

  resetSuperiors(infSize);
}

function draw() {
  // background(ColorPalette.color4);

  backShader.setUniform("u_time", curTime);

  inferior.draw();

  let positions = [];
  superiors.sort(function(a, b){
    let dota = p5.Vector.dot(a.pos, light);
    let dotb = p5.Vector.dot(b.pos, light);
    return dota - dotb;
  });
  for(let i=0; i<superiors.length; i++){
    let superior = superiors[i];
    superior.update();
    superior.draw();

    positions.push(superior.pos.x + width * 0.5, height * 0.5 - superior.pos.y);
  }

  backShader.setUniform("u_resolution", [width, height]);
  backShader.setUniform("u_col1", color(ColorPalette.color1)._array);
  backShader.setUniform("u_col2", color(ColorPalette.color4)._array);
  backShader.setUniform("u_inferiorrad", infSize * 0.5);
  backShader.setUniform("u_superiorrad", supSize * 0.5);
  backShader.setUniform("u_positions", positions);
  backShader.setUniform("u_positionsnum", numSuperior);
  backShader.setUniform("u_light", [light.x, light.y]);
  backShader.setUniform("u_offset", superiors[0].offsetx);

  

  shader(backShader);
  translate(0,0,-0.1);
  rect(-width * 0.5, -height * 0.5, width, height);
  resetShader();

  curTime += deltaTime * 0.001;
}

class Inferior{
  constructor(size){
    this.pos = createVector(0,0,0);
    this.size = size;
  }

  draw(){
    noStroke();
    fill(ColorPalette.color2);
    circle(this.pos.x, this.pos.y, this.size);
  }
}

function resetSuperiors(){
  superiors = [];
  let rad = min(width, height) * 0.3;
  numSuperior += numSuperior % 2 - 1;
  for(let i=0; i<numSuperior; i++){
    let ang = TWO_PI / numSuperior * (i  + 0.5) + PI;
    
    let superior = new Superior(ang, rad, numSuperior, infSize);
    superiors.push(superior);
  }
}

class Superior{
  constructor(ang, rad, sep, gap){
    this.origpos = createVector(0,0,0);
    this.pos = this.origpos.copy();
    this.gap = gap;
    this.origang = ang;
    this.ang = ang ;
    this.origrad = rad;
    this.rad = rad;
    this.radmult = 1.0;
    this.size = 2 * this.rad * sin(TWO_PI / sep / 2) - this.gap;
    supSize = this.size;
    this.sep = sep;
    this.time = 0.0;
    this.rottime = 8.0;
    this.movetime = 4.0;
    this.gathertime = 2.0;
    this.offsetx = 0.0;
  }

  update(){
    let t = map(min(this.time, this.rottime), 0.0, this.rottime, 0.0, 1.0);
    t = easeInOutCubic(t);
    let rotang = t * TWO_PI;
    this.ang = this.origang + rotang;
    this.rad = this.origrad;

    if(t >= 1.0){
      let t2 = map(this.time, this.rottime, this.rottime + this.movetime, 0.0, 1.0);
      t2 = constrain(t2, 0.0, 1.0);
      t2 = easeInOutCubic(t2);

      this.offsetx = width * t2;

      if(t2 >= 1.0){
        this.offsetx = 0;
        let t3 = map(this.time, this.rottime + this.movetime, this.rottime + this.movetime + this.gathertime, 0.0, 1.0);
        t3 = constrain(t3, 0.0, 1.0);
        t3 = easeOutCubic(t3);
        this.rad = map(t3, 0.0, 1.0, max(width, height) * 1.5, this.origrad);

        if(t3 >= 1.0){
          this.time = 0;
          
        }
      }
    }
    
    this.pos = p5.Vector.add(this.origpos, createVector(this.offsetx + this.rad * cos(this.ang), this.rad * sin(this.ang), 0));

    this.time += deltaTime * 0.001;
  }

  draw(){
    noStroke();
    fill(ColorPalette.color2);
    circle(this.pos.x, this.pos.y, this.size);
  }
}

function easeOutCubic(x) {
  return 1 - pow(1 - x, 3);
}

function easeInExpo(x) {
  return x === 0 ? 0 : pow(2, 10 * x - 10);
}

function easeInOutCubic(x) {
  return x < 0.5 ? 4 * x * x * x : 1 - pow(-2 * x + 2, 3) / 2;
}

function easeInQuad(x) {
  return x * x;
}

function easeInOutQuint(x) {
  return x < 0.5 ? 16 * x * x * x * x * x : 1 - pow(-2 * x + 2, 5) / 2;
}

function easeInOutCubic(x) {
  return x < 0.5 ? 4 * x * x * x : 1 - pow(-2 * x + 2, 3) / 2;
}