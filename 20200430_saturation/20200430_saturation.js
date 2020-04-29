let backShader;
let population;
let curTime = 0.0;

const ColorPalette = Object.freeze({
	"color1": "#af8baf",
  "color2": "#f6acc8",
  "color3": "#6886c5",
  "bgcolor" : "#ffffff"
});

function preload(){
  backShader = loadShader('assets/shader.vert', 'assets/shader.frag');
}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);

  noStroke();
  pixelDensity(1.0);

  population = new Population(200, backShader);
}

function draw() {
  background(50);

  population.update();

  shader(backShader);
  rect(-width * 0.5, -height * 0.5, width, height);

  curTime += deltaTime * 0.001;
}

class Population{
  constructor(num, vshader){
    this.vshader = vshader;
    let w = width / (height + width);
    let h = height / (height + width);
    let n = sqrt(num / (w * h));

    this.xnum = floor(n * w);
    this.ynum = floor(n * h);
    this.totalNum = this.xnum * this.ynum;

    let stepx = width / (this.xnum - 1.0);
    let stepy = height / (this.ynum - 1.0);
    this.stepsize = min(stepx, stepy);
    

    this.points = [];
    for(let i=0; i<this.xnum; i++){
      for(let n=0; n<this.ynum; n++){
        let xsize = i * stepx;
        let ysize = n * stepy;
        let pt = new Point(createVector(xsize, ysize));
       
        this.points.push(pt);
      }
    }
  }

  update(){
    let speed = 3.0;//map(sin(radians(curTime * 100.0)), -1.0, 1.0, 1.0, 10.0);
    let t= 0.0;
    let colval = 0.0;
    let wt = 7.0;
    let tt = 4.0;
    if(floor(curTime) % wt < tt){
      t = 0.025;
      speed = 0.25;
      colval = pow(sin(map(((curTime % wt) % tt) , 0.0, tt, 0, PI)), 0.8);
    }
    for(let i=0; i<this.points.length; i++){
      let pt = this.points[i];
      pt.update(t, speed);
    }


    if(frameCount < 5){
      this.vshader.setUniform('u_resolution', [width, height]);
      this.vshader.setUniform('u_num', this.points.length);
      this.vshader.setUniform('u_stepsize',this.stepsize * 0.6);
      this.vshader.setUniform('u_col1', color(ColorPalette.color1)._array);
      this.vshader.setUniform('u_col2', color(ColorPalette.color2)._array);
      this.vshader.setUniform('u_col3', color(ColorPalette.color3)._array);
      this.vshader.setUniform('u_bgcol', color(ColorPalette.bgcolor)._array);
    }
    this.vshader.setUniform('u_time', curTime);
    this.vshader.setUniform('u_positions', this.getPointPosArray());
    this.vshader.setUniform('u_colval', colval);
  }


  draw(){
    for(let i=0; i<this.points.length; i++){
      let pt = this.points[i];
      pt.draw();
    }
  }

  getPointPosArray(){
    let positions = [];
    for(let i=0; i<this.points.length; i++){
      let pt = this.points[i];
      positions.push(pt.pos.x, pt.pos.y);
    }
    return positions;
  }
}

class Point{
  constructor(pos){
    this.origPos = pos.copy();
    this.pos = pos.copy();
    this.acc = createVector();
    this.vel = createVector();
    this.shift1 = random();
    this.shift2 = random();
    this.speed = 0.1;
    this.maxspeed = 3.0;
  }

  update(t, speed){
    this.maxspeed = speed;
    let scale = 1;
    let dirx = (noise(curTime* scale + 1000000.0 * this.shift1) - 0.48) * 2.0;
    let diry = (noise(curTime* scale + 1000000.0 * this.shift2) - 0.48) * 2.0;
    this.acc = createVector(dirx, diry);
    this.acc.normalize();
    this.acc.mult(this.speed);
    this.vel.add(this.acc);
    this.vel.limit(this.maxspeed);
    this.pos.add(this.vel);

    let dir = p5.Vector.sub(this.origPos, this.pos);
    dir.mult(t);
    this.pos.add(dir);

    let bounce = false;
    if(this.pos.x > width){
      this.pos.x = width;
      bounce = true;
    }
    if(this.pos.x < 0){
      this.pos.x = 0;
      bounce = true;
      // this.vel.x *= -1;
    }
    if(this.pos.y < 0){
      this.pos.y = 0;
      bounce = true;
      // this.vel.y *= -1;
    }
    if(this.pos.y > height){
      this.pos.y = height;
      bounce = true;
      // this.vel.y *= -1;
    }

    if(bounce){
      this.vel.mult(-1.0);//.x *= -1;
      this.shift1 = random();
      this.shift2 = random();
    }


  }

  updateMaxSpeed(maxspeed){
    this.maxspeed = maxspeed;
  }

  draw(){
    stroke(255);
    strokeWeight(5);
    point(this.pos.x, this.pos.y);
  }
}

