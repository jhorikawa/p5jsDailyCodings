let backShader;
let wavedepth = -500;
let shaderTexture;
let pipenum = 25;
let pipes = [];

const ColorPalette = Object.freeze({
  "black": "#3c415e",
  "grey" : "#738598",
  "white" : "#dfe2e2",
	"blue": "#7189bf",
	"pink": "#df7599",
	"orange": "#ffc785", 
	"green": "#72d6c9"
});

function preload(){
  backShader = loadShader('assets/back.vert', 'assets/back.frag');
}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  ortho(-width / 2, width / 2, height / 2, -height / 2, 0, 5000);
  shaderTexture = createGraphics(256, 256, WEBGL);
  shaderTexture.noStroke();

  for(let i=0; i<pipenum; i++){
    let w = width * random(-0.5, 0.5);
    let s = random(0.1, 0.4);
    let e = s + random(0.2, 0.6);
    let depth = 0;//random(0,wavedepth);
    let curlwidth = random(wavedepth * 0.05, wavedepth * 0.25) ;
    let col = random();
    let frontColor = lerpColor(color(ColorPalette.white), color(ColorPalette.white), 0);
    let backColor;
    if(col < 0.5){
      backColor = lerpColor(color(ColorPalette.pink), color(ColorPalette.orange), col);//depth / wavedepth);
    }else{
      backColor = lerpColor(color(ColorPalette.blue), color(ColorPalette.green), col);
    }

    let pipe = new Pipe(
      createVector(w, -height * 0.5 - 50, depth * 2), 
      createVector(w, height * 0.5 + 50, depth * 2), 
      5, 
      HALF_PI * floor(random(0, 4.0)), 
      s, 
      e, 
      curlwidth, 
      floor(random(3, 6)), 
      random(2, 10), 
      random(0.1, 0.4),
      frontColor, 
      backColor
    );
    pipes.push(pipe);
  }
}

function draw() {
  background(color(ColorPalette.grey));

  if(frameCount < 3){
    backShader.setUniform('u_resolution', [shaderTexture.width * 2, shaderTexture.height * 2]);
  }

  backShader.setUniform('u_time', radians(frameCount));
  
  for(let i=0; i<pipes.length; i++){
    let pipe = pipes[i];
    pipe.draw();
  }
}

class Pipe{
  constructor(start, end, stepdist, offsetang, curlstart, curlend, curlrad, curlnum, thickness, speed, colorfront, colorback){
    this.start = start;
    this.end = end;
    this.stepdist = stepdist;
    this.offsetang = offsetang;
    this.curlstart = curlstart;
    this.curlend = curlend;
    this.curlrad = curlrad;
    this.curlnum = curlnum;
    this.thickness = thickness;
    this.colorback = colorback;
    this.colorfront = colorfront;
    this.verts = [];
    this.polyverts = [];
    this.length = p5.Vector.dist(this.start, this.end);
    this.shift = random();
    this.randdir = 1;
    if(random() < 0.5){
      this.randdir = -1;
    }
    this.speed = speed;
    this.liqlen = 0.5;

    this.setup();
  }

  setup(){
    this.basepoints();
    this.smooth(5);
    this.poly();
  }

  draw(){
    backShader.setUniform('u_colorfront', this.colorfront._array);
    backShader.setUniform('u_colorback', this.colorback._array);
    backShader.setUniform('u_shift', this.shift);
    backShader.setUniform('u_speed', this.speed);
    backShader.setUniform('u_liqlen', this.liqlen);
    backShader.setUniform('u_dir', this.randdir);
    shaderTexture.shader(backShader);
    shaderTexture.rect(-width,-height,width * 2, height * 2);
    
    texture(shaderTexture);

    beginShape(TRIANGLE_STRIP);
    for(let i=0; i<this.polyverts.length; i++){
      let polyvert = this.polyverts[i];
      let val = (floor(i / 2.0) / (this.polyverts.length / 2.0 - 1.0)) * shaderTexture.width;
      if(i % 2 == 0){
        vertex(polyvert.x, polyvert.y, polyvert.z, val, 0.0);
      }else{
        vertex(polyvert.x, polyvert.y, polyvert.z, val, shaderTexture.height)
      }
    }
    endShape();
  }

  basepoints(){
    let lastpos = this.start.copy();
    let lastheight = 0;
    let lastdepth = 0;
    let wavenum = 2;
    let stepang = this.stepdist / (this.length * (this.curlend - this.curlstart)) * TWO_PI * wavenum;
    let dir = p5.Vector.sub(this.end, this.start);
    dir.normalize();
    let pdir = dir.copy();
    pdir.rotate(HALF_PI);
    let ddir = createVector(0,0,1);
    while(p5.Vector.dist(lastpos, this.start) < this.length){
      let npos = lastpos.copy();
      npos.add(p5.Vector.mult(pdir, lastheight));
      npos.add(p5.Vector.mult(ddir, lastdepth));
      this.verts.push(npos);

      if(p5.Vector.dist(lastpos, this.start) > this.length * this.curlstart && p5.Vector.dist(lastpos, this.start) < this.length * this.curlend ){
        let ang = map(p5.Vector.dist(lastpos, this.start), this.length * this.curlstart, this.length * this.curlend, 0, TWO_PI * wavenum);
        let wheight = sin(ang + this.offsetang) * this.curlrad;
        let wdepth = cos(ang + this.offsetang) * this.curlrad;
        lastheight = wheight;
        lastdepth = wdepth;
        let xdir = p5.Vector.mult(dir, this.stepdist * cos(stepang));
        lastpos.add(xdir);
      }else{
        lastheight = 0;
        lastdepth = 0;
        let xdir = p5.Vector.mult(dir, this.stepdist * 2);
        lastpos.add(xdir);
      }
    }
  }

  smooth(ite){
    for(let n=0; n<ite; n++){
      for(let i=1; i<this.verts.length-1; i++){
        let vert0 = this.verts[i-1].copy();
        let vert1 = this.verts[i].copy();
        let vert2 = this.verts[i + 1].copy();

        let dir02 = p5.Vector.add(vert2, vert0);
        dir02.mult(0.5);
        let dir = p5.Vector.sub(dir02, vert1);
        dir.mult(0.25);
        dir.add(vert1);
        this.verts[i] = dir;
      }
    }
  }

  poly(){
    for(let i=1; i<this.verts.length-1; i++){
      let vert0 = this.verts[i-1];
      let vert1 = this.verts[i];
      let vert2 = this.verts[i+1];

      let dir12 = vert2.copy();
      dir12.sub(vert1);
      let dir01 = vert1.copy();
      dir01.sub(vert0);

      dir12.rotate(HALF_PI);
      dir01.rotate(HALF_PI);
      dir12.normalize();
      dir01.normalize();

      let dir1 = p5.Vector.add(dir01, dir12);
      dir1.normalize();
      dir1.mult(this.thickness);
      let dir2 = dir1.copy();
      dir2.mult(-1);

      let pos1 = p5.Vector.add(vert1, dir1);
      let pos2 = p5.Vector.add(vert1, dir2);

      let u = map(i, 1, this.verts.length - 2, 0, 1.0);
      this.polyverts.push(pos1);
      this.polyverts.push(pos2);
    }
  }
}


