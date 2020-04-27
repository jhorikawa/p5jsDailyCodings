let books = [];

const ColorPalette = Object.freeze({
  "purple" : "#efa8e4",
  "orange" : "#ffbd69",
  "blue" : "#97e5ef",
  "green": "#bbded6",
  "yellow" : "#f4e04d",
  "white" : "#f4f4f4",
  "dark" : "#dae1e7"
});


function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  ortho(-width/2, width/2, -height/2, height/2, 0.1, 10000);
  noStroke();

  let w = 200;
  let h = 150;
  let d = 20;

  let wnum = ceil(width / w * 0.5);
  let hnum = ceil(height / h * 0.5);

  for(let i = -wnum; i<= wnum; i++){
    for(let n = -hnum; n <= hnum; n++){
      let book = new Book(createVector((w + 0) * i , (h +60) * n, 0), createVector(w/2, h, d), random(5, 12), 2);
      books.push(book);
    }
  }
  camera(0, 250, 500, 0, 0, 0, 0, 1, 0);
  
}

function draw() {
  background(ColorPalette.green);
  ambientLight(255);
  directionalLight(200, 200, 200, -1.0, 1.0, 0.3);
  
  for(let i=0; i<books.length; i++){
    let book = books[i];
    book.update();
    book.draw();
  }

}

class Book{
  constructor(pos, size, pagenum, speed){
    this.pos = pos;
    this.size = size;
    this.lpage = new Page(-1, size, 0, this, 0);
    this.rpage = new Page(-1, size, -PI, this, 0);
    this.pages = [];
    this.pagenum = pagenum;
    this.forward = random() > 0.5 ? true : false;
    this.speed = speed;
    this.shift = random();
    let col1 = lerpColor(color(ColorPalette.purple), color(ColorPalette.blue), random());
    let col2 = lerpColor(color(ColorPalette.orange), color(ColorPalette.yellow), random());
    this.color = lerpColor(col1, col2, random());

    for(let i=0; i<pagenum; i++){
      let page = new Page(i, size, -i / pagenum * PI, this, speed, this.shift);
      this.pages.push(page);
    }

  }

  update(){
    
    for(let i=0; i<this.pages.length; i++){
      let page = this.pages[i];
      page.update();
    }

    let allstopped = true;
    for(let i=0; i<this.pages.length; i++){
      let page = this.pages[i];
      if(page.stop == false){
        allstopped = false;
        break;
      }
    }

    if(allstopped){
      this.forward = !this.forward;
      for(let i=0; i<this.pages.length; i++){
        let page = this.pages[i];
        page.stop = false;
      }
    }
  }

  draw(){
    push();
    translate(this.pos.x, this.pos.y, this.pos.z);
    this.lpage.draw();
    this.rpage.draw();
    for(let i=0; i<this.pages.length; i++){
      this.pages[i].draw();
    }
    pop();
  }


}

class Page{
  constructor(index, size, rotang, book, speed, shift){
    this.index = index;
    this.size = size;
    this.rotang = rotang;
    this.actang = rotang;
    this.res = 8;
    this.book = book;
    this.count = shift * 180 / speed;
    this.stop = false;
    this.col;
    this.maxang = 180.0
    this.speed = speed;
  }

  update(){
    let t = this.index / (this.book.pagenum - 1.0);
    let tang = max(min(radians(this.count * this.speed + t * this.maxang), PI), 0.0);
    this.col = lerpColor(color(ColorPalette.white), this.book.color, pow(sin(tang), 3.0));
    this.actang = map(cos(tang), -1.0, 1.0, 0.0, -PI);

    if(this.book.forward){
      if(tang < PI){
        this.count++;
      }else{
        this.stop = true;
        this.count = 180 / this.speed;
      }
    }else{
      if(tang > 0){
        this.count--;
      }else{
        this.stop = true;
        this.count = -this.maxang / this.speed;
      }
    }
  }

  draw(){
    push();
    translate(0, -this.size.y * 0.5, 0);
    // let rotang = 0;
    if(this.index == -1){
      ambientMaterial(ColorPalette.white);
      this.actang = this.rotang;
    }else{
      ambientMaterial(this.col);
    }

    push();
    rotateY(this.actang);
    beginShape(TRIANGLE_STRIP);
    let stepx = this.size.x / this.res;

    for(let i=0; i<this.res; i++){
      for(let n=0; n<2; n++){
        let ang = map(i, 0, this.res-1, 0, PI);
        
        vertex(i * stepx, n * this.size.y, this.size.z * cos(this.actang) * sin(ang) );
      }
    }
    endShape();
    pop();
    pop();
  }
  
}
