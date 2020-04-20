const metaNumber = 50;

let metaShader;
let curTime = 0.0;
let origPG;
let eye;
let colors = [];

function preload(){
  metaShader = loadShader('assets/shader.vert', 'assets/shader.frag');
}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  pixelDensity(1);

  origPG = createGraphics(width, height);
  origPG.noStroke();

  let tpcols = [
    color("#2d4059")._array,
    color("#ea5455")._array,
    color("#f07b3f")._array,
    color("#ffd460")._array
  ];

  for(let i=0; i<tpcols.length; i++){
    for(let n=0; n<tpcols[i].length; n++){
      colors.push(tpcols[i][n]);
    }
  }


  eye = new Eye(origPG, createVector(width * 0.5, height * 0.6), 200, metaShader, metaNumber);
}

function draw() {
  background(155,0,0);
  if(frameCount < 3){
    metaShader.setUniform('u_resolution', [width, height]);
    metaShader.setUniform('u_cols', colors);
    metaShader.setUniform('u_col', colors[3]);
  }
  metaShader.setUniform('u_time', curTime);
  

  origPG.background(50);
  eye.update();
  eye.draw();


  shader(metaShader);
  rect(-width * 0.5,-height * 0.5, width, height);

  curTime += deltaTime;
}


class Eye{
  constructor(origPG, pos, size, metaShader, metaNumber){
    this.origPG = origPG;
    this.origPos = pos;
    this.pos = pos;
    this.size = size;
    this.metaballs = [];
    this.metaShader = metaShader;

    for(let i=0; i<metaNumber; i++){
      let first = false;
      let rad = this.size * 0.2;
      let vel = createVector(0, random(-2, -10));
      let pos = createVector(random(width * 0.5 - this.size + rad * 2.0, width * 0.5 + this.size - rad * 2.0), random(0.0, this.origPos.y));
      if(i == 0){
        rad = this.size;
        vel = createVector(0,0);
        pos = this.origPos;
        first = true;
      }

      let meta = new MetaBall(
        origPG, 
        pos, 
        rad, 
        vel,
        first,
        this
      );
      this.metaballs.push(meta);
    }
  }

  getMetaBallsInfos(){
    let infos = [];
    for(let i=0; i<this.metaballs.length; i++){
      let metaball = this.metaballs[i];
      infos.push(metaball.pos.x, metaball.pos.y, metaball.rad);
    }

    return infos;
  }

  updateCenter(){
    let firstmetaball = this.metaballs[0];
    firstmetaball.update();
  }

  update(){
    for(let i=0; i<this.metaballs.length; i++){
      let metaball = this.metaballs[i];
      metaball.update();
    }


    this.metaShader.setUniform("u_metaballs", this.getMetaBallsInfos());
  }

  draw(){

  }
}

class MetaBall{
  constructor(origPG, pos, rad, vel, first, eye){
    this.origPG = origPG;
    this.pos = pos;
    this.maxrad = rad;
    this.rad = rad;
    this.vel = vel;
    this.first = first;
    this.eye = eye;
  }

  update(){
    this.pos.add(this.vel);
    if(this.first == false){
      this.rad = map(this.pos.y, 0, this.eye.origPos.y, this.maxrad * 0.5, this.maxrad);
      this.vel = createVector(0, -map(this.pos.y, 0, this.eye.origPos.y, 12.0, 5.0));
    }
    if(this.pos.y + this.rad< 0){
      this.pos.y = this.eye.origPos.y;
    }
  }
}
