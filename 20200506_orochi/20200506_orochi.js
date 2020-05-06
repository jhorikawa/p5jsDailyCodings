let renderer;
let backShader;
let curTime = 0.0;
let shift;

const ColorPalette = Object.freeze({
	"color1": "#fe346e",
  "color2": "#381460",
  "color3": "#381460",
  "color4" : "#ffbd69"
});

function preload(){
  backShader = loadShader('assets/shader.vert', 'assets/shader.frag');
}

function setup() {
  renderer = createCanvas(windowWidth, windowHeight, WEBGL);

  pixelDensity(2.0);
  noStroke();

  shift = TWO_PI * random();
}

function draw() {
  background(ColorPalette.color1);

  if(frameCount < 5){
    backShader.setUniform("u_resolution", [width, height]);
    backShader.setUniform("u_col1", color(ColorPalette.color2)._array);
    backShader.setUniform("u_col2", color(ColorPalette.color3)._array);
    backShader.setUniform("u_col3", color(ColorPalette.color4)._array);
  }
  backShader.setUniform("u_time", curTime);

  directionalLight(250, 250, 250, -0.5, 0.5, -1.0);
  ambientLight(50);
  
  let baseang = 137.5;
  for(let i=0; i<8; i++){
    let angmult1 = map(sin(radians(frameCount * 1 + i * baseang)), -1.0, 1.0, 1.1, 1.6);
    let angmult2 = map(sin(radians(frameCount * 2 + i * baseang) + shift), -1.0, 1.0, 1.5, 2.0);
    let angmult3 = map(sin(radians(frameCount * 5 + i * baseang) + shift * 1.5), -1.0, 1.0, 0.5, 1.0);
    let rad1 = map(sin(radians(frameCount * 2 + i * baseang)), -1.0, 1.0, 100, 200)
    let rad2 = map(sin(radians(frameCount * 3 + i * baseang) + shift), -1.0, 1.0, -120, -100)
    let rad3 = map(sin(radians(frameCount * 5 + i * baseang) + shift * 1.5), -1.0, 1.0, -50, 50)
    push();
    rotateY(PI / 7.0 * i);
    drawSnake(
      createVector(0, height * 0.4),
      HALF_PI, 
      [HALF_PI * angmult1, -HALF_PI * angmult2, HALF_PI * angmult3],
      [rad1, rad2, rad3],
      50
    );
    pop();
  }
  curTime += deltaTime * 0.001;
}

function drawSnake(startpos, startang, arcangs, radiuses, maxdetail){
  let totalpoints = [];
  for(let i=0; i<arcangs.length; i++){
    let arcang = arcangs[i];
    let radius = radiuses[i];

    let arcinfo = drawArc(startpos, startang, arcang, radius, maxdetail);
    startpos = arcinfo.points[arcinfo.points.length - 1];
    startang = arcinfo.lastang;

    if(totalpoints.length > 1){
      arcinfo.points.shift();
    }
    totalpoints = totalpoints.concat(arcinfo.points);
  }

  shader(backShader);
  pipe(totalpoints, 12, 100.0, "custom");
}


function drawArc(startpos, startang, arcang, radius, maxdetail){
  detail = ceil(radius * arcang * 0.1);

  let offsetpos = createVector(cos(startang) * radius, sin(startang) * radius);
  let points = [];
  let lastang = 0;

  for(let i=0; i<detail; i++){
    let ang = startang + arcang * i / (detail - 1.0);
    let x = startpos.x + cos(ang) * radius - offsetpos.x;
    let y = startpos.y + sin(ang) * radius - offsetpos.y;
    let pos = createVector(x, y);
    points.push(pos);
    lastang = ang;
  }

  return {
    "points" : points,
    "lastang" : lastang
  }
}

function rotateVector(vec, axis, ang){
  var quaternion = new THREE.Quaternion();
  quaternion.setFromAxisAngle(new THREE.Vector3(axis.x, axis.y, axis.z), ang);
  var vec3 = new THREE.Vector3(vec.x, vec.y, vec.z);
  vec3.applyQuaternion(quaternion);
  return createVector(vec3.x, vec3.y, vec3.z);
}

function pipe(points, rotres, thickness, name){
  let geom = new p5.Geometry();
  let allpoints = [];
  for(let i=0; i<points.length-1; i++){
    let t = i / (points.length -2);
    let pos1 = points[i];
    let pos2 = points[i+1];

    let dir = p5.Vector.sub(pos2, pos1);
    dir.normalize();

    let tup = p5.Vector.sub(pos1, createVector(0, 0, 0));
    tup.normalize();
    let pdir = p5.Vector.cross(dir, tup);
    pdir = createVector(0,0,1);

    let rpoints = [];
    let thicknesst = map(pow(t, 0.5), 0.0, 1.0, 1.0, 0.01);
    for(let n=0; n < rotres; n++){
      let rotang = TWO_PI / rotres * n;
      let rotdir = rotateVector(pdir, dir, rotang);
      rotdir.normalize();
      rotdir.mult(thickness * thicknesst);
      let rpos = p5.Vector.add(pos1, rotdir);
      geom.vertices.push(rpos);
      geom.uvs.push([i / (points.length -2), n / rotres]);
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
  renderer.createBuffers(name, geom);
  renderer.drawBuffers(name);

  return geom;
}