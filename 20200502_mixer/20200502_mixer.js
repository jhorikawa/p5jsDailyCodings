let renderer;
let backShader;
let vectorField;
let curTime = 0.0;


let colors = [
	"#ffffff",
  "#ffbe0b",
  "#fb5607",
  "#ff006e",
  "#8338ec",
  "#3a86ff"
];


function preload(){
  backShader = loadShader('assets/shader.vert', 'assets/shader.frag');
}

function setup() {
  
  renderer = createCanvas(windowWidth, windowHeight);

  pixelDensity(1.0);
  noStroke();

  vectorField = new VectorField(300, backShader);

  pg = createGraphics(width , height);
  pg2 = createGraphics(width, height, WEBGL);
  
  pg.background(255);
  pg2.background(255);
  pg2.fill(255);
  pg2.rect(0,0,width, height);
}

function draw() {
  vectorField.update();
  vectorField.draw();

  curTime += deltaTime * 0.001;
}

function mouseReleased(){
  vectorField.showVectors = !vectorField.showVectors;
}

class VectorField{
  constructor(totalNum, canvasShader){
    this.canvasShader = canvasShader;
    this.drawPG = createGraphics(width, height);
    this.shaderPG = createGraphics(width, height, WEBGL);
    this.totalNum = totalNum;
    this.positions = [];
    this.directions = [];
    this.scale = 0.002;
    this.shiftx = 45253.534;
    this.shifty = 63424.234;
    this.speed = 0.4;
    this.splatterframe = 80.0;
    this.splattertime = 20.0;
    this.positionArray = [];
    this.showVectors = false;
    this.splatterrad = 0;
    this.splatterpos = createVector();
    this.splattercol = color(255);

    let w = width / (width + height);
    let h = height / (width + height);
    
    let stepnum = sqrt(totalNum / (w * h));
    let wn = floor(stepnum * w);
    let hn = floor(stepnum * h);

    let mwidth = floor(width / wn) * wn;
    let mheight = floor(height / hn) * hn;

    for(let i=0; i<wn; i++){
      for(let n=0; n<hn; n++){
        let x = i / (wn - 1) * mwidth;
        let y = n / (hn - 1) * mheight;

        this.positions.push(createVector(x, y));
        this.positionArray.push(x, y);
        
        let dirx = noise(x * this.scale, y * this.scale, curTime * this.speed)-0.5;
        let diry = noise(x * this.scale + this.shiftx, y * this.scale + this.shifty, curTime * this.speed)-0.5;
        let dir = createVector(dirx, diry, 0);
        dir.normalize();
        this.directions.push(dir); 
      }
    }
  }

  update(){
    this.drawPG.image(this.shaderPG, 0,0);
    let directionArray = [];
    for(let i=0; i<this.directions.length; i++){
      let pos = this.positions[i];
      let dirx = noise(pos.x * this.scale, pos.y * this.scale, curTime * this.speed)-0.5;
      let diry = noise(pos.x * this.scale + this.shiftx, pos.y * this.scale + this.shifty, curTime* this.speed)-0.5;
      let dir = createVector(dirx, diry, 0);
      dir.normalize();
      this.directions[i] = dir;
      directionArray.push(dir.x, dir.y);
    }

    
    if(frameCount % this.splatterframe == 0){
      this.splatterrad = random(300, 600);
      this.splatterpos = createVector(random() * width, random() * height, 0);
      this.splattercol = color(colors[floor(random(1, colors.length))]);
    }else if(frameCount % this.splatterframe < this.splattertime){
      let t = pow(map(frameCount % this.splatterframe, 0, this.splattertime, 0.0, 1.0), 0.5);
      this.drawPG.noStroke();
      this.drawPG.fill(this.splattercol);
      let rad = this.splatterrad * t;
      this.drawPG.ellipse(this.splatterpos.x, this.splatterpos.y, rad, rad);
    }

    this.canvasShader.setUniform("u_positions", this.positionArray);
    this.canvasShader.setUniform("u_directions", directionArray);
    this.canvasShader.setUniform("u_time", curTime);
    this.canvasShader.setUniform("u_resolution", [width , height]);
    this.canvasShader.setUniform("u_colbuffer", this.drawPG);
    this.canvasShader.setUniform("u_backcol", color(colors[0])._array);
    this.canvasShader.setUniform("u_ptnum", this.positionArray.length);
    this.canvasShader.setUniform("u_speed", 3.0);

    this.shaderPG.shader(this.canvasShader);
    this.shaderPG.quad(-1, -1, 1, -1, 1, 1, -1, 1);
  }

  draw(){

    image(this.shaderPG, 0, 0);


    if(this.showVectors){
      let vectorCol = color(0, 100);
      // let rtime = 7.0;
      // let mtime = 3.0;
      // if(curTime % rtime < mtime){
      //   let ang = map(curTime % rtime, 0.0, mtime, 0, PI);
      //   let a = sin(ang) * 255.0;
      //   vectorCol = color(255, a);
      // }
      for(let i=0; i<this.positions.length; i++){
        let pos = this.positions[i];
        let dir = this.directions[i];
        noStroke()
        fill(vectorCol);
        ellipse(pos.x, pos.y, 5, 5);
        stroke(vectorCol);
        strokeWeight(1);
        line(pos.x, pos.y, pos.x + dir.x * 20, pos.y + dir.y * 20);
      }
    }
  }
}
