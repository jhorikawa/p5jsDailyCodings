let eggShader;
let curTime = 0.0;
let eggs = [];

const ColorPalette = Object.freeze({
  "darkblue" : "#769fcd",
  "blue" : "#b9d7ea",
  "lightblue": "#d6e6f2",
  "white": "#f7fbfc",
  "red" : "#ff847c",
  "yellow" : "#fdffab"
});

function preload(){
  eggShader = loadShader('assets/shader.vert', 'assets/shader.frag');
}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  pixelDensity(1);
  noStroke();

  
  for(let i=0; i<4; i++){
    for(let n = 0; n<3; n++){
      let stepx = width / 5.0;
      let stepy = height / 3.5;

      let pos = createVector(-width * 0.5 + stepx + stepx * i, -height * 0.5 + stepy*0.75 + stepy * n, 0.0);
      let egg = new Egg(pos, stepy * 0.3, random(0.01, 0.02), pow(random(0.0, 0.7), 1.5), random(5.0, 20.0));
      eggs.push(egg);
    }
  }

}

function draw() {
  background(ColorPalette.darkblue);
  if(frameCount < 5){
    var gl = document.getElementById('defaultCanvas0').getContext('webgl');

    gl.disable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    eggShader.setUniform('u_resolution', [512, 512]);
  }

  eggShader.setUniform('u_time', curTime);



  for(let i=0; i<eggs.length; i++){
    let egg = eggs[i];
    egg.draw();
  }


  curTime += deltaTime * 0.001;
}

class Egg{
  constructor(pos, rad, res, show, smooth){
    this.pos = pos;
    this.rad = rad;
    this.res = res;
    this.show = show;
    this.smooth = smooth;
    this.seed = random();
    this.yolkcol = lerpColor(color(ColorPalette.red), color(ColorPalette.yellow), this.show * 2.0);
    this.shellcol = lerpColor(color(ColorPalette.blue), color(ColorPalette.white), random())
  }

  draw(){
    eggShader.setUniform('u_res', this.res);
    eggShader.setUniform('u_show', this.show);
    eggShader.setUniform('u_smooth', this.smooth);
    eggShader.setUniform('u_seed', this.seed);
    eggShader.setUniform('u_col', this.shellcol._array);
    eggShader.setUniform('u_ycol', this.yolkcol._array);

    fill(this.yolkcol);
    push();
    translate(this.pos.x, this.pos.y, this.pos.z);
    push();
    translate(0.0, -this.rad * 0.25 + sin((1.0-map(this.show, 0.0, 0.7, 0.0, 1.0)) * curTime * 20) * this.rad * 0.1, 0.0);
    sphere(this.rad * 0.5);
    pop();

    

    shader(eggShader);
    sphere(this.rad);
    resetShader();

    pop();
  }
}
