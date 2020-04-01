let balls = [];
let minSize = 2.0;
let maxSize = 30.0;
let minSpeed = 1.0;
let maxSpeed = 7.0;
let topScaleDist = 150.0;
let bottomScaleDist = 150.0;
let bgcol = "#4d4c7d";

function setup() {
    createCanvas(windowWidth, windowHeight);
    background(bgcol);
    
    for(let i =0; i<random(10, 200); i++){
        let size = random(minSize, maxSize);
        let speed = map(size, minSize, maxSize, minSpeed, maxSpeed);
        let ball = new Ball(size , speed, createVector(random(0, windowWidth), random(0, windowHeight)));
        balls.push(ball);
    }
}

function draw() {
    //ellipse(mouseX, mouseY, 20, 20);
    background(bgcol);
    
    for(let i=0; i < balls.length; i++){
        balls[i].update();
        balls[i].drawHole();
    }
    
    for(let i=0; i < balls.length; i++){
        balls[i].drawBall();
    }
}

class Ball{
    constructor(rad, speed, pos){
        this.pos = pos;
        this.rad = rad;
        this.speed = speed;
        this.scale = 1.0;
        this.holeScale = 1.0;
    }
    
    update(){
        this.pos.add(createVector(0, this.speed));
        this.heightRange = this.pos.y - this.rad * 0.25;
        
        this.holeHeight = windowHeight * map(this.rad, minSize, maxSize, 0.5, 0.9)  + this.rad * 2;
        
        if(this.pos.y < topScaleDist){
            this.holeScale = map(max(min(this.pos.y, topScaleDist), 0), 0.0, topScaleDist, 0.0, 1.0);
        }else{
            let dist = min(abs(this.holeHeight - this.heightRange),  bottomScaleDist);
            this.scale = map(dist, 0, bottomScaleDist, 0.0, 1.0);
        }
    }
    
    drawHole(){
        
        noStroke();
        fill("#363062");
        
        ellipse(this.pos.x, this.holeHeight, this.rad * 3 * this.scale * this.holeScale, this.rad * this.scale * this.holeScale );
    }
    
    drawBall(){
        fill("#d8b9c3");
        noStroke();
        ellipse(this.pos.x, this.pos.y, this.rad * 2 * this.scale, this.rad * 2 * this.scale);
        
        if(this.heightRange > this.holeHeight ){
                this.pos.x = random(0, windowWidth);
                this.pos.y = -maxSize;
                this.scale = 1.0;
        }
    }
}