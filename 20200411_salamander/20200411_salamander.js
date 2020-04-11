let salamanders = [];
let numSalamanders = 6;

const ColorPalette = Object.freeze({
    "blue": "#00bcd4",
    "lightblue": "#b2ebf2",
    "red": "#ff5722",
    "darkred" : "#dd2c00",
    "green": "#5b8c85",
    "darkgreen" : "#434e52",
    "darkyellow": "#b0a160",
    "yellow": "#ecce6d"
  });

function setup() {
    createCanvas(windowWidth, windowHeight);
    
    for(let i = 0; i<numSalamanders; i++){
        let speed = random(2.0, 4.0);
        let numSections = floor(random(10, 16));
        let lenSection = 25.0;
        let col = lerpColor(color(ColorPalette.yellow), color(ColorPalette.red), random());
        let salamander = new Salamander(numSections, lenSection, speed, 30.0, 40.0 / speed, numSections * lenSection * 0.25, i, col);
        salamanders.push(salamander);
    }
}

function draw() {
    background(ColorPalette.blue);

    blendMode(DARKEST);
    for(let i = 0; i<salamanders.length; i++){
        let salamander = salamanders[i];
        salamander.update();
        salamander.drawShadow();
    }
    blendMode(BLEND);
    for(let i = 0; i<salamanders.length; i++){
        let salamander = salamanders[i];
        salamander.drawFoots();
    }
    
    for(let i = 0; i<salamanders.length; i++){
        let salamander = salamanders[i];
        salamander.drawBody();
    }
}

class Foot{
    constructor(salamander, footSet, index, length, angle, maxStep, right, isFront, color){
        this.salamander = salamander;
        this.footSet = footSet;
        this.index = index;
        this.angle = angle;
        this.length = length;
        this.pos = createVector();
        this.move = false;
        this.goal = createVector();
        this.step = 0;
        this.maxStep = maxStep;
        this.right = right;
        this.footprints = [];
        this.isFront = isFront;
        this.color = color;
        // this.footprints = [];
        this.pos = this.getStepPos();
    }
    
    update(){
        let pos1 = this.salamander.sections[this.index];
        let pos = this.getStepPos();
        
        let dist = this.pos.dist(pos1);
        let otherFoot;
        if(this.right){
            otherFoot = this.footSet.lfoot;
        }else{
            otherFoot = this.footSet.rfoot;
        }
        
        if((dist > this.length && otherFoot.move == false)){
            this.goal = pos;
            this.step = 0;
            this.move = true;
        }
        
        if(this.move){
            this.step ++;
            let npos = p5.Vector.lerp(this.pos, this.goal, this.step / this.maxStep);
            this.pos = npos;
            if(this.step > this.maxStep){
                this.move = false;
                this.step = 0;
            }
        }
    }
    
    getStepPos(){
        let pos1 = this.salamander.sections[this.index];
        let pos2 = this.salamander.sections[this.index-1];
        let dir = p5.Vector.sub(pos2, pos1);
        dir.normalize();
        dir.mult(this.length);
        let ndir = dir.copy();
        ndir.rotate(this.angle);
        let pos = pos1.copy(); 
        pos.add(ndir);
        return pos;
    }
    
    draw(){
        this.drawLeg();
    }

    drawLeg(){
        let col = lerpColor(this.color, color(ColorPalette.darkgreen),0.1);
        stroke(col);
        strokeWeight(this.length * 0.25);
        let bpos = this.salamander.sections[this.index];
        let fpos = this.pos.copy();
        if(bpos.dist(fpos) > this.length){
            fpos.sub(bpos);
            fpos.normalize();
            fpos.mult(this.length);
            fpos.add(bpos);
        }
        
        let bendlen = sqrt(max(pow(this.length, 2) - pow(bpos.dist(fpos), 2), 0)) / 2.0;
        let bdir = p5.Vector.sub(fpos, bpos);
        bdir.normalize();
        let mpos = p5.Vector.mult(p5.Vector.add(bpos, fpos), 0.5);
        if((this.isFront && this.right) || (this.isFront == false && this.right == false) ){
            bdir.rotate(HALF_PI);
        }else{
            bdir.rotate(-HALF_PI);
        }
        bdir.mult(bendlen);
        mpos.add(bdir);

        line(bpos.x, bpos.y, mpos.x, mpos.y);
        line(mpos.x, mpos.y, fpos.x, fpos.y);

        this.drawFoot(fpos, p5.Vector.sub(fpos, mpos), this.length * 0.25, col);
    }

    drawFoot(pos, dir, size, col){
        dir.normalize();
        let rotang = atan2(dir.y, dir.x);

        push();
        translate(pos.x, pos.y);
        rotate(rotang);
        let stepang = radians(45.0);
        vertex(0,0);
        for(let i=-1; i<=1; i++){
            let ang = stepang * i;
            let fx = cos(ang) * size;
            let fy = sin(ang) * size;
            stroke(col);
            strokeWeight(this.length * 0.15);
            line(0,0, fx, fy);
        }
        pop();
    }
}

class FootSet{
    constructor(alien, index, length, angle, maxStep, isFront, color){
        this.alien = alien;
        this.index = index;
        this.length = length;
        this.angle = angle;
        this.isFront = isFront;
        this.lfoot = new Foot(alien, this, index, length, -angle, maxStep, false, isFront, color);
        this.rfoot = new Foot(alien, this, index, length, angle, maxStep, true, isFront, color);
    }
    
    update(){
        this.lfoot.update();
        this.rfoot.update();
    }
    
    draw(){
        this.lfoot.draw();
        this.rfoot.draw();
    }

    getMoveVal(){
        let val = 0.0;
        if(this.rfoot.move == true){
            val = this.rfoot.step / this.rfoot.maxStep;
        }else{
            val = -this.lfoot.step / this.lfoot.maxStep;
        }
        return val;
    }
}

class Salamander{
    constructor(numSections, lenSection, speed, angle, maxStep, footLength, index, color){
        this.numSections = numSections;
        this.lenSection = lenSection;
        this.sections = [];
        this.speed = speed;
        this.vel = createVector(speed, 0);
        this.acc = createVector();
        this.footSets = [];
        this.index = index;
        this.frontFootIndex = 1;
        this.backFootIndex = floor(numSections * 0.5);
        this.color = color;
        
        let basePos = createVector(random(0, width), random(0, height));
        for (let i=0; i< numSections; i++){
            let pos = createVector(basePos.x - i * lenSection, basePos.y);
            this.sections.push(pos);
            
            if(i == this.frontFootIndex || i == this.backFootIndex){
                let isFront = false;
                if(i == this.frontFootIndex){isFront = true;}
                let footSet = new FootSet(this, i, footLength, radians(angle), maxStep, isFront, color);
                this.footSets.push(footSet);
            }
        }
    }
    
    update(){
        let smoothness = 0.01;
        let bound = 1000.0;
        
        let x = noise(frameCount * smoothness + this.index * 724) - 0.5;
        let y = noise(frameCount * smoothness + this.index * 724 + 5234) - 0.5;
        let sdir = createVector(x, y);
        sdir.normalize();
        sdir.mult(this.speed);
        
        let bdir = createVector();
        if (this.sections[0].x < bound){
            bdir.add(createVector(pow((1.0 - this.sections[0].x / bound), 2), 0));
        }
        if (this.sections[0].x > windowWidth - bound){
            bdir.add(createVector(-pow((1.0 - (windowWidth - this.sections[0].x) / bound), 2), 0));
        }
        if (this.sections[0].y < bound){
            bdir.add(createVector(0, pow((1.0 - this.sections[0].y / bound), 2)));
        }
        if (this.sections[0].y > windowHeight - bound){
            bdir.add(createVector(0, - pow((1.0 - (windowHeight - this.sections[0].y) / bound), 2)));
        }
        bdir.mult(this.speed * 2);
        
        this.acc.add(sdir);
        this.acc.add(bdir);
        this.acc.limit(250);
        
        this.vel.add(this.acc);
        this.vel.limit(this.speed);
        
        for(let i=0; i < this.sections.length; i++){
            if(i == 0){
                this.sections[i].add(this.vel);
            }else{
                let pos1 = this.sections[i-1];
                let pos2 = this.sections[i];
                let movpos = p5.Vector.sub(pos2, pos1);
                movpos.normalize();
                movpos.mult(this.lenSection);
                movpos.add(pos1);
                this.sections[i] = movpos;
            }
        }
    }

    drawShadow(){
        let pos1 = this.sections[this.footSets[0].index];
        let pos2 = this.sections[this.footSets[1].index];
        let cen = p5.Vector.mult(p5.Vector.add(pos1, pos2), 0.5);
        noStroke();
        let maxSize = this.numSections * this.lenSection * 0.8;

        let col1 = color(ColorPalette.red);
        let col2 = color(ColorPalette.blue);

        let numShadow = 5;
        for(let i=numShadow-1; i>=0; i--){
            let col = lerpColor(col1, col2, pow(i / numShadow, 0.2));
            fill(col);
            let size = map(i, 0, numShadow-1, 0, maxSize);
            ellipse(cen.x, cen.y, size, size);
        }
    }
    
    drawFoots(){
        for(let i=0; i<this.footSets.length; i++){
            let footSet = this.footSets[i];
            footSet.update();
            footSet.draw();
        }
    }
    
    drawBody(){
        for(let i= 0; i< this.sections.length; i++){
            let section1 = this.sections[i];
            let section2;
            if(i < this.sections.length -1){
                section2 = this.sections[i+ 1];
            }
            fill(this.color);
            noStroke(0);
            let scale = 1.0;
            if(i==0){
                this.drawHead(section1, p5.Vector.sub(section1, section2), this.lenSection * this.numSections * 0.09);
            }else if(i < this.backFootIndex){
                let bodySize = this.lenSection * this.numSections * 0.13;
                let bval = sin(map(i, 1, this.backFootIndex - 1.0, 0.0, PI));
                let bscale = map(bval, 0, 1.0, 0.9, 1.0);
                bodySize *= bscale;

                ellipse(section1.x, section1.y, bodySize, bodySize);
            }else{
                let tailSize = this.lenSection * this.numSections * 0.10;
                let sval = map(i, this.backFootIndex, this.sections.length-1, tailSize, tailSize * 0.2);
                ellipse(section1.x, section1.y, sval, sval);
            }

        }
    }

    drawHead(pos, dir, size){
        dir.normalize();
        let rotang = atan2(dir.y, dir.x);
        push();
        translate(pos.x, pos.y);
        rotate(rotang - HALF_PI);
        let res = 36;
        beginShape();
        for(let i=0; i<res; i++){
            let ang = i / res * TWO_PI;
            let x = cos(ang) * size;
            let y = sin(ang) * size;
            if(ang < PI){
                y *= 2.0;
            }
            vertex(x, y);
        }
        endShape(CLOSE);
        pop();
    }
}