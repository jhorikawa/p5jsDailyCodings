let shapes = [];
let curTime = 0.0;
let speed = 50.0;

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  background(100);
  
  let num = 200;
  for(let i=0; i<num; i++){
    let shape = new Shape(i, num, width);
    shapes.push(shape);
  }
}

function draw() {
  background("#005082");
  
  for(let i=0; i<shapes.length; i++){
    let shape = shapes[i];
    shape.draw();
  }
  
  curTime += deltaTime * 0.001;
}

class Shape{
  constructor(id, maxnum, size){
    this.id = id;
    this.maxnum = maxnum;
    this.size = size;
    this.col1 = color("#ffffff");
    this.col2 = color("#ffa41b");
  }
  
  draw(){
    noFill();
    let maxid = this.maxnum * 0.1;
    let thresh =map(max(this.id, maxid), maxid, this.maxnum-1, 0, 1.0); 
    stroke(lerpColor(this.col2, this.col1, thresh));
    strokeWeight(map(max(thresh, 0.5), 0.5, 1.0, 0.0, 2.0));
    
    push();
    let angrange = map(sin(radians(curTime * 10.0)), -1.0, 1.0, 60.0, 360.0);
    let addang = radians( curTime * speed +  angrange * this.id / (this.maxnum - 1.0));
    let ang = radians(45.0) + addang;
    
    rotateX(ang);
    rotateY(ang);
    rotateZ(ang);
    let scaleval = (1.0 - this.id / this.maxnum);
    let addscale = map(sin(radians(curTime * 100.0)), -1.0, 1.0, 0.0,0.05);
    scaleval = map(scaleval, 0.0, 1.0, addscale, 1.0 + addscale);
    box(this.size * scaleval);
    pop()
  }
  
}