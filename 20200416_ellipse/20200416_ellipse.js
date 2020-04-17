let pattern;
let tval = 0.0;

const ColorPalette = Object.freeze({
  "blue": "#07689f",
  "lightblue" : "#a2d5f2",
  "white" : "#fafafa",
  "orange": "#ff7e67"
});


function setup() {
  createCanvas(windowWidth, windowHeight);
  noStroke();

  pattern = new Pattern(20.0);
}

function draw() {
  tval = map(sin(radians(5.0 * frameCount)), -1.0, 1.0, 0, 1.0);

  background(lerpColor(color(ColorPalette.blue), color(ColorPalette.orange), tval));

  
  pattern.update();
  pattern.draw();
}

class Pattern{
  constructor(size){
    this.size = size;
    this.part = new Part(this.size);
    this.positions1 = [];
    this.positions2 = [];

    this.xsize = ceil(width / (5 * this.size)) + 1;
    this.ysize = ceil(height / (5 * this.size)) + 1;

    let step = 4 * this.size / cos(radians(45.0));
    for(let i=-1; i<this.xsize; i++){
      for(let n=-1; n<this.ysize; n++){
        let pos1 = createVector( i * step, n * step);
        this.positions1.push(pos1);


        let pos2 = createVector( i * step  + step * 0.5, n * step + step * 0.5);
        this.positions2.push(pos2);
      }
    }
  }

  update(){
    this.part.update();
  }

  draw(){
    push();

    let col1 = lerpColor(color(ColorPalette.orange), color(ColorPalette.white), tval);
    fill(col1);
    for(let i=0; i<this.positions1.length; i++){
      let pos = this.positions1[i];
      this.part.draw(pos, radians(45));
    }

    let col2 = lerpColor(color(ColorPalette.white), color(ColorPalette.blue), tval);
    fill(col2);
    for(let i=0; i<this.positions2.length; i++){
      let pos = this.positions2[i];
      this.part.draw(pos, radians(-45));
    }
    pop();
  }
}

class Part{
  constructor(size){
    this.size = size;
    this.vertsList = [];
    this.curVerts1 = [];
    this.curVerts2 = [];

    this.initParts();
  }

  update(){
    let t = tval * (this.vertsList.length-1);
    let tlerpval = t % 1.0;
    let tindex = floor(t);
    
    if(tindex < this.vertsList.length - 1.0){
      this.curVerts1 = [];
      let verts1 = this.vertsList[tindex];
      let verts2 = this.vertsList[tindex + 1];

      for(let i=0; i<verts1.length; i++){
        let vert1 = verts1[i];
        let vert2 = verts2[i];
        let lerpVert = p5.Vector.lerp(vert1, vert2, tlerpval);
        this.curVerts1.push(lerpVert);
      }
    }

    if(tindex < this.vertsList.length - 1.0){
      this.curVerts2 = [];
      let verts1 = this.vertsList[this.vertsList.length - 1.0 - tindex];
      let verts2 = this.vertsList[this.vertsList.length - 2.0 - tindex];

      for(let i=0; i<verts1.length; i++){
        let vert1 = verts1[i];
        let vert2 = verts2[i];
        let lerpVert = p5.Vector.lerp(vert1, vert2, tlerpval);
        this.curVerts2.push(lerpVert);
      }
    }
  }

  draw(pos, ang){
    push();
    translate(pos.x, pos.y);
    rotate(ang);
    
    for(let n=-1; n<=1; n+=2){
      push();
      scale(n, 1.0);
      for(let i=-1; i<=1; i+=2){
        push();
        scale(1.0, i);
        translate(-this.size * 2.0, 0);
        beginShape();
        for(let i=0; i<this.curVerts1.length; i++){
          let curVert1 = this.curVerts1[i];
          vertex(curVert1.x, curVert1.y);
        }
        endShape(CLOSE);
        pop();

        push();
        scale(1.0, i);
        translate(-this.size * 2.0, 0);
        scale(-1.0, 1.0);
        beginShape();
        for(let i=0; i<this.curVerts2.length; i++){
          let curVert2 = this.curVerts2[i];
          vertex(curVert2.x, curVert2.y);
        }
        endShape(CLOSE);
        pop();
      }
      pop();
    }
    pop();
  }

  initParts(){
    let res = 12;
    let bang = acos((this.size * 2.0) / (this.size * 3.0));
    let yoffset = 1.0;
    let xoffset = -1.0;

    // part 1
    let part1Verts = [];
    part1Verts.push(createVector(xoffset,yoffset))
    for(let i=0; i<res; i++){
      let ang = map(i, 0, res-1.0, PI - bang, PI);
      let x = -cos(ang) * this.size * 3.0 * 0.8 - this.size * 2.0;
      let y = -sin(ang) * this.size;
      part1Verts.push(createVector(x + xoffset, y + yoffset));
    }
    part1Verts.push(createVector(this.size - xoffset, yoffset));
    this.vertsList.push(part1Verts);

    // part 2
    let part2Verts = [];
    part2Verts.push(createVector(xoffset,yoffset))
    for(let i=0; i<res; i++){
      let ang = map(i, 0, res-1, -HALF_PI, 0);
      let x = cos(ang) * this.size;
      let y = sin(ang) * this.size;
      part2Verts.push(createVector(x + xoffset, y + yoffset));
    }
    part2Verts.push(createVector(this.size - xoffset, yoffset));
    this.vertsList.push(part2Verts);

    // part 3
    let part3Verts = [];
    part3Verts.push(createVector(xoffset,yoffset))
    for(let i=0; i<res; i++){
      let ang = map(i, 0, res-1.0, 0, PI);
      let x = map(i, 0, res-1.0, 0, this.size * 2.0);
      let y = -map(cos(ang), -1.0, 1.0, 0.0, 1.0) * this.size;
      part3Verts.push(createVector(x + xoffset, y + yoffset));
    }
    part3Verts.push(createVector(this.size * 2.0 - xoffset, yoffset));
    this.vertsList.push(part3Verts);

    // part 4
    let part4Verts = [];
    part4Verts.push(createVector(xoffset,yoffset))
    for(let i=0; i<res; i++){
      let ang = map(i, 0, res-1.0, 0, PI);
      let x = map(i, 0, res-1.0, 0, this.size * 2.0);
      let y = -map(cos(ang), -1.0, 1.0, 0.25, 1.0) * this.size;
      part4Verts.push(createVector(x - xoffset, y + yoffset));
    }
    part4Verts.push(createVector(this.size * 2.0 - xoffset, yoffset));
    this.vertsList.push(part4Verts);

    // part 5
    let part5Verts = [];
    part5Verts.push(createVector(xoffset,yoffset))
    for(let i=0; i<res; i++){
      let ang = map(i, 0, res-1.0, PI - bang, HALF_PI);
      let x = cos(ang) * this.size * 3.0 * 0.8 + this.size * 2.0;
      let y = -sin(ang) * this.size;
      part5Verts.push(createVector(x - xoffset, y + yoffset));
    }
    part5Verts.push(createVector(this.size * 2.0 - xoffset, yoffset));
    this.vertsList.push(part5Verts);
  }
}