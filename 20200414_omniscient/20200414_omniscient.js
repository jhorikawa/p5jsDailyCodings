let charSize = 50;
let buildingNum = 50;
let buildings = [];
let minHeight = 50;
let maxHeight = 250;
let minWidth = 10;
let maxWidth = 20;
let growspeed = 0.4;
let jumpHeight = 20.0;
let earthSpeed = 0.3;
let dayval = 0.0;
let moonpg;
let moonsize = 125;

const ColorPalette = Object.freeze({
  "dark": "#364f6b",
  "blue" : "#3fc1c9",
  "white" : "#f5f5f5",
  "red": "#fc5185"
});

function setup() {
    createCanvas(windowWidth, windowHeight);
    background(100);
    noStroke();
    
    for(let i=0; i<buildingNum; i++){
        let building = new Building(i, TWO_PI * random(), random(minHeight, maxHeight), random(minWidth, maxWidth));
        buildings.push(building);
    }
    
    moonpg = createGraphics(moonsize, moonsize);
    moonpg.noStroke();
    moonpg.fill(ColorPalette.white);
    moonpg.ellipse(moonsize * 0.5, moonsize * 0.5, moonsize, moonsize);
    moonpg.erase();
    moonpg.ellipse(moonsize * 0.375, moonsize * 0.375, moonsize * 0.75, moonsize * 0.75);
    moonpg.noErase();
}

function draw() {
    let dayval = map(sin(radians(frameCount * 1.0)), -1.0, 1.0, 0.0, 1.0);
    
    background(lerpColor(color(ColorPalette.dark), color(ColorPalette.blue), dayval));//map(dayval, 0.0, 1.0, 0.0, 255));
    
    fill(ColorPalette.red);
    ellipse(moonsize + 50, -(moonsize + 50) + dayval * (moonsize + 50) * 2, moonsize, moonsize);
    image(moonpg, width - (moonsize * 1.5 + 50), (moonsize * 0.5 + 50) - dayval * (moonsize + 50) * 2);
    //fill(ColorPalette.white);
    //ellipse(width - 150, 150 - dayval * 300, 100, 100);
    
    fill(map(dayval, 0.0, 1.0,255, 0));
    push();
    translate(width * 0.5, height);
    for(let i=0; i<buildings.length; i++){
        let building = buildings[i];
        building.update();
        building.draw(dayval);
    }
    fill(lerpColor(color(ColorPalette.white), color(ColorPalette.red), dayval));//map(dayval, 0.0, 1.0,255, 0));
    ellipse(0, 0 , height, height);
    pop();
    
    fill(lerpColor(color(ColorPalette.white), color(ColorPalette.red), dayval));// fill(map(dayval, 0.0, 1.0,255, 0));
    ellipse(width * 0.5, height * 0.5 - charSize * 0.5 - jumpHeight * abs(sin(radians(frameCount * 5))), charSize, charSize);
}

class Building{
    constructor(id, posang, height, width){
        this.id = id;
        this.posang = posang;
        this.height = height;
        this.width = width;
        this.new = false;
        
        let rnd = random();
        if(rnd < 0.5){
            this.hasWindow = true;
        }else{
            this.hasWindow = false;
        }
        this.widthang = 2 * asin(width / (2 * height));
    }
    
    update(){
        if(sin(this.posang) > 0.5 && this.new == true){
            let index = buildings.indexOf(this);
            let rndang = radians(random(45.0, 135.0));
            this.posang = rndang;
            this.height = random(minHeight, maxHeight);
            this.width = random(minWidth, maxWidth);
            this.new = false;
            
            let rnd = random();
            if(rnd < 0.5){
                this.hasWindow = true;
            }else{
                this.hasWindow = false;
            }
        }else if (sin(this.posang) < -0.5 && this.new == false){
            this.new = true;
        }
        
        this.posang -= radians(earthSpeed);
        if(this.posang < 0.0){
            this.posang += TWO_PI;
        }
    }
    
    draw(dayval){
        let hhalf = height * 0.5;
        let h = hhalf;
        if(this.posang >PI && this.posang < TWO_PI){
            h += this.height * min(sin(this.posang - PI), growspeed) / growspeed;
        }
        let a1 = this.posang - this.widthang * 0.5;
        let a2 = this.posang + this.widthang * 0.5;
        let p1 = createVector(cos(a1) *h,  sin(a1) * h);
        let p2 = createVector(cos(a2) * h, sin(a2) * h);
        let p3 = createVector(cos(a2) * hhalf, sin(a2) * hhalf);
        let p4 = createVector(cos(a1) * hhalf, sin(a1) * hhalf);

        let col1 = lerpColor(color(ColorPalette.dark), color(ColorPalette.white), this.id / buildingNum);
        let col2 = lerpColor(color(ColorPalette.red), color(ColorPalette.white), 1.0 - this.id / buildingNum);
        let fillcol = lerpColor(col1, col2, dayval);
        
        fill(fillcol);
        beginShape();
        vertex(0, 0);
        vertex(p1.x, p1.y);
        vertex(p2.x,  p2.y);
        endShape(CLOSE);
        
        if(this.hasWindow){
            let cp = p5.Vector.mult(p5.Vector.add(p5.Vector.add(p5.Vector.add(p1, p2), p3), p4), 0.25);
            let wp1 = p5.Vector.add(p5.Vector.mult(p5.Vector.sub(p1, cp), 0.25), cp);
            let wp2 = p5.Vector.add(p5.Vector.mult(p5.Vector.sub(p2, cp), 0.25), cp);
            let wp3 = p5.Vector.add(p5.Vector.mult(p5.Vector.sub(p3, cp), 0.25), cp);
            let wp4 = p5.Vector.add(p5.Vector.mult(p5.Vector.sub(p4, cp), 0.25), cp);
            fill(ColorPalette.white);
            beginShape();
            vertex(wp1.x, wp1.y);
            vertex(wp2.x, wp2.y);
            vertex(wp3.x, wp3.y);
            vertex(wp4.x, wp4.y);
            endShape(CLOSE);
        }
    }
    
}