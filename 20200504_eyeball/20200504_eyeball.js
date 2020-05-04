let renderer;
let backShader;
let curTime = 0.0;
let drops = [];
let metanum = 5;
let minsize = 50;
let maxsize = 100;

const ColorPalette = Object.freeze({
	"pink": "#fcbad3",
  "yellow": "#f5f5f5",
  "green": "#355c7d",
  "blue": "#a1eafb"
});

function preload(){
  backShader = loadShader('assets/shader.vert', 'assets/shader.frag');
}

function setup() {
  renderer = createCanvas(windowWidth, windowHeight, WEBGL);

  pixelDensity(1);

  for(let i=0; i<metanum; i++){
    let drop = new Drop(createVector(random(width), height+ random(height)), random(minsize, maxsize), 15.0);
    drops.push(drop);
  }

  noStroke();
}

function draw() {

  for(let i=0; i<drops.length; i++){
    let drop = drops[i];
    drop.update();
  }

  if(frameCount < 5){
    backShader.setUniform("u_resolution", [width , height]);
    backShader.setUniform("u_metanum", metanum + 1);
  }

  let positions = [];
  let radiuses = [];
  for(let i=0; i<metanum; i++){
    let drop = drops[i];
    let pos = drop.pos;
    positions.push(pos.x, pos.y);
    let rad = drop.size;
    radiuses.push(rad);
  }
  positions.push(width * 0.5, height * 2.);
  radiuses.push(height * 1.9);


  backShader.setUniform("u_positions", positions);
  backShader.setUniform("u_radiuses", radiuses);
  backShader.setUniform("u_time", curTime);
  backShader.setUniform("u_backcol1", color(ColorPalette.pink)._array);
  backShader.setUniform("u_backcol2", color(ColorPalette.yellow)._array);
  backShader.setUniform("u_col1", color(ColorPalette.green)._array);
  backShader.setUniform("u_col2", color(ColorPalette.blue)._array);

  shader(backShader);
  quad(-1, -1, 1, -1, 1, 1, -1, 1);

  curTime += deltaTime * 0.001;
}


class Drop{
  constructor(pos, size, speed){
    this.pos = pos;
    this.size = size;
    this.speed = speed;
    this.minsize = minsize;
    this.maxsize = maxsize;
  }

  update(){
    this.pos.add(createVector(0, -this.speed * map(this.size, this.minsize, this.maxsize, 0.5, 1.0), 0));
    if(this.pos.y < -this.maxsize * 2){
      this.pos.y = height * 1.5 + random(height);
      this.pos.x = random(width);
      this.size = random(this.minsize, this.maxsize);
    }
  }
}