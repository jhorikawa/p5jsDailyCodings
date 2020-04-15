
let rain;

let colors = [
  "#a8d8ea",
  "#aa96da",
  "#fcbad3",
  "#fcf8f3"
];


function setup() {
  createCanvas(windowWidth, windowHeight);
  noStroke();

  rain = new Rain(100);
}

function draw() {
  background(colors[3]);

  rain.update();
  rain.draw();
}

class Rain{
  constructor(num){
    this.rainDrops = [];

    for(let i=0; i<num; i++){
      let rainDrop = new RainDrop(this);
      this.rainDrops.push(rainDrop);
    }
  }

  update(){
    for(let i=0; i<this.rainDrops.length; i++){
      let rainDrop = this.rainDrops[i];
      rainDrop.update(15.0);
    }
  }

  draw(){
    for(let i=0; i<this.rainDrops.length; i++){
      let rainDrop = this.rainDrops[i];
      rainDrop.draw();
    }
  }
}

class RainDrop{
  constructor(rain){
    this.rain = rain;
    this.depthScale = random();
    
    this.pos = createVector(random(0, width), this.depthScale * height * 0.5, random(-height * 0.5, height * 0.5));
    this.prevPos = this.pos.copy();
    // this.speed = speed;
    this.splash = false;
    this.splashTime = 0.0;
    this.splashMax = 1.0;
    this.color1 = colors[1];
  }

  update(speed){
    this.speed = speed;
    this.pos.add(createVector(0,0,this.speed * map(this.depthScale, 0.0, 1.0, 1.0, 0.25)));

    
    if(this.pos.z > height - this.pos.y){
      this.prevPos = this.pos.copy();
      this.pos = createVector(random(0, width), this.depthScale * height * 0.5, random(-height * 0.5, -height));
      this.splash = true;

      let rnd = random();
      if(rnd < 0.2){
        this.color1 = colors[2];
      }else{
        this.color1 = colors[1];
      }

    }

    if(this.splash == true){
      this.splashTime += (deltaTime / 1000.0);
      if(this.splashTime > this.splashMax){
        this.splashTime = 0;
        this.splash = false;
      }
    }

    if(this.splash == true){
      push();
      translate(this.prevPos.x, height - this.prevPos.y);
      let timeval = this.splashTime / this.splashMax;

      let col = color(this.color1);
      col.setAlpha(map(timeval, 0.0, 1.0, 255, 0));
      fill(col);
      let size = map(this.depthScale, 0.0, 1.0, 300, 100);
      ellipse(0,0, timeval * size, timeval * size / 5.0);
      pop();
    }
  }

  draw(){
    push();
    // let col = lerpColor(color(colors[1]), color(colors[0]), map(this.depthScale, 0.0, 1.0, 0.0, 0.5));
    fill(255, map(this.depthScale, 0.0, 1.0, 200, 20));
    fill(colors[0]);
    let dif = height - this.pos.y - this.pos.z;
    let thickness = map(this.depthScale, 0.0, 1.0, 3, 0.5);
    translate(this.pos.x, this.pos.z);
    let rainheight = map(this.depthScale, 0.0, 1.0, this.speed * 10, this.speed * 2);
    beginShape();
    vertex(-thickness, 0);
    vertex(thickness, 0);
    vertex(thickness, min(rainheight, dif));
    vertex(-thickness, min(rainheight, dif));
    endShape(CLOSE);
    pop();
  }
}
