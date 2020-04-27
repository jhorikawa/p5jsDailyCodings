let renderer;
let font;

let textPg;
let textWidth;
let textHeight;
let neons = [];

const ColorPalette = Object.freeze({
  "back" : "#120136",
  "red" : "#f35588",
  "orange" : "#ffac41",
  "blue": "#00a8cc"
});

function preload(){
  font = loadFont('assets/NotoSansJP-Black.otf');
}

function setup() {
  renderer = createCanvas(windowWidth, windowHeight, WEBGL);
  ortho();
  noStroke();
  textFont(font);
  textSize(60);

  textWidth = width;
  textHeight = textWidth * 0.2;

  textPg = createGraphics(textWidth, textHeight);
  textPg.noFill();
  
  textPg.push();
  textPg.scale(1.0, -1.0, 1.0);
  let txt = "neon city";
  let txtSize = textHeight / txt.length * 8.0;
  textPg.textFont(font);
  textPg.textSize(txtSize);
  textPg.textAlign(CENTER, CENTER);
  let num = 5;
  for(let n=0; n<2; n++){
    for(let i=0; i<num; i++){
      let t = i / (num-1);
      let thickness = map(t, 0.0, 1.0, 50.0, 1.0);
      let alpha = map(max(t, 0.7), 0.7, 1.0, 0.0, 1.0);
      alpha = pow(alpha, 1.5);
      let col = lerpColor(color(ColorPalette.blue), color(ColorPalette.red), n);
      col = lerpColor(color(col._getRed(), col._getGreen(), col._getBlue(),0), col, alpha);
      textPg.stroke(col);
      textPg.strokeWeight(thickness);
      textPg.text(txt, textWidth * 0.5 + 5.0 * (n - 0.5) * 2, -textHeight * 0.5 - txtSize * 0.25 - 5.0 * (n - 0.5) * 2);
    }
  }


  for(let n=-1; n<=1; n++){
    for(let i=-1; i <= 1; i++){
      let rad = min(width, height) * 0.3;
      let pos = createVector(i * rad * 1.5, n * rad * 1.5);
      let neon = new Neon(pos, rad, random(-0.5, 0.5));
      neons.push(neon);
    }
  }

  var gl = document.getElementById('defaultCanvas0').getContext('webgl');
  gl.disable(gl.DEPTH_TEST);
}

function draw() {
  background(ColorPalette.back);

  for(let i=0; i<neons.length; i++){
    let neon = neons[i];
    neon.draw();
  }
}

function rotateVector(vec, axis, ang){
  var quaternion = new THREE.Quaternion();
  quaternion.setFromAxisAngle(new THREE.Vector3(axis.x, axis.y, axis.z), ang);
  var vec3 = new THREE.Vector3(vec.x, vec.y, vec.z);
  vec3.applyQuaternion(quaternion);
  return createVector(vec3.x, vec3.y, vec3.z);
}

class Neon{
  constructor(pos, rad, speed){
    this.pos = pos;
    this.rad = rad;
    this.ang1 = TWO_PI * random();
    this.ang2 = TWO_PI * random();
    this.ang3 = TWO_PI * random();
    this.rotnum = floor(random(1, 3));
    this.speed = speed;
  }

  draw(){

    push();
    translate(this.pos.x, this.pos.y, this.pos.z);
    rotateX(this.ang1);
    rotateY(this.ang2);
    rotateZ(this.ang3);

    let res = 60;
    
    let len = this.rad * 1.0;
    let dety = 20;

    let geom = new p5.Geometry();
    for(let i=0; i<res; i++){
      let ti = i / (res-1);
      let ang = ti * TWO_PI + radians(frameCount * this.speed);

      let dir = createVector(cos(ang), sin(ang), 0.0);
      let axis = createVector(cos(ang + HALF_PI), sin(ang + HALF_PI), 0.0);
      let tdir = rotateVector(dir, axis, ang * this.rotnum);

      let pos = createVector(dir.x * this.rad, dir.y * this.rad, 0.0);
      let pos1 = p5.Vector.add(pos, p5.Vector.mult(tdir, -len * 0.5));

      for(let n=0; n < dety; n++){
        let tn = n / (dety-1);
        let npos = p5.Vector.add(pos1, p5.Vector.mult(tdir, len * tn));
        geom.vertices.push(npos);
        geom.uvs.push([ti, tn]);

        if(n < dety - 1){
          let fid1 = i * dety + n;
          let fid2 = i * dety + n + 1;
          let fid3 = (i + 1) % res * dety + n;
          let fid4 = (i + 1) % res * dety + n + 1;

          if(i < res-1){
            geom.faces.push([fid1, fid2, fid3]);
            geom.faces.push([fid3, fid2, fid4]);
          }
        }
      }
    }
    
    geom.computeNormals();
    texture(textPg);
    renderer.createBuffers('custom', geom);
    renderer.drawBuffers('custom');

    pop();
  }
}