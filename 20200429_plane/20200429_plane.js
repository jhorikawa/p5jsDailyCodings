let pattern;
let tileSize = 50;

let colors = [
  "#48466d",
  "#3d84a8",
  "#46cdcf",
  "#abedd8"
];


function setup() {
  createCanvas(windowWidth, windowHeight);
  noStroke();
  shuffle(colors);

  pattern = new Pattern(tileSize);
}


function draw() {
  pattern.update();
  pattern.draw();
}


class Pattern{
  constructor(size){
    this.tiles = [];
    this.size = size;
    this.waitCount = 0;
    this.shift = 0;
    this.template = new TileTemplate(this.size);
    this.colVal = 0;
    this.colThresh = 0.0;

    this.wnum = ceil(width / size) + 1;
    this.hnum = ceil(height / size) + 1;
    for(let n =0; n<this.hnum; n++){
      for(let i=0; i<this.wnum; i++){  
        let tile = new Tile(i, n, createVector(size * i, size * n), size, this.template, this);
        this.tiles.push(tile);
      }
    }
  }

  patternRotate(step, shiftx, shifty, duration, wait){
    if(this.waitCount == 0){
      this.colVal += 1;
      let forward = true;
      if(random() < 0.5){
        forward = false;
      }
      for(let n =0; n<this.hnum; n++){
        for(let i=0; i<this.wnum; i++){  
          if((n + floor(i / step)* shifty)% step == 0 && (i + floor(n / step)* shiftx)% step == 0){
            let tile = this.getTile(i, n);
            if(step == 1){
              if(random() < 0.5){
                forward = false;
              }else{
                forward = true;
              }
            }
            tile.rotateTile(duration, forward);
          }
        }
      }
      this.waitCount = duration + wait;
    }
    
    this.waitCount--;
    
  }

  getTile(x, y){
    if(x < this.wnum && y < this.hnum){
      let index = this.wnum * y + x;
      return this.tiles[index];
    }else{
      return null;
    }
  }

  update(){
    let step = floor(random(1, 4));
    this.patternRotate(step, floor(random(step)), floor(random(step)), 60, 30);
    for(let i=0; i<this.tiles.length; i++){
      this.tiles[i].update();
    }
  }

  draw(){
    let col1ind = this.colVal % colors.length;
    let col2ind = (this.colVal + 1) % colors.length;
    let col3ind = (this.colVal + 2) % colors.length;

    let col1 = color(colors[col1ind]);
    let col2 = color(colors[col2ind]);
    let col3 = color(colors[col3ind]);

    this.template.draw(col1, col2, col3, this.colThresh);

    for(let i=0; i<this.tiles.length; i++){
      this.tiles[i].draw();
    }
  }
}

class TileTemplate{
  constructor(size){
    this.size = size;
    this.patternPg = createGraphics(this.size, this.size);
  }

  draw(col1, col2, col3, colVal){   
    this.patternPg.noStroke();
    this.patternPg.background(lerpColor(col1, col2, colVal));
    this.patternPg.fill(lerpColor(col2, col3, colVal));
    this.patternPg.ellipse(0,0, this.size * 6.0 / 5.0, this.size * 6.0 / 5.0);
    this.patternPg.fill(lerpColor(col1, col2, colVal));
    this.patternPg.ellipse(0,0, this.size * 4.0 / 5.0, this.size * 4.0 / 5.0);

    let x1 = this.size / 5.0 * 3.0;
    let wh = this.size / 5.0 * 1.0;
    let res = 20.0;

    this.patternPg.fill(lerpColor(col2, col3, colVal));
    this.patternPg.beginShape();
    for(let i = 0; i<res; i++){
      let ang = i / (res -1) * PI;
      let wx = x1 + cos(ang) * wh;
      let wy = i / (res - 1) * this.size;
      this.patternPg.vertex(wx, wy);
    }
    this.patternPg.vertex(x1, this.size);
    for(let i = 0; i<res ; i++){
      let ang = map(i, 0, res - 1, PI, PI * 0.5);
      let wx = cos(ang) * this.size * 2.0 / 5.0 + this.size;
      let wy = this.size - pow(sin(ang), 1.75) * this.size * 4.0 / 5.0;
      this.patternPg.vertex(wx, wy);
    }
    this.patternPg.vertex(this.size, 0);
    this.patternPg.endShape(CLOSE);

    this.patternPg.noStroke();
    for(let i=0; i<4; i++){
      let r = sqrt(pow(this.size * 0.5, 2.0) * 2);
      let ang = radians(45 + 90 * i);

      let x = cos(ang) * r + this.size * 0.5;
      let y = sin(ang) * r + this.size * 0.5;
      this.patternPg.fill(lerpColor(col2, col3, colVal));
      this.patternPg.ellipse(x, y, this.size * 0.4, this.size * 0.4)
    }

    this.patternPg.ellipse(this.size, this.size * 0.5, this.size / 5.0, this.size / 5.0);

    this.patternPg.strokeWeight(0);
    this.patternPg.stroke(lerpColor(col2, col3, colVal));
    this.patternPg.noFill();
    this.patternPg.rect(0, 0, this.size, this.size);
  }
}



class Tile{
  constructor(x, y, pos, size, template, pattern){
    this.x = x;
    this.y = y;
    this.pos = pos;
    this.size = size;
    this.rotang = 0;
    this.doRotate = false;
    this.rotFrame = 0;
    this.rotCount = 0;
    this.prevRotAng = 0;
    this.rotForward = true;
    this.template = template;
    this.pattern = pattern;
  }

  

  rotateTile(frame, forward){
    if(this.doRotate == false){
      this.rotFrame = frame;
      this.rotCount = 0;
      this.doRotate = true;
      this.prevRotAng = this.rotang;
      this.rotForward = forward;
    }
  }

  update(){

    if(this.doRotate){
      

      let addrot = this.rotCount;
      if(!this.rotForward){
        addrot *= -1;
      }
      this.rotang = this.prevRotAng + addrot / this.rotFrame * HALF_PI;
      if(this.rotang < 0) this.rotang += TWO_PI;
      this.rotang = this.rotang % TWO_PI;

      if(this.x == 0 && this.y == 0){
        // this.pattern.colVal = this.rotang;//map(this.rotang, 0, TWO_PI, 0, colors.length);
        this.pattern.colThresh = this.rotCount / this.rotFrame;
      }

      this.rotCount ++;

      if(this.rotCount > this.rotFrame){
        this.doRotate = false;
      }
    }
  }

  draw(){
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.rotang);
    translate(-this.size * 0.5, -this.size * 0.5);
    image(this.template.patternPg, 0,0);
    pop();
  }
}