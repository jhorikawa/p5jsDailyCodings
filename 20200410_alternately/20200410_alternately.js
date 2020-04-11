let backShader;
let shaderTexture;
let grid;

const ColorPalette = Object.freeze({
  "red": "#f76a8c",
  "orange" : "#f8dc88",
  "yellow" : "#f8fab8",
  "blue": "#ccf0e1",
  "sea": "#8ec6c5"
});

function preload(){
  backShader = loadShader('assets/back.vert', 'assets/back.frag');
}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  pixelDensity(2);
  ortho(-width / 2, width / 2, height / 2, -height / 2, 0, 5000);
  shaderTexture = createGraphics(128, 128, WEBGL);
  shaderTexture.noStroke();
  shaderTexture.shader(backShader);

  grid = new Grid(150.0);
}

function draw() {
  background(color(ColorPalette.red));

  backShader.setUniform('u_resolution', [shaderTexture.width * 2, shaderTexture.height * 2]);
  backShader.setUniform('u_time', radians(frameCount));

  grid.draw();
}

class Grid{
  constructor(size){
    this.size = size;
    this.positions = [];
    this.circles = [];

    this.setup();
  }

  setup(){
    let xstep = this.size;
    let ystep = this.size * sin(radians(60.0));
    let txstep = xstep * 0.5;
    let tystep = xstep / (2 * tan(radians(60.0)));
    for(let t=0; t<2; t++){
      for(let i=-1; i< ceil(width / this.size) + 2; i++){
        for(let n=-1; n < ceil(height / ystep) + 2; n++){
          let pos = createVector(-width * 0.5 + xstep * i + n % 2 * xstep * 0.5 + t * txstep, -height * 0.5 + ystep * n + t * tystep);
          this.positions.push(pos);
          let flip = true;
          let col = lerpColor(color(ColorPalette.yellow), color(ColorPalette.orange), random());
          if(t == 1){
            flip = false;
            col = lerpColor(color(ColorPalette.blue), color(ColorPalette.sea), random());
          }
          

          let circle = new Circle(pos, this.size, flip, col);
          this.circles.push(circle);
        }
      }
    }
  }

  update(){

  }

  draw(){
    for(let i=0; i<this.circles.length; i++){
      let circle = this.circles[i];
      circle.draw();
    }
  }
}

class Circle{
  constructor(pos, size, flip, color){
    this.pos = pos;
    this.size = size;
    this.flip = flip;
    this.color = color;
  }

  draw(){
    noStroke();
    fill(255, 50);
    let val = map(sin(radians(frameCount * 5)), -1.0, 1.0, 0.0, 1.0);
    let esize = this.size;
    let scale = map(sin(this.pos.mag() / max(width, height) * PI * 5.0 - radians(frameCount * 5)), -1.0, 1.0, 0.0, 1.0);
    backShader.setUniform('u_scale', scale);
    backShader.setUniform('u_color', this.color._array);
    
    shaderTexture.rect(-shaderTexture.width,-shaderTexture.height,shaderTexture.width * 2, shaderTexture.height * 2);
    
    texture(shaderTexture)
    push();
    translate(this.pos.x, this.pos.y);
    if(this.flip){
      rotate(radians(60));
    }
    ellipse(0, 0, esize, esize);
    pop();
  }
}
