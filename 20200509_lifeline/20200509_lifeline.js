let renderer;
let runners = [];
let baseval = 0;

const ColorPalette = Object.freeze({
	"dark": "#384259",
  "light": "#c4edde",
  "shadow": "#f6acc8",
  "normal" : "#7ac7c4"
});


function setup() {
  renderer = createCanvas(windowWidth, windowHeight);
  
  for(let i=0; i<30; i++){
    let runner = new Runner();
    runners.push(runner);
  }
  runners.sort(function(a, b){
    return a.pos.y - b.pos.y;
  });
}

function draw() {
  background(ColorPalette.light);

  for(let i=0; i<runners.length; i++){
    let runner = runners[i];
    runner.update();
    runner.draw();
  }
  
  // curTime += deltaTime * 0.001;
}

class Runner{
  constructor(){
    this.curTime = random(10000.);
    this.speedt = random(0.5, 1.0);
    this.angoffset = PI;
    this.layang = -15 * this.speedt;
    this.legang = 45 * this.speedt;
    this.speed = 500 * this.speedt;
    this.bodylen = random(30, 40);
    this.leglen = this.bodylen * 0.8;
    this.headrad = this.bodylen * 0.18;
    this.armlen = this.bodylen * 0.6;
    this.armang = 30 * this.speedt;
    this.armbend = 1.5;
    this.bounceheight = this.bodylen * 0.15 * this.speedt;
    this.pos = createVector(random(width) , random(height));
    this.shift = random();
  }

  update(){
    this.pos.add(createVector(-this.speedt * 5, 0));

    if(this.pos.x < -this.leglen-this.armlen){
      this.pos.x = width + this.leglen + this.armlen;
    }

    this.curTime += deltaTime * 0.001;
  }

  draw(){
    this.drawShadow();
    this.drawRunner();
  }

  drawRunner(){
    strokeWeight(7);
    let bcol = lerpColor(color(ColorPalette.normal), color(ColorPalette.dark), (this.pos.y / height * 0.4 + this.shift * 0.6));
    stroke(bcol);
    fill(bcol);
    // stroke(lerpColor(color(ColorPalette.light), color(ColorPalette.dark), this.pos.y / height));
    push();
      translate(this.pos.x, this.pos.y);
      push();
        translate(0, sin(radians(this.curTime * this.speed * 2)) *this.bounceheight);

        push();
          rotate(map(sin(radians(this.curTime * this.speed)), -1.0, 1.0, radians(this.layang), radians(this.legang)));
          line(0,0,0, this.leglen);
          translate(0, this.leglen);
          rotate(map(sin(radians(this.curTime * this.speed) + radians(45)), -1.0, 1.0, radians(-0), radians(-this.legang * 2)));
          line(0,0,0, this.leglen);
        pop();

        push();
          rotate(map(sin(radians(this.curTime * this.speed) + PI), -1.0, 1.0, radians(this.layang), radians(this.legang)));
          line(0,0,0, this.leglen);
          translate(0, this.leglen);
          rotate(map(sin(radians(this.curTime * this.speed) + radians(45) + PI), -1.0, 1.0, radians(-0), radians(-this.legang * 2)));
          line(0,0,0, this.leglen);
        pop();

        push();
          rotate(radians(this.layang * 0.25));
          push();
            line(0,0,0, -this.bodylen);
            translate(0,-this.bodylen - this.headrad);
            
            ellipse(0,0, this.headrad * 2, this.headrad * 2);
          pop();

          push();
            translate(0,-this.bodylen * 0.8);
            rotate(map(sin(radians(this.curTime * this.speed)), -1.0, 1.0, radians(-this.armang), radians(this.armang)));
            line(0,0,0,this.armlen);
            translate(0,this.armlen);
            rotate(map(sin(radians(this.curTime * this.speed) + radians(45)), -1.0, 1.0, radians(this.armang*this.armbend * 0.5), radians(this.armang*this.armbend)));
            line(0,0,0,this.armlen);
          pop();

          push();
            translate(0,-this.bodylen * 0.8);
            rotate(map(sin(radians(this.curTime * this.speed) + PI), -1.0, 1.0, radians(-this.armang), radians(this.armang)));
            line(0,0,0,this.armlen);
            translate(0,this.armlen);
            rotate(map(sin(radians(this.curTime * this.speed) + radians(45) + PI), -1.0, 1.0, radians(this.armang*this.armbend * 0.5), radians(this.armang*this.armbend)));
            line(0,0,0,this.armlen);
          pop();
        pop();
      pop();
    pop();
  }

  drawShadow(){
    strokeWeight(15);
    let col = lerpColor(color(ColorPalette.normal), color(ColorPalette.shadow), pow((this.pos.y / height * 0.7 + this.shift * 0.3), 2));//lerpColor(color(ColorPalette.light), color(ColorPalette.shadow), this.pos.x / width);
    col._array[3] = this.pos.x / width;
    stroke(col);

    line(width, this.pos.y + this.leglen * 2 + this.bounceheight, this.pos.x, this.pos.y + this.leglen * 2 + this.bounceheight);
  }
}