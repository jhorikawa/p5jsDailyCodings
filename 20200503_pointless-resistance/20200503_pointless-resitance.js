let renderer;
let motion;

const ColorPalette = Object.freeze({
	"dark": "#2a1a5e",
  "orange": "#fb9224",
  "yellow": "#fbe555"
});


function setup() {
  renderer = createCanvas(windowWidth, windowHeight);

  noStroke();

  motion = new Motion(100,40,5,0.2, 0.7, 1.0, 0.5, 1.0);
}



function draw() {
  background(ColorPalette.dark);

  motion.update();
  motion.draw();
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

class Motion{
  constructor(num, size, stweight, springw, stime, time1, time2, time3){
    this.run = false;
    this.stweight = stweight;
    this.size = size;
    this.forward = true;
    this.splash = false;
    this.springdir = createVector(1, 0);
    this.springt = 0.0;
    this.springwidth = width * springw;
    this.springx = 0.0;
    this.curtime = 0.0;
    this.stime = stime;
    this.time1 = time1;
    this.time2 = time2;
    this.time3 = time3;
    this.splashforward = true;
    this.show = false;
    this.items = [];
    for(let i=0; i<num; i++){
      this.items.push(new Item(createVector(width * 0.5, height * 0.5), this.size));
    }

    this.resetDir();
  }

  update(){
    if(this.run){
      if(this.forward){
        this.springt += deltaTime * 0.001;
        if(this.springt > this.stime){
          this.springt = this.stime;
          this.forward = false;
        }
        this.springx = easeOutBack(this.springt / this.stime) * this.springwidth;
      }else{
        this.springt -= deltaTime * 0.001;
        if( this.springt < 0){
          this.reset();
        }
        this.springx = easeOutExpo(this.springt / this.stime) * this.springwidth;
      }
    }else{
      if(this.splash == false){
        this.springt += deltaTime * 0.001 * 1.0;
        if(this.springt > 1.0){
          this.springt = 0.0;
          this.run = true;
        }
      }
    }
    

    if(this.show && this.run == false){
      if(this.splashforward){
        this.curtime += deltaTime * 0.001;
      }else{
        this.curtime -= deltaTime * 0.001;
      }
      
      if(this.splashforward){
        if(this.curtime > this.time1 + this.time2){
          this.splashforward = false;
        }
      }else{
        if(this.curtime < this.time1 + this.time2 - this.time3){
          this.splashforward = true;
          this.curtime = 0.0;
          this.show = false;
          this.run = true;
        }
      }
    }

    for(let i=0; i<this.items.length; i++){
      let time = 0.0;

      if(this.splashforward){
        time = min(this.time1, this.curtime) / this.time1;
        time = easeOutQuint(time, this.items[i].shift);
      }else{
        time = map(this.curtime, this.time1 + this.time2, this.time1 + this.time2 - this.time3, 1.0, 0.0);
        time = easeOutQuint(time, 5);
      }
      this.items[i].update(time);
    }
  }

  

  draw(){
    let y = height * 0.5;
    noStroke();

    let springpositions = [];
    for(let i=-1; i<=1; i+=2){
      fill(ColorPalette.yellow);
      let springpos = p5.Vector.add(createVector(width * 0.5, height * 0.5) ,p5.Vector.mult(this.springdir, this.springx * i));
      springpositions.push(springpos);
      ellipse(springpos.x, springpos.y, this.size, this.size);
    }
    stroke(ColorPalette.yellow);
    strokeWeight(this.stweight);
    line(springpositions[0].x, springpositions[0].y, springpositions[1].x, springpositions[1].y);

    if(this.show){
      for(let i=0; i<this.items.length; i++){
        this.items[i].draw();
      }
    }
  }

  reset(){
    this.springt = 0.0;
    this.forward = true;
    this.run = false;
    this.splash = true;

    for(let i=0; i<this.items.length; i++){
      this.items[i].reset();
    }

    this.resetDir();

    this.show = true;
  }

  resetDir(){
    let ang = random(TWO_PI);
    this.springdir = createVector(cos(ang), sin(ang));
  }
}

class Item{
  constructor(pos, size){
    this.pos = pos;
    this.size = random(size * 0.5, size);
    this.ang = 0.0;
    this.shape = floor(random(4));
    this.stepang = radians(random(-5, 5));
    this.shift = random(3, 6);
    
    this.reset();
  }

  update(val){
    this.ang += this.stepang;

    let cen = createVector(width * 0.5, height * 0.5);
    this.pos = p5.Vector.add(cen, p5.Vector.mult(this.dir, this.rad * val));
  }

  draw(){
    noStroke();
    fill(this.color);
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.ang);
    if(this.shape == 0){
      circle(0,0, this.size);
    }else{
      let sidenum = this.shape + 2;
      let stepang = 360 / sidenum;
      beginShape();
      for(let i=0; i<sidenum; i++){
        vertex(cos(radians(i * stepang)) * this.size * 0.5, sin(radians(i * stepang)) * this.size * 0.5);
      }
      endShape(CLOSE);
    }
    pop();
  }

  reset(){
    this.pos = createVector(width * 0.5, height * 0.5);
    let maxsize = max(height * 0.5, width * 0.5);
    this.rad = random(maxsize * 0.3, maxsize);
    let ang = random(TWO_PI);
    this.dir = createVector(cos(ang), sin(ang));
    this.color = lerpColor(color(ColorPalette.yellow), color(ColorPalette.orange), random());
  }
}