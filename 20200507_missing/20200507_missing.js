let renderer;
let divnum = 3;
let curTime = 0;
let balls = [];

const ColorPalette = Object.freeze({
	"dark": "#333333",
  "light": "#ffffff"
});


function setup() {
  renderer = createCanvas(windowWidth, windowHeight);
  
  for(let i=0; i<divnum; i++){
    let ball = new Ball(TWO_PI / divnum * i, divnum, 1, height * 0.2);
    balls.push(ball);
  }
}

function draw() {
  background(ColorPalette.dark);

  for(let i=0; i<balls.length; i++){
    let ball = balls[i];
    ball.update();
    ball.draw();
  }

  curTime += deltaTime * 0.001;
}

class Ball{
  constructor(ang, div, speed, rad){
    this.ang = ang;
    this.div = div;
    this.speed = speed;
    this.positions = [];
    this.ids = [];
    this.posnum = 100;
    this.rad = rad;
    this.nnum = this.div * 2;
    this.reset = false;
  }

  update(){
    let stepang = TWO_PI / this.div;
    this.ang += radians(this.speed);

    this.positions = [];
    this.ids = [];
    for(let i=0; i<this.posnum; i++){
      let cang = this.ang + i * radians(this.speed * 0.5);
      cang = cang % TWO_PI;
      let stepid = floor(cang / stepang);
      let angt = (cang % stepang) / stepang;
      let h = sin(angt * PI) * this.rad * 0.5;

      let nnum = this.nnum;
      for(let n=0; n<nnum; n++){
        let nstepang = stepang / nnum * n * map(sin(radians(frameCount * 0.5)), -1, 1.0, 0.0, 3.0);
        let npos = createVector(cos(cang + nstepang) * this.rad + width * 0.5, sin(cang + nstepang) * this.rad + height * 0.5);
        let h2 = cos(angt * TWO_PI + nstepang) * sin(angt * TWO_PI + nstepang) * this.rad * 0.5;

        let dir = npos.copy();
        dir.sub(createVector(width * 0.5, height * 0.5));
        dir.normalize();
        dir.mult(h + h2);
        npos.add(dir);
        this.positions.push(npos);
        this.ids.push(i);
      }
    }
  }

  draw(){
    noStroke();
    let timeval = map(sin(radians(frameCount* this.speed * 0.5)), -0.95, 0.95, 0, 1);
    if(timeval <= 0.0 && this.reset == false){
      this.nnum -= 1;
      if(this.nnum < 1){
        this.nnum = this.div * 2;
      }
      // this.nnum = max(this.nnum % (this.div * 2), this.div);
      this.reset = true;
    }
    if(timeval >= 1.0){
      this.reset = false;
    }

    for(let i=0; i<this.positions.length; i++){
      let pos = this.positions[i];
      let t = (this.ids[i] + 1) / this.posnum;
      let col = lerpColor(color(ColorPalette.dark), color(ColorPalette.light), timeval);
      col._array[3] = pow(t, 5.0);
      fill(col);
      let scalet = pow(t, 2.0);
      ellipse(pos.x, pos.y, scalet * 20.0, scalet * 20.0);
    }
  }
}