let aliens = [];

function setup() {
    createCanvas(windowWidth, windowHeight);
    background("#fcf8f3");
    
    for(let i = 0; i<random(2, 8); i++){
        let speed = random(2.0, 5.0);
        let alien = new Alien(floor(random(4, 15)), 30.0, speed, 30.0, floor(random(2, 4)), 25.0, 30.0 / speed, 60.0, i, 8);
        aliens.push(alien);
    }
}

function draw() {
    background("#fcf8f3");
    
    for(let i = 0; i<aliens.length; i++){
        let alien = aliens[i];
        alien.update();
        alien.drawFoots();
    }
    
    for(let i = 0; i<aliens.length; i++){
        let alien = aliens[i];
        alien.drawBody();
    }
}

class Foot{
    constructor(alien, footSet, index, length, angle, maxStep, right, numFootprints){
        this.alien = alien;
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
        this.numFootPrints = numFootprints
        
        this.pos = this.getStepPos();
    }
    
    update(){
        let pos1 = this.alien.sections[this.index];
        let pos = this.getStepPos();
        
        let dist = this.pos.dist(pos1);
        let otherFoot;
        if(this.right){
            otherFoot = this.footSet.lfoot;
        }else{
            otherFoot = this.footSet.rfoot;
        }
        
        if(dist > this.length && otherFoot.move == false){
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
                this.footprints.push(this.pos);
                if(this.footprints.length > this.numFootPrints){
                    this.footprints.shift();
                }
            }
        }
    }
    
    getStepPos(){
        let pos1 = this.alien.sections[this.index];
        let pos2 = this.alien.sections[this.index-1];
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
        for(let i = 0; i < this.footprints.length; i++){
            let footprint = this.footprints[i];
            let col1 = color("#ffaaa5");
            let col2 = color("#fcf8f3");
            fill(lerpColor(col1, col2, 1.0 - i / (this.footprints.length-1.0) * 0.5));
            ellipse(footprint.x, footprint.y, 7, 7);
        }
        
        stroke("#698474");
        strokeWeight(5);
        let pos = this.alien.sections[this.index];
        line(pos.x, pos.y, this.pos.x, this.pos.y);
        noStroke();
        fill("#698474");
        ellipse(this.pos.x, this.pos.y, 15, 15);
    }
}

class FootSet{
    constructor(alien, index, length, angle, maxStep, numFootprints){
        this.alien = alien;
        this.index = index;
        this.length = length;
        this.angle = angle;
        this.lfoot = new Foot(alien, this, index, length, -angle, maxStep, false, numFootprints);
        this.rfoot = new Foot(alien, this, index, length, angle, maxStep, true, numFootprints);
    }
    
    update(){
        this.lfoot.update();
        this.rfoot.update();
    }
    
    draw(){
        this.lfoot.draw();
        this.rfoot.draw();
    }
}

class Alien{
    constructor(numSections, lenSection, speed, size, footStep, angle, maxStep, footLength, index, numFootprints){
        this.lenSection = lenSection;
        this.sections = [];
        this.speed = speed;
        this.vel = createVector(speed, 0);
        this.acc = createVector();
        this.size = size;
        this.footStep = footStep;
        this.footSets = [];
        this.index = index;
        
        let basePos = createVector(random(0, width), random(0, height));
        for (let i=0; i< numSections; i++){
            let pos = createVector(basePos.x - i * lenSection, basePos.y);
            this.sections.push(pos);
            
            if((i-1) % this.footStep == 0 && i != 0){
                let footSet = new FootSet(this, i, footLength, radians(angle), maxStep, numFootprints);
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
    
    drawFoots(){
        for(let i=0; i<this.footSets.length; i++){
            let footSet = this.footSets[i];
            footSet.update();
            footSet.draw();
        }
    }
    
    drawBody(){
        let col1 = color("#ffd3b6");
        let col2 = color("#ffaaa5");
        
        for(let i= this.sections.length-1; i>=0; i--){
            let section = this.sections[i];
            fill(lerpColor(col1, col2, 0.5 - i / (this.sections.length - 1.0) * 0.5));
            noStroke(0);
            let size = max(noise(i * 0.5 + this.index * 100), 0.5) * 2.5 * this.size;
            if(i == 0){
                size *= 1.5;
            }
            ellipse(section.x, section.y, size, size);

        }
    }
}