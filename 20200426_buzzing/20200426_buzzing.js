let curTime = 0.0;
let population;

const ColorPalette = Object.freeze({
  "yellow" : "#fff5a5",
  "orange" : "#ffaa64",
  "darkorange" : "#ff8264",
  "red": "#ff6464",
  "lightblue" : "#97e5ef",
  "lightpurple" : "#efa8e4"
});


function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  ortho(-width/2, width/2, -height/2, height/2, 0.1, 10000);
  noStroke();

  camera(0, -1000, 2000, 0, 0, 0, 0, 1, 0);

  population = new Population();
}

function draw() {
  ambientLight(255);
  directionalLight(200, 200, 200, -1.0, 1.0, 0.3);

  population.update();
  population.draw();
}

function mousePressed(){
  population.updateBuzzer();
}

class Population{
  constructor(){
    this.boxes = [];
    this.buzzing = false;

    let xnum = floor(width / 150);
    let ynum = floor(height / 120);
    
    for(let n=-ynum; n<ynum; n++){
      for(let i=-xnum; i<xnum; i++){
        let size1 = createVector(90, 90, 30);
        let pos1 = createVector(size1.z * 2 * i + size1.z * 4 * n, 0, size1.z * 2 * i - size1.z * 4 * n);
        let box1 = new Box(pos1, size1, this);
        this.boxes.push(box1);

        let size2 = createVector(30, 90, 90);
        let pos2 = createVector(size2.x * 2 * i + size2.x * 4 * n + size2.x * 3, 0, size2.x * 2 * i - size2.x * 4 * n - size2.x);
        let box2 = new Box(pos2, size2, this);
        this.boxes.push(box2);
      }
    }
  }

  update(){
    let wave = true;
    for(let i=0; i<this.boxes.length; i++){
      this.boxes[i].update();
      if(this.boxes[i].waving == true){
        wave = false;
      }
    }

    if(wave && this.buzzing == false){
      this.updateBuzzer();
      this.buzzing = true;
    }
  }

  draw(){
    for(let i=0; i<this.boxes.length; i++){
      this.boxes[i].draw();
    }
  }

  updateBuzzer(){
    let box = this.boxes[floor(random(this.boxes.length))];
    box.buzzer = true;
  }

  createWave(pos){
    this.buzzing = false;
    let distrange = random(250, 500);
    let distrangerand = random(0, 50);
    let speed = random(15, 25);
    let speedrand = random(0, 3);
    for(let i=0; i<this.boxes.length; i++){
      let box = this.boxes[i];
      let dist = pos.dist(box.pos);
      box.updateWave(dist, distrange + random(-distrangerand, distrangerand), speed + random(-speedrand, speedrand));
    }
  }
}


class Box{
  constructor(pos, size, population){
    this.pos = pos;
    this.size = size;
    this.buzzer = false;
    this.scale = 1.0;
    this.thresh = 0.0;
    this.maxscale = 10.0;
    this.population = population;
    this.wavetime = 0.0;
    this.waving = false;
    this.wavedist = 0.0;
    this.distrange = 500;
    this.wavespeed = 20.0;
    this.origcol = lerpColor(color(ColorPalette.orange), color(ColorPalette.darkorange), 0.5);
    this.col = lerpColor(lerpColor(color(ColorPalette.lightpurple), color(ColorPalette.yellow), random()), color(ColorPalette.lightblue), random());
  }

  updateWave(dist, distrange, speed){
    this.waving = true;
    this.wavedist = dist;
    this.wavetime = 0.0;
    this.distrange = distrange;
    this.wavespeed = speed;
  }

  update(){
    if(this.buzzer){
      let heightscale = this.maxscale;
      if(this.thresh <= 1.0){
        this.thresh += 0.02;
        this.scale = map(pow(this.thresh, 3.0), 0.0, 1.0, 1.0, heightscale);
      } else if(this.thresh > 1.0 && this.thresh <= 2.0){
        this.scale = heightscale;
        this.thresh += 0.1;
      }else if(this.thresh > 2.0){
        this.thresh += 0.1;
        this.scale = map(pow(this.thresh-2.0, 0.5), 0.0, 1.0, heightscale, 1.0);
        if(this.thresh >= 3.0){
          this.thresh = 0.0;
          this.scale = 1.0;
          this.buzzer = false;
          this.population.createWave(this.pos);
        }
      }
    }else if(this.waving){
      this.wavetime += this.wavespeed;
      let h = this.wavedist - this.wavetime;

      if(h < -this.distrange){
        this.waving = false;
        this.wavetime = 0.0;
        this.scale = 1.0;
      }

      h = constrain(h, -this.distrange, this.distrange);
      let hang = map(h, this.distrange, -this.distrange, 0, 180);
      let waveh = map(sin(radians(hang)), 0.0, 1.0, 1.0, this.maxscale * 0.5);
      this.scale = waveh;
    }
  }

  draw(){
    push();
    rotateY(radians(45));
    fill(lerpColor(this.origcol, this.col, map(pow(this.scale, 1.2), 1.0, this.maxscale, 0.0, 1.0)));
    translate(this.pos.x, this.pos.y, this.pos.z);
    scale(1.0, this.scale, 1.0);
    box(this.size.x, this.size.y, this.size.z);
    pop();
  }
}