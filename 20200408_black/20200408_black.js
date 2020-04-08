let backShader;
let elemShader;
let div = 0.05;
let thickness = 0.05;
let speed = 0.1;
let balls = [];

const ColorPalette = Object.freeze({
	"black": "#272343",
	"white": "#ffffff",
	"lightsea": "#e3f6f5", 
	"sea": "#bae8e8"
});

function preload(){
  // load the shader
  backShader = loadShader('assets/back.vert', 'assets/back.frag');
  elemShader = loadShader('assets/back.vert', 'assets/back.frag');
}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  noStroke();

  for(let i=0; i<100; i++){
    let ball = new Ball(random(50, 300), random(5,50), width, height, elemShader, random(1.0, 8.0));
    balls.push(ball);
  }
}

function draw() {
  background(220);

  if(frameCount < 3){
    backShader.setUniform('u_color1', color(ColorPalette.black)._array);
    backShader.setUniform('u_color2', color(ColorPalette.white)._array);
    backShader.setUniform('u_resolution', [width * 2, height * 2]);
    backShader.setUniform('u_div', div);
    backShader.setUniform('u_speed', speed);

    elemShader.setUniform('u_color1', color(ColorPalette.white)._array);
    elemShader.setUniform('u_color2', color(ColorPalette.black)._array);
    elemShader.setUniform('u_resolution', [width * 2, height * 2]);
    elemShader.setUniform('u_div', div);
    elemShader.setUniform('u_speed', speed);
  }

  let sval = map(constrain(sin(radians(frameCount * 1)), -0.5, 0.5), -0.5, 0.5, thickness, 1.0 - thickness);
  backShader.setUniform('u_thickness', sval);
  backShader.setUniform('u_time', radians(frameCount));
  elemShader.setUniform('u_thickness', sval);
  elemShader.setUniform('u_time', radians(frameCount));
  
  shader(backShader);
  rect(-width * 0.5, -height * 0.5,width, height);

  for(let i =0; i<balls.length; i++){
    let ball = balls[i];
    ball.update();
    ball.draw();
    
  }
}

class Ball{
  constructor(offset, size, width, height, shader, speed){
    this.width = width;
    this.height = height;
    
    this.size = size;
    this.offset = offset;
    this.shader = shader;
    this.dir = createVector(1, 0);

    this.rightX = this.width * 0.5 - offset - this.size * 0.5;
    this.leftX = - this.width * 0.5 + offset + this.size * 0.5;
    this.bottomY = this.height * 0.5 - offset - this.size * 0.5;
    this.topY = -this.height * 0.5 + offset + this.size * 0.5;

    this.xWave = 2;
    this.yWave = round((this.bottomY - this.topY) / (this.rightX - this.leftX) * this.xWave);
    this.xSpeed = speed;
    this.ySpeed = speed * (this.bottomY - this.topY) / (this.rightX - this.leftX);

    this.pos = createVector(random(this.leftX, this.rightX), this.bottomY);
  }

  update(){
    this.dir.normalize();
    
    if(this.dir.x > 0){
      this.dir.mult(this.xSpeed);
      let h = abs(cos(map(this.pos.x, this.leftX, this.rightX, 0, PI * this.xWave))) * this.offset;
      this.pos.y = this.height * 0.5 - h - this.size * 0.5;
    }else if(this.dir.y < 0){
      this.dir.mult(this.ySpeed);
      let h = abs(cos(map(this.pos.y, this.bottomY, this.topY, 0, PI * this.yWave))) * this.offset;
      this.pos.x = this.width * 0.5 - h - this.size * 0.5;
    }else if(this.dir.x < 0){
      this.dir.mult(this.xSpeed);
      let h = abs(cos(map(this.pos.x, this.leftX, this.rightX, 0, PI * this.yWave))) * this.offset;
      this.pos.y = -this.height * 0.5 + h + this.size * 0.5;
    }else if(this.dir.y > 0){
      this.dir.mult(this.ySpeed);
      let h = abs(cos(map(this.pos.y, this.bottomY, this.topY, 0, PI * this.xWave))) * this.offset;
      this.pos.x = -this.width * 0.5 + h + this.size * 0.5;
    }

    this.pos.add(this.dir);


    if(this.dir.x > 0 && this.pos.x > this.rightX){
      this.pos = createVector(this.rightX, this.bottomY);
      this.dir = createVector(0, -1);
    }
    if(this.dir.y < 0 && this.pos.y < this.topY){
      this.pos = createVector(this.rightX, this.topY);
      this.dir = createVector(-1, 0);
    }
    if(this.dir.x < 0 && this.pos.x < this.leftX){
      this.pos = createVector(this.leftX, this.topY);
      this.dir = createVector(0, 1);
    }
    if(this.dir.y > 0 && this.pos.y > this.bottomY){
      this.pos = createVector(this.leftX, this.bottomY);
      this.dir = createVector(1, 0);
    }

    
  }

  draw(){
    shader(this.shader);
    push();
    translate(0,0,1);
    ellipse(this.pos.x, this.pos.y, this.size, this.size);
    pop();
  }
}