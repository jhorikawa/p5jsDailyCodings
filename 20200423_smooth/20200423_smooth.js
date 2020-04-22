let smShader;
let curTime = 0.0;
let smoothBalls = [];

const ColorPalette = Object.freeze({
  "dark" : "#381460",
  "purple" : "#323edd",
  "yellow" : "#ffd868",
  "orange": "#ffb385",
  "red": "#b80d57"
});

function preload(){
  smShader = loadShader('assets/shader.vert', 'assets/shader.frag');
}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  pixelDensity(1);
  noStroke();

  camera(0, 0, (height/2.0) / tan(PI*30.0 / 180.0), 0, 0, 0, 0, 1.0, 0);
  perspective(PI / 3.0, width / height, 0.1, 20000);

  let num = 40;
  let maxsize = 200.0;
  for(let i=0; i<num; i++){
    let scale = map(i, 0, num-1, pow(num, 0.6) , 0.2);
    let z = map(i, 0, num-1, -num * maxsize * 1.5, 0);
    let x = random(-width * scale, width * scale);
    let y = random(-height * scale, height * scale);
    let pos = createVector(x, y, z);
    let smoothBall = new SmoothBall(i / (num-1), pos, maxsize, floor(random(10, 20)));
    smoothBalls.push(smoothBall);
  }
}

function draw() {
  background(ColorPalette.dark);
  if(frameCount < 5){
    var gl = document.getElementById('defaultCanvas0').getContext('webgl');

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.enable(gl.CULL_FACE);

    smShader.setUniform('u_resolution', [512, 512]);
  }

  smShader.setUniform('u_time', curTime);

  for(let i=0; i<smoothBalls.length; i++){
    let smoothBall = smoothBalls[i];

    smoothBall.draw();
  }
  

  curTime += deltaTime * 0.001;
}

class SmoothBall{
  constructor(index, pos, rad, num){
    this.index = index;
    this.pos = pos;
    this.rad = rad;
    this.num = num;
    this.balls = [];
    this.seed = random();
    
    this.lightcol = lerpColor(color(ColorPalette.yellow), color(ColorPalette.orange), random());
    this.darkcol = lerpColor(color(ColorPalette.red), color(ColorPalette.purple), random());

    for(let i=0; i<this.num; i++){
      let id = map(i, 0, this.num-1, 1.0, 0.0);
      let ball = new Ball(id, this.index, this.pos, this.rad * ((i+1) / this.num), this.seed, this.lightcol, this.darkcol);
      this.balls.push(ball);
    }


  }

  draw(){
    for(let i=0; i<this.balls.length; i++){
      this.balls[this.balls.length -1 -i].draw(false);
      this.balls[i].draw(true);
    }
  }
}

class Ball{
	constructor(index, depth, pos, rad, seed, lightcol, darkcol){
    this.index = index;
		this.pos = pos;
    this.rad = rad;
    this.seed = seed;
    this.depth = depth;
    this.lightcol = lightcol;
    this.darkcol = darkcol;
    this.speed = random(40.0, 60.0);
	}
	
	draw(front){
    var gl = document.getElementById('defaultCanvas0').getContext('webgl');
    if(front){
      gl.cullFace(gl.FRONT);
    }else{
      gl.cullFace(gl.BACK);
    }

    smShader.setUniform('u_front', front);
    smShader.setUniform('u_col', lerpColor(this.lightcol, this.darkcol, pow(this.index, 0.5))._array);
    smShader.setUniform('u_index', this.index);
    smShader.setUniform('u_depth', this.depth);
    shader(smShader);

    push();
    translate(this.pos.x, this.pos.y, this.pos.z);
    let rotang = map(this.index, 0.0, 1.0, HALF_PI * 0.1 * this.seed, TWO_PI * this.seed);
    rotateY(rotang * sin(this.seed * TWO_PI + radians(curTime * this.speed)));
    rotateZ(rotang * cos(this.seed * TWO_PI + radians(curTime * this.speed)));
    rotateX(rotang * cos(this.seed * TWO_PI + radians(curTime * this.speed)));
    rotateX(radians(map(this.seed,0.0, 1.0, -60, -120)));
    
    sphere(this.rad, 40, 16);
    pop();
    resetShader();
	}
}