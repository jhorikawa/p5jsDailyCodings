let maxnum = 1000;
let eyes = [];
let minSize = 50;
let maxSize = 300;
let frontPg;
let backPg;
let allclose = false;
// let allopen = false;
let count = 0;
let closecount = 0;
let opencount = 0;
let wow = false;
let wowcount = 0;
let wowmax = 30;

const ColorPalette = Object.freeze({
    "orange": "#ff7e67",
    "darkgreen": "#35495e",
    "green": "#347474", 
    "lightgreen": "#42b883"
});

function setup() {
    createCanvas(windowWidth, windowHeight);
    background(ColorPalette.green);
    noStroke();
    
    frontPg = createGraphics(width, height);
    backPg = createGraphics(width, height);
    
    for(let i = 0; i<maxnum; i++){
        let pos = createVector(width * random(), height * random());
        let size = random(minSize, maxSize);
        let canGo = Eye.checkFarEnough(pos, eyes, size);
        if(canGo){
            let eye = new Eye(pos, size, frontPg, backPg);
            eyes.push(eye);
        }
    }
}

function draw() {
    backPg.background(ColorPalette.green);
    frontPg.background(ColorPalette.darkgreen);
    
    
    
    
    if(random() < 0.5 && allclose == false){
        //allclose = true;
        opencount =0 ;
        closecount++;
    }else if(random() < 0.5 && allclose == true){
        //allclose = false;
        closecount = 0;
        opencount++;
    }
    
    if(closecount > 300 && allclose == false){
        allclose = true;
    }
    
    if(opencount > 100 && allclose == true){
        allclose = false;
        wow = true;
    }
    
    let charScale = 1.0;
    let charCol = 0.0;
    
    if(wow == true){
        wowcount ++;
        wowcount = min(wowcount, wowmax);
        charCol =  sin(map(wowcount, 0, wowmax, 0, PI));
        charScale = map(charCol, 0.0, 1.0, 1.0, 2.0);
        if(wowcount == wowmax){
            wow = false;
            wowcount = 0;
        }
    }
    
    
    if(allclose == false){
        count++;
    }
    
    let charPos = createVector(noise(count * 0.003, 0) * width, noise(0, count * 0.003) * height);
    
    for(let i= 0; i<eyes.length; i++){
        let eye = eyes[i];
        eye.update(allclose);
        eye.draw(charPos);
    }
    
    let col = lerpColor(color(ColorPalette.lightgreen), color(ColorPalette.orange), charCol);
    frontPg.fill(col);
    frontPg.ellipse(charPos.x, charPos.y, minSize * charScale, minSize * charScale);
    
    image(backPg, 0, 0);
    image(frontPg, 0, 0);
}

class Eye{
    constructor(pos, size, frontPg, backPg){
        this.pos = pos;
        this.size = size;
        this.shift = random();
        
        let rndOpen = round(random());
        this.topOpenVal = rndOpen;
        this.bottomOpenVal = rndOpen;
        this.frontPg = frontPg;
        this.backPg = backPg;
        
        this.state = rndOpen;
        this.freeze = 0;
        this.lastcount = 0;
    }
    
    static checkFarEnough(pos, eyes, cdist){
        let canGo = true;
        for(let i=0; i<eyes.length; i++){
            let eye = eyes[i];
            let dist = eye.pos.dist(pos);
            if(dist < cdist * 0.5 + eye.size * 0.5){
                canGo = false;
                break;
            }
        }
        return canGo;
    }
    
    blinkEye(speed){
        if(this.state == 0){
            // stay close
            this.topOpenVal = 0.0;
            this.bottomOpenVal = 0.0;
        }else if(this.state == 1){
            // stay open
            this.topOpenVal = 0.75;
            this.bottomOpenVal = 0.75;
        }else if(this.state == 2){
            // close
            this.topOpenVal -= speed;
            this.bottomOpenVal -= speed;
            this.topOpenVal = max(0.0, this.topOpenVal);
            this.bottomOpenVal = max(0.0, this.bottomOpenVal);
            if(this.topOpenVal == 0.0 && this.bottomOpenVal == 0.0){
                this.state = 0;
            }
        }else if(this.state == 3){
            // open
            this.topOpenVal += speed;
            this.bottomOpenVal += speed;
            this.topOpenVal = min(0.75, this.topOpenVal);
            this.bottomOpenVal = min(0.75, this.bottomOpenVal);
            if(this.topOpenVal == 0.75 && this.bottomOpenVal == 0.75){
                this.state = 1;
            }
        }else if(this.state == 4){
            // laugh stay
            this.topOpenVal = 1.0;
            this.bottomOpenVal = 1.0;
        }else if(this.state == 5){
            // laugh
            this.topOpenVal += speed;
            this.bottomOpenVal += speed;
            this.topOpenVal = min(1.0, this.topOpenVal);
            this.bottomOpenVal = min(1.0, this.bottomOpenVal);
            if(this.topOpenVal == 1.0 && this.bottomOpenVal == 1.0){
                this.state = 4;
            }
        }
    }
    
    closeEye(freeze){
        this.freeze = freeze;
        this.state = 2;
    }
    
    openEye(freeze){
        this.freeze = freeze;
        if(this.freeze == false){
            this.state = 3;
        }else{
            this.state = 5;
        }
    }
    
    update(allclose){
        this.blinkEye(0.05 * map(this.shift, 0, 1.0, 0.5, 1.0));
        
        if(allclose == true){
            this.closeEye(true);
        }else if(allclose == false && this.state == 0 && this.freeze == 1){
            this.openEye(true);
            this.lastcount = 0;
        }
        
        if((this.state == 1 || this.state == 4) && this.freeze == 1){
            this.lastcount ++;
        }
        
        if(this.lastcount > 200){
            this.freeze = 0;
            this.lastcount = 0;
            this.closeEye(false);
        }
        
        if(this.freeze == 0){
            if(this.state == 0 && random() < 0.0025){
                this.openEye(false);
            }else if(this.state == 1 && random() < 0.005){
                this.closeEye(false);
            }
        }
    }
    
    draw(charPos){
        this.frontPg.noStroke();
        this.frontPg.push();
        this.frontPg.translate(this.pos.x, this.pos.y);
        this.frontPg.erase();
        this.frontPg.beginShape();
        let div = 13;
        
        for(let n=0; n<2; n++){
            let openVal = 1.0;
            if(n == 0){
                openVal = this.bottomOpenVal;
            }else{
                openVal = this.topOpenVal;
            }
            for(let i=0; i<div; i++){
                let ang = PI / (div-1) * i + n * PI;
                let x = cos(ang);
                let y = sin(ang);
                let ymult = abs(y) / y;
                
                this.frontPg.vertex(x * this.size * 0.5, pow(abs(y), 2) * ymult * this.size * 0.25 * openVal);
            }
        }
        this.frontPg.endShape(CLOSE);
        this.frontPg.noErase();
        this.frontPg.pop();
        
        let mouseDir = charPos.copy();
        mouseDir.sub(this.pos);
        let mouseDist = mouseDir.mag();
        mouseDir.normalize();
        let distVal = map(min(mouseDist, height * 1), 0, height * 1, 0, 1.0);
        mouseDir.mult(distVal * this.size * 0.25);
        
        let col = lerpColor(color(ColorPalette.orange), color(ColorPalette.lightgreen), pow(distVal, 1.5));
        this.backPg.fill(col);
        this.backPg.noStroke();
        this.backPg.ellipse(this.pos.x + mouseDir.x, this.pos.y + mouseDir.y, this.size * 0.4, this.size * 0.4);//min(this.topOpenVal, this.bottomOpenVal));
        
    }
    
}