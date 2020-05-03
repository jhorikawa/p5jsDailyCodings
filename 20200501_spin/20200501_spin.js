let renderer;
let backShader;
let spinner;
let curTime = 0.0;

const ColorPalette = Object.freeze({
	"color1": "#ffd868",
  "color2": "#b80d57",
  "color3": "#f8615a",
  "color4" : "#ffd868"
});

function preload(){
  backShader = loadShader('assets/shader.vert', 'assets/shader.frag');
}

function setup() {
  renderer = createCanvas(windowWidth, windowHeight, WEBGL);

  pixelDensity(1.0);
  noStroke();

  camera(0, 0, (height/2.0) / tan(PI*30.0 / 180.0), 0, 0, 0, 0, 1, 0);
  let eyeZ =  ((height/2.0) / tan(PI * 60.0/360.0));
  perspective(PI/3.0, width/height, eyeZ/10.0, eyeZ * 10.0);

  spinner = new Spinner();
}

function draw() {
  background(ColorPalette.color1);

  if(frameCount < 5){
    backShader.setUniform("u_resolution", [width, height]);
    backShader.setUniform("u_campos", [0, 0, (height/2.0) / tan(PI*30.0 / 180.0)]);
    backShader.setUniform("u_col1", color(ColorPalette.color2)._array);
    backShader.setUniform("u_col2", color(ColorPalette.color3)._array);
    backShader.setUniform("u_col3", color(ColorPalette.color4)._array);
  }
  

  shader(backShader);
  rotateZ(-HALF_PI * 0.25);
  spinner.update();
  spinner.draw();

  curTime += deltaTime * 0.001;
}

function rotateVector(vec, axis, ang){
  var quaternion = new THREE.Quaternion();
  quaternion.setFromAxisAngle(new THREE.Vector3(axis.x, axis.y, axis.z), ang);
  var vec3 = new THREE.Vector3(vec.x, vec.y, vec.z);
  vec3.applyQuaternion(quaternion);
  return createVector(vec3.x, vec3.y, vec3.z);
}

class Spinner{
  constructor(){
    this.points = [];
    this.thickness = 20.0;
    this.radius = height * 0.25;
    this.speed = 300.0;
    this.shiftspeed = 300.0;
    this.wavenum = 2.0;
    this.offset = width * 0.4;
    this.spinnum = 10.0;
    this.rotres = 12;
    this.wholewidth = width + this.offset;
    let res = 300;

    for(let i=0; i<=res; i++){
      let pos = createVector(-this.wholewidth * 0.5 + this.wholewidth / (res-1) * i, 0, 0);
      this.points.push(pos);
    }
  }

  update(){
    let speedscale = 0.2;
    this.thickness = height * 0.03 * map(sin(radians(curTime * this.speed * speedscale)), -1.0, 1.0, 0.2, 1.0);
    this.spinnum = map(sin(radians(curTime * this.speed * speedscale)), -1.0, 1.0, 6, 12);

    for(let i=0; i<this.points.length; i++){
      let ang = TWO_PI * this.spinnum * i / this.points.length + radians(curTime * this.speed);
      let offsetang = i / this.points.length * TWO_PI * this.wavenum;
      let x = cos(ang) * this.radius * map(sin(offsetang + radians(curTime * this.shiftspeed * 0.5)), -1.0, 1.0, 0.2, 1.0);
      let y = sin(ang) * this.radius * map(sin(offsetang + radians(curTime * this.shiftspeed * 0.5)), -1.0, 1.0, 0.2, 1.0);
      this.points[i].y = x;
      this.points[i].z = y;
    }
  }

  draw(){
    let geom = new p5.Geometry();
    let allpoints = [];
    for(let i=0; i<this.points.length-1; i++){
      let pos1 = this.points[i];
      let pos2 = this.points[i+1];

      let dir = p5.Vector.sub(pos2, pos1);
      dir.normalize();

      let tup = p5.Vector.sub(pos1, createVector(pos1.x, 0, 0));
      tup.normalize();
      let pdir = p5.Vector.cross(dir, tup);

      let rpoints = [];
      for(let n=0; n < this.rotres; n++){
        let rotang = TWO_PI / this.rotres * n;
        let rotdir = rotateVector(pdir, dir, rotang);
        rotdir.normalize();
        rotdir.mult(this.thickness);
        let rpos = p5.Vector.add(pos1, rotdir);
        geom.vertices.push(rpos);
        geom.uvs.push([i / (this.points.length -2), n / this.rotres]);
        rpoints.push(geom.vertices.length - 1);
      }
      allpoints.push(rpoints);
    }

    for(let i=0; i<allpoints.length-1; i++){
      let rpoints1 = allpoints[i];
      let rpoints2 = allpoints[i+1];

      for(let n=0; n<rpoints1.length; n++){
        let rpt1 = rpoints1[n];
        let rpt2 = rpoints1[(n+1) % rpoints1.length];
        let rpt3 = rpoints2[n];
        let rpt4 = rpoints2[(n+1) % rpoints1.length];

        geom.faces.push([rpt1, rpt2, rpt4]);
        geom.faces.push([rpt4, rpt3, rpt1]);
      }
    }


    geom.computeNormals();
    renderer.createBuffers('custom', geom);
    renderer.drawBuffers('custom');
  }
}