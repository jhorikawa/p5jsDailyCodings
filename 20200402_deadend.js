let roomSize = 500.0;
let balls = [];

function setup() {
    createCanvas(windowWidth, windowHeight, WEBGL);
    ortho(-width / 2.0, width / 2.0, height / 2.0, -height / 2.0, -5000, 5000);
    camera(-250,-250,250,0,0,0,0,0,1);
    
    for(let i=0; i<random(5, 25); i++){
        let ball = new Ball(random(10.0, 30.0), createVector(random(-roomSize * 2, roomSize), random(-roomSize, roomSize), random(roomSize * 0.5, roomSize * 1.5)), createVector(0, 0, random(-1.0, -0.5)));
        balls.push(ball);
    }
    
    background(50);
}

function draw() {
    translate(0, 0, -roomSize);

    ambientLight(100);
    directionalLight(255, 255, 255, -0.5, 0.75, -1.0);
    
    
    createRoom();
    
    for(let i=0; i < balls.length; i++){
        let ball = balls[i];
        ball.update();
        ball.draw();
    }


}

function createRoom(){
    noStroke();
    fill("#4f3961");
    push();
    plane(roomSize * 4, roomSize * 4);
    pop();
    
    push();
    translate(0, roomSize, roomSize);
    rotate(PI * 0.5, createVector(1,0,0));
    plane(roomSize * 4,roomSize * 4);
    pop();
    
    push();
    translate(roomSize, 0, roomSize);
    rotate(PI * 0.5, createVector(0,1,0));
    plane(roomSize * 4, roomSize * 4);
    pop();
}

class Ball{
    constructor(rad, pos, acc){
        this.rad = rad;
        this.pos = pos;
        this.initHeight = this.pos.z;
        this.acc = acc;
        this.initVel = createVector(random(3.0, 10.0), 0, 0);
        this.vel = this.initVel;
        this.struck = false;
        this.shadowScale = 1.0;
        this.markScale = 1.0;
        this.struckHeight = 0;
    }
    
    update(){
        this.vel.add(this.acc);
        this.pos.add(this.vel);
        if(this.struck == false){
            if(this.pos.z < this.rad){
                this.pos.z = this.rad;
                this.vel.z = - this.vel.z;
            }
        }else{
            if(this.pos.z < -this.rad * 10.0){
                this.shadowScale -= 0.1;
                this.shadowScale = max(this.shadowScale, 0.0);
            }
            this.markScale -= 0.03;
            this.markScale = max(this.markScale, 0.0);
        }
        
        if(this.pos.x > roomSize - this.rad){
            this.pos.x = roomSize - this.rad;
            if(this.struck == false){
                this.struck = true;
                this.vel = createVector(0,0,0);
                //this.acc.mult(0.5);
                this.struckHeight = this.pos.z;
            }
        }
        
        if(this.shadowScale == 0){
            this.struck = false;
            this.shadowScale = 1.0;
            this.vel = this.initVel;
            this.pos = createVector(-roomSize * 2,random(-roomSize, roomSize), random(roomSize * 0.5, roomSize * 1.5));
            this.initHeight = this.pos.z;
            this.acc = createVector(0, 0, random(-1.0, -0.5));
            this.initVel = createVector(random(3.0, 10.0), 0, 0);
            this.markScale = 1.0;
        }
    }
    
    draw(){
        push();
        //translate(this.rad, 0, 0);
        translate(this.pos.x, this.pos.y, this.pos.z);
        //if(this.struck == false){
            emissiveMaterial("#ea728c");
        //}else{
            //emissiveMaterial("#fc9d9d");
        //}
        sphere(this.rad);
        pop();
        
        push();
        translate(this.pos.x, this.pos.y, 0.01);
        //if(this.struck == false){
            emissiveMaterial("#f3d4d4");
        //}else{
            //emissiveMaterial("#ea728c");
        //}
        let hratio = map(min(this.initHeight, this.pos.z), 0.0, this.initHeight, 1.0, 0.25);
        let srad = min(this.rad * 2 * hratio, this.rad * 2.0) * this.shadowScale;
        ellipse(0,0, srad, srad);
        pop();
        
        if(this.struck){
            push();
            emissiveMaterial("#fc9d9d");
            translate(roomSize - 0.01, this.pos.y, this.struckHeight);
            rotateY(-PI * 0.5);
            let brad = this.rad * 2 * this.markScale;
            ellipse(0, 0, brad, brad);
            pop();
        }
    }
}