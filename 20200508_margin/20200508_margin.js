let renderer;
let backShader;
let curTime = 0.0;
let curtains = [];
let curtainnum = 10;

const ColorPalette = Object.freeze({
	"color1": "#00e0ff",
  "color2": "#74f9ff",
  "color3": "#a6fff2",
  "color4" : "#07689f"
});

function preload(){
  backShader = loadShader('assets/shader.vert', 'assets/shader.frag');
}

function setup() {
  renderer = createCanvas(windowWidth, windowHeight, WEBGL);
  
  pixelDensity(1.0);

  let hlen = height * 2.5;
  for(let i=0; i<curtainnum; i++){
    let curtain = new Curtain(-hlen * 0.5 + i / (curtainnum- 1.0) * hlen);
    curtains.push(curtain);
  }
}

function draw() {
  background(ColorPalette.color3);

  if(frameCount < 5){
    backShader.setUniform("u_resolution", [width, height]);
    backShader.setUniform("u_col1", color(ColorPalette.color1)._array);
    backShader.setUniform("u_col2", color(ColorPalette.color3)._array);
    backShader.setUniform("u_col3", color(ColorPalette.color4)._array);
  }
  backShader.setUniform("u_time", curTime);
  ortho(-width / 2, width / 2, -height / 2, height / 2, 0, 50000);
  directionalLight(250, 250, 250, -0.5, 0.5, -1.0);
  ambientLight(50);
  
  camera(0, 2500, -(height/2.0) / tan(PI*30.0 / 180.0)* 2, 0, 0, 0, 0, -1, 0);
  
  push();
  rotateZ(radians(45));
  for(let i=0; i < curtains.length; i++){
    let curtain = curtains[i];
    curtain.update();
    curtain.draw();
  }
  pop();

  curTime += deltaTime * 0.001;
}

class Curtain{
  constructor(ypos){
    this.ypos = ypos;
    this.points = [];
    this.shift = random() * TWO_PI;
    this.waveheight= height / curtainnum * 2;

    let res = 200;
    let wlen = width * 2;
    for(let i=0; i<res; i++){
      let pos = createVector(- wlen * 0.5 + wlen * i / (res - 1.0), ypos, 0);
      this.points.push(pos);
    }
  }

  update(){
    noiseDetail(2, 0.65);
    
    for(let i=0; i< this.points.length; i++){
      let t = i / (this.points.length - 1.0);
      let ang = TWO_PI * t * 10.0 + this.shift;
      
      this.points[i].y = this.ypos + pow(abs(sin(ang)), 0.5) * abs(sin(ang)) / sin(ang) * this.waveheight * map(pow(noise(t * 10 + curTime + this.shift, this.points[i].x * 0.001, this.ypos * 0.02), 1), 0, 1, -1, 1);
    }
  }

  draw(){
    let geom = new p5.Geometry();
    for(let i=0; i<this.points.length; i++){
      let pos = this.points[i];
      geom.vertices.push(pos);
      geom.vertices.push(p5.Vector.add(pos, createVector(0,0,height * 0.5)));
      geom.uvs.push([i / (this.points.length -1), 0]);
      geom.uvs.push([i / (this.points.length -1), 1]);
      
      if(i < this.points.length -1){
        geom.faces.push([i * 2, i * 2 + 1, (i+1) * 2 + 1]);
        geom.faces.push([i * 2, (i+1) * 2 + 1, (i+1) * 2]);
      }
    }
    geom.computeNormals();

    shader(backShader);
    renderer.createBuffers(name, geom);
    renderer.drawBuffers(name);
  }
}