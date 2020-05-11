let renderer;
let castle;
let timeval;

const ColorPalette = Object.freeze({
	"dark": "#d63447",
  "light": "#f57b51",
  "shadow": "#ffe277",
  "shade" : "#ffe277",
  "white" : "#ffffff"
});

function setup() {
  renderer = createCanvas(windowWidth, windowHeight, WEBGL);

  ortho(-width/2, width/2, -height/2, height/2, 0.01, 10000);

  castle = new Castle();

}

function draw() {
  background(ColorPalette.shadow);

  let minval = -0.8;
  let maxval = 0.5;
  timeval =  map(constrain(sin(radians(frameCount * 1)), minval, maxval), minval, maxval, 0.0, 1.0);
  directionalLight(lerpColor(color(0), color(ColorPalette.shade), timeval), 0.5, 1.0, -1.0);
  ambientLight(lerpColor(color(255), color(220), timeval));

  if(timeval == 0){
    castle.setup();
  }
  castle.draw();

}

function easeOutElastic(x) {
  const c4 = (2 * Math.PI) / 3;
  
  return x === 0
    ? 0
    : x === 1
    ? 1
    : pow(2, -10 * x) * sin((x * 10 - 0.75) * c4) + 1;
  }

function easeInOutQuart(x) {
  return x < 0.5 ? 8 * x * x * x * x : 1 - pow(-2 * x + 2, 4) / 2;
  }

class Castle{
  constructor(){
    
    

    this.setup();
  }

  setup(){
    let gridsize = floor(random(10, 20));
    this.size = min(height, width) / gridsize * 1.7;
    this.x = gridsize;
    this.y = gridsize;

    this.positions = [];
    this.heights = [];
    this.stairinfos = [];
    this.windowinfos = [];

    for(let n=0; n<this.y; n++){
      let ii = 1;
      for(let i=0; i<this.x; i++){
        let pos = createVector(i * this.size, 0, n * this.size);
        this.positions.push(pos);
        if(pow(random(), 3) < 0.1){
          ii++;
        }
        let t = n / (this.y - 1.0);
        t = pow(t, 0.5);
        this.heights.push(this.size * ceil(max(ii * t, 1)));
      }
    }

    for(let n=0; n<this.y-1; n++){
      for(let i=0; i<this.x-1; i++){
        let index1 = n * this.x + i;
        let index2 = n * this.x + i + 1;
        let index3 = (n + 1) * this.x + i;
        let h1 = this.heights[index1];
        let h2 = this.heights[index2];
        let h3 = this.heights[index3];

        if(random() < 0.5){
          if(h1 + this.size == h2) {
            this.stairinfos.push([index1, 1, random()]);
          }
          else if(h1 + this.size == h3){
            this.stairinfos.push([index1, 0, random()]);
          }
        }
        
        let maxnum = 6;
        if(h1 < h2){
          for(let t=h1; t<h2-1; t+= this.size){
            if(random() < 0.3){
              let size = map(floor(random(1, maxnum)), 1, maxnum-1, 0.2, 0.4);
              this.windowinfos.push([index1, 1, t, size]);
            }
          }
        }
        if(h1 < h3){
          for(let t=h1; t<h3-1; t+= this.size){
            if(random() < 0.3){
              let size = map(floor(random(1, maxnum)), 1, maxnum-1, 0.2, 0.4);
              this.windowinfos.push([index1, 0, t, size]);
            }
          }
        }
      }
    }
  }

  draw(){
    // stroke(100);
    noStroke();
    
    push();
      rotateX(radians(150));
      rotateY(radians(-45));
      translate(- this.x * 0.5 * this.size,  - this.size * this.y * 0.2, - this.y * 0.5 * this.size);

      
      let scaleval = map(timeval, 0.0, 1.0, 0.0001, 1.0);
      scaleval = easeOutElastic(scaleval);
      scale(1.0, scaleval, 1.0);

      this.drawBlocks();
      
      for(let i=0; i<this.stairinfos.length; i++){
        let stairinfo = this.stairinfos[i];
        this.drawStairByIndex(stairinfo);
      }

      ambientMaterial(lerpColor(color(ColorPalette.shadow), color(ColorPalette.dark), timeval));
      for(let i=0; i<this.windowinfos.length; i++){
        let windowinfo = this.windowinfos[i];
        this.drawWindowByIndex(windowinfo);
      }
    pop();
  }

  drawBlocks(){
    for(let i=0; i<this.positions.length; i++){
      push();
        let pos = this.positions[i];
        let h = this.heights[i];
        let val = h / (this.y * this.size * 0.5);
        let col = lerpColor(color(ColorPalette.shadow), color(ColorPalette.light), val);
        col = lerpColor(color(ColorPalette.shadow), col, timeval);
        ambientMaterial(col);
        translate(pos.x , pos.y + h * 0.5 , pos.z );
        scale(this.size, h, this.size);
        box(1.0);
      pop();
    }
  }

  drawWindowByIndex(windowinfo){
    let index = windowinfo[0];
    let dir = windowinfo[1];
    let hadd = windowinfo[2];
    let sc = windowinfo[3];
    let h = this.heights[index];
    let pos = this.positions[index];

    
    push();
    translate(pos.x , pos.y + this.size * 0.5 + hadd, pos.z );
    rotateY(-HALF_PI * dir);
    translate(0,0, (-this.size * 0.5 + 0.1) * (dir - 0.5) * 2);
    plane(this.size * sc, this.size * sc);
    pop();
  }

  drawStairByIndex(stairinfo){
    let index = stairinfo[0];
    let dir = stairinfo[1];
    let shift = stairinfo[2];

    let pos = this.positions[index];
    let h = this.heights[index];

    let val = h / (this.y * this.size * 0.5);

    let num = 5;
    let stepsize = this.size / num;
    let col = lerpColor(color(ColorPalette.shadow), color(ColorPalette.light), val);
    col = lerpColor(color(ColorPalette.shadow), col, timeval);
    ambientMaterial(col);
    push();
      translate(pos.x, h + pos.y, pos.z );
      rotateY(HALF_PI * dir);
      translate(0,0,-this.size * 0.5);
      for(let i=1; i<num; i++){
        push();
          let minval = -0.5;
          let maxval = 0.5;
          let sanim = map(constrain(sin(radians(frameCount * 1) + shift * TWO_PI), minval, maxval), minval, maxval, 0, 1.0);
          sanim = max(0.0001, easeInOutQuart(sanim));
          translate(0,stepsize * i * 0.5 * sanim, stepsize * 0.5 + stepsize * i);
          scale(this.size, stepsize * i * sanim, stepsize);
          box(1.0);
        pop();
      }
    pop();
  }
}
