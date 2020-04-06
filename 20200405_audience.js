let size = 80;
let audiences; 

const ColorPalette = Object.freeze({
    "purple": "#21243d", 
    "pink": "#ff7c7c", 
    "orange": "#ffd082",
    "blue": "#88e1f2"
});

function setup() {
    createCanvas(windowWidth, windowHeight, WEBGL);
    ortho(-width / 2, width / 2, height / 2, -height / 2, 0, 5000);
    camera(0, -2000, 2000, 0, 0, 0, 0, 0, 1);
    background(255);

    audiences = new Audiences(size);
}



function draw() {
    background(255);
    ambientLight(200);
    directionalLight(255, 255, 255, 1, 1, -1);
    
    audiences.update();
    audiences.draw();
}

class Audience{
    constructor(x, y, size, xmax, ymax){
        this.x = x;
        this.y = y;
        this.size = size;
        this.xmax = xmax;
        this.ymax = ymax;
        
        this.offset = this.size + (sqrt(2*this.size*this.size) - this.size);
        
        this.posx = this.offset * x / 2.0;
        if(x % 2 == 0){
            this.posy = this.offset * y;
        }else{
            this.posy = this.offset * (y + 0.5);
        }
        this.randOffset = random();
        this.jumpSpeed = random(2.0, 6.0);
        
        this.offsetX = this.offset * xmax / 2.0 / 2.0;
        this.offsetY = this.offset * ymax / 2.0;
        let colval = noise(this.posx * 0.004, this.posy * 0.004);
        let col1= random() > 0.5 ? color(ColorPalette.orange) : color(ColorPalette.blue);
        let col2 = color(ColorPalette.pink);//color(ColorPalette.purple);
        //let col3 = color(ColorPalette.blue);
        
        this.color = lerpColor(col1, col2, colval);
        this.initCol = this.color;
        this.height = 0;//random() * this.size;
        this.waving = false;
        
    }
    
    updateHeight(cx, range, height){
        let dif = map(min(abs(cx - this.x), range), 0.0, range, 0, PI);
        dif = map(cos(dif), -1.0, 1.0, 0.0, 1);
        this.color = lerpColor(this.initCol, color(ColorPalette.purple), dif * 0.25);
        let val = dif * height;
        if(val > this.height){
            this.height = val;
        }
    }
    
    update(){
        this.height = abs(sin(radians(frameCount * this.jumpSpeed) + TWO_PI * this.randOffset)) * this.size * this.randOffset;
    }
    
    draw(){
        push();
        translate(-this.offsetX, -this.offsetY, 0);
        push();
        let ang = frameCount * 1.0;
        let angt = map(ang % 90.0, 0.0, 90.0, 0, PI);
        angt = sin(angt);
        
        
        translate(this.posx, this.posy, this.height);
        noStroke();
        ambientMaterial(this.color);
        rotateZ(radians(45));
        box(this.size);
        pop()
        pop();
    }
}

class Audiences{
    constructor(size){
        this.size = size;
        this.xnum = ceil(width / size * 1.5);
        this.ynum = ceil(height / size * 1.5);
        // this.speed = 0.3;
        // this.range = 10.0;
        // this.waveHeight = 3.0;
        // this.cx = -this.range;
        this.initWaveInfo();
        
        this.audiences = [];
        
        for(let i=0; i<this.xnum; i++){
            for(let n=0; n<this.ynum; n++){
                let audience = new Audience(i, n, size, this.xnum, this.ynum);
                this.audiences.push(audience);
            }
        }
    }
    
 initWaveInfo(){
     this.range = random(5.0, 15.0);
     this.speed = random(0.2, 0.4);
     this.waveHeight = map(this.range, 5.0, 15.0, 2.0, 6.0);
     this.cx = -this.range;
 }
    
    wave(){
            this.cx += this.speed;
            this.cx = min(this.cx, this.xnum - 1 + this.range);
            
            for(let i =0; i<this.audiences.length; i++){
                let audience = this.audiences[i];
                audience.updateHeight(this.cx, this.range, this.size * this.waveHeight);
            }
            
            if(this.cx == this.xnum -1 + this.range){
                // this.cx = -this.range;
                this.initWaveInfo();
            }
    }
    
    update(){

        for(let i=0; i<this.audiences.length; i++){
            this.audiences[i].update();
        }
        
        this.wave();
    }
    
    draw(){
        for(let i=0; i<this.audiences.length; i++){
            this.audiences[i].draw();
        }
    }
}