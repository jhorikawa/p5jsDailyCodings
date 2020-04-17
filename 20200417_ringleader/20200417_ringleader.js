let glitchShader;
let curTime = 0.0;
let numTapes = 200;
this.zmaxdepth = 10000;
let origPG;
let maskPG;
let tapes;

function preload(){
  glitchShader = loadShader('assets/shader.vert', 'assets/shader.frag');
}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  pixelDensity(1);

  origPG = createGraphics(width, height, WEBGL);
  origPG.noStroke();
  origPG.ortho(-width / 2, width / 2, -height / 2, height / 2, 0, zmaxdepth);
  origPG.camera(0, 0, 500, 0, 0, 0, 0, 1, 0);

  maskPG = createGraphics(width, height, WEBGL);
  maskPG.noStroke();
  maskPG.ortho(-width / 2, width / 2, -height / 2, height / 2, 0, zmaxdepth);
  maskPG.camera(0, 0, 500, 0, 0, 0, 0, 1, 0);

  tapes = new Tapes(numTapes, origPG, maskPG);
}

function draw() {
  background(155,0,0);
  if(frameCount < 3){
    glitchShader.setUniform('u_resolution', [width, height]);
  }
  glitchShader.setUniform('u_time', curTime);
  

  origPG._renderer._update();
  origPG.background(50);
  origPG.ambientLight(255);
  origPG.directionalLight(250, 250, 250, -0.2, -1.0, -0.5);
  maskPG._renderer._update();
  maskPG.background(0);

  tapes.update();
  tapes.draw();

  glitchShader.setUniform('u_tex', origPG);
  glitchShader.setUniform('u_mask', maskPG);
  if(tapes.showcrim){
    glitchShader.setUniform('u_glitchval', 80.0);
    glitchShader.setUniform('u_glitchdiv', 0.005);
    glitchShader.setUniform('u_glitchdens', 0.4);
  }else{
    glitchShader.setUniform('u_glitchval', 30.0);
    glitchShader.setUniform('u_glitchdiv', 0.02);
    glitchShader.setUniform('u_glitchdens', 0.2);
  }


  shader(glitchShader);
  rect(-width * 0.5,-height * 0.5, width, height);

  curTime += deltaTime;
}

class Tapes{
  constructor(num, origPG, maskPG){
    this.tapes = [];
    this.origPG = origPG;
    this.maskPG = maskPG;
    this.crimindex = floor(random() * num);
    this.showcrim = false;
    this.timecount = 0;
    this.maxtime = 3.0;

    let tempPositions = [];
    for(let i=0; i<num; i++){
      let size = p5.Vector.mult(createVector(60, 100, 10), 2.0);
      let pos = createVector(random(-width * 0.5, width * 0.5), random(-height * 0.75, height * 0.75), random(0, -zmaxdepth * 0.5));
      let canAdd = true;
      for(let n=0; n< tempPositions.length; n++){
        let tempPos = tempPositions[n];
        let dist = sqrt(pow(tempPos.x - pos.x, 2.0) + pow(tempPos.z - pos.z, 2.0));
        if(dist < size.y){
          canAdd = false;
          break;
        }
      }
      if(canAdd){
        let tape = new Tape(this.tapes.length, this.origPG, this.maskPG, pos, size, this);
        this.tapes.push(tape);
        tempPositions.push(pos);
      }
    }
  }

  update(){
    for(let i=0; i<this.tapes.length; i++){
      let tape = this.tapes[i];
      tape.update();
    }

    if(this.showcrim == false){
      this.timecount += deltaTime * 0.001;
      
      if(this.maxtime < this.timecount){
        this.timecount = 0;
        this.showcrim = true;
        this.crimindex = floor(random() * this.tapes.length);
        this.tapes[this.crimindex].blink();
      }
    }
  }

  draw(){
    for(let i=0; i<this.tapes.length; i++){
      let tape = this.tapes[i];
      tape.draw();
    }
  }
}

class Tape{
  constructor(id, origPG, maskPG, pos, size, tapes){
    this.tapes = tapes;
    this.id = id;
    this.origPG = origPG;
    this.maskPG = maskPG;
    this.pos = pos;
    this.size = size;
    this.randX = random(-1.0, 1.0);
    this.randZ = random(-1.0, 1.0);
    this.offsetY = random() * TWO_PI;
    this.color = lerpColor(color(250, 200, 0), color(50), map(this.pos.z, 0.0, -zmaxdepth * 0.5, 0.0, 1.0));
    this.blinking = false;
    this.blinkTimeCount = 0.0;
  }

  blink(){
    this.blinking = true;
  }

  update(){
    let fallspeed = map(this.pos.z, 0, -zmaxdepth * 0.5, -5, -2.5);
    this.pos.add(createVector(0, fallspeed, 0));

    if(this.pos.y + this.size.y < -height * 0.5){
      this.pos.y = height * 0.5 + this.size.y;
      
      if(this.blinking){
        this.tapes.showcrim = false;
        this.blinkTimeCount = 0;
        this.blinking = false;
      }
    }

    if(this.blinking){
      this.blinkTimeCount += deltaTime * 0.001;
    }
  }

  draw(){
    this.origPG.push();
    this.origPG.translate(this.pos.x, this.pos.y, this.pos.z);
    this.origPG.rotateY(radians(frameCount * 2.0) + this.offsetY);
    this.origPG.rotateX(radians(45) * this.randX);
    this.origPG.rotateZ(radians(45) * this.randZ);
    let col = this.color;
    if(this.blinking){
      col = color(255);
    }
    this.origPG.ambientMaterial(col);
    this.origPG.box(this.size.x, this.size.y, this.size.z);
    this.origPG.pop();

    this.maskPG.push();
    this.maskPG.translate(this.pos.x, this.pos.y, this.pos.z);
    this.maskPG.rotateY(radians(frameCount * 2.0) + this.offsetY);
    this.maskPG.rotateX(radians(45) * this.randX);
    this.maskPG.rotateZ(radians(45) * this.randZ);
    this.maskPG.fill(255);
    this.maskPG.box(this.size.x, this.size.y, this.size.z);
    this.maskPG.pop();
  }
}
