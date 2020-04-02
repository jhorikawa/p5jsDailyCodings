let size = 100;
let grid = 15;
let toFuture = false;
let inFuture = false;
let end = false;
let restart = false;
let restartCount = 0;
let tiles = [];
let mobs = [];
let tbox;
let urashima;

function setup() {
    createCanvas(windowWidth, windowHeight, WEBGL);
    ortho(-width / 2, width / 2, height / 2, -height / 2, 0, 5000);
    camera(-2000, -2000, 2000, 0, 0, 0, 0, 0, 1);
    background(255);
    
    createEnv();
    createRandomMobs();
    tbox = new TreasureBox(0, 1, size);
    urashima = new Urashima(0, 0, size);
}

function draw() {
    if(inFuture){
        ambientLight(150);
    }else{
        ambientLight(150);
    }
    directionalLight(255, 255, 255, 0.4 , 0.7, -1);
    
    drawTiles();
    drawWhiteWave();
    drawUrashima();
    drawMobs();
    drawBox();
}

function drawUrashima(){
    urashima.update();
    urashima.draw();
}

function drawBox(){
    tbox.update();
    tbox.draw();
}

function drawTiles(){
    for(let i = 0; i<tiles.length; i++){
        tiles[i].draw();
    }
}

function drawMobs(){
    for(let i = 0; i<mobs.length; i++){
        mobs[i].update();
        mobs[i].draw();
    }
}
    

function createRandomMobs(){
  mobs = [];
    for(let i = 0; i < 20; i++){
        createRandomMob();
    }
}

function createRandomMob(){
    let canUseTiles = [];
    for(let i=0; i<tiles.length; i++){
        let tile = tiles[i];
        if(!tile.used){
            canUseTiles.push(tile);
        }
    }
    let rndIndex = floor(random(0, canUseTiles.length));
    let chosenTile = canUseTiles[rndIndex];
    let mob = new Mob(chosenTile.x, chosenTile.y, chosenTile.size, random(chosenTile.size * 0.1, chosenTile.size * 0.5));
    mobs.push(mob);
    chosenTile.used = true;
}

class Tile{
    constructor(x, y, size, grid, type, used){
        this.grid = grid;
        this.x = x;
        this.y = y;
        this.size = size;
        this.type = type;
        this.used = used;
    }
    
    draw(){
        push();
        translate(this.x * this.size, this.y * this.size);
        noStroke();
        if(this.type == "sea"){
            let col1 = color("#42dee1");
            let col2 = color("#3fc5f0");
            ambientMaterial(lerpColor(col1, col2, map(this.y, -5, -this.grid, 0.0, 1.0) * noise(this.x * 0.5, this.y * 0.5)));
        }else if(this.type == "ground"){
            let col1 = color("#eef5b2");
            let col2 = color("#6decb9");
            let col = color(255);
            if(inFuture){
                col = color("#827397");
            }else{
                col = lerpColor(col1, col2, map(max(this.y, 4), 0, this.grid, 0.0, 1.0) * noise(this.x * 0.5, this.y * 0.5));
            }
            ambientMaterial(col);
        }
        
        plane(this.size, this.size);
        pop();
    }
}

class Mob{
    constructor(x, y, size, rad){
        this.x = x;
        this.y = y;
        this.size = size;
        this.rad = rad;
        this.jump = 0;
        this.initCol = color("#d8b9c3");
        this.futCol = color("#faf4ff");
        this.col = color(255);
    }
    
    update(){
        if(inFuture){
            this.jump = 0;
            this.col = this.futCol;
        }else{
            this.jump = this.rad + abs(sin(radians(frameCount * 500 / this.rad))) * this.rad;
            this.col = this.initCol;
        }
    }
    
    draw(){
        push();
        noStroke();
      fill("#827397");
        translate(this.x * this.size, this.y * this.size, 0.02);
        ellipse(0, 0, this.rad * 1.5, this.rad * 1.5);
        pop();
        
        push();
        translate(this.x * this.size, this.y * this.size, this.jump);
        noStroke();
        emissiveMaterial(this.col);
        sphere(this.rad);
        pop();
    }
}

function mouseClicked(){
    if(toFuture == false){
        toFuture = true;
    }
    
    if(end == true){
        restart = true;
    }

}

class Urashima{
    constructor(x, y, size){
        this.x = x;
        this.y = y;
        this.size = size;
        this.jump = 0;
        this.initCol = color("#4d4c7dff");
        this.futCol = color("#faf4ff");
        this.col = color(255);
        this.futCount = 0;
    }
    
    update(){
        if(inFuture){
            this.futCount = max(this.futCount, 0.5);
            this.futCount += 0.004;
            this.futCount = min(this.futCount, 1.0);
            
            this.jump = abs(sin(radians(frameCount * 5))) * this.size * 0.25 * (1.0 - this.futCount) - this.futCount * this.size * 0.5;
            this.col = lerpColor(this.initCol, this.futCol, this.futCount);
            
            if(this.futCount == 1.0){
                end = true;
            }
        }else{
            this.futCount = 0;
            this.jump = abs(sin(radians(frameCount * 20))) * this.size * 0.25;
            this.col = this.initCol;
        }
    }
    
    draw(){
        push();
        noStroke();
        fill("#827397ff");
        translate(0,0, 0.02);
        ellipse(this.x * this.size, this.y * this.size, this.size * 0.5 * 1.5, this.size * 0.5 * 1.5);
        pop();

        push();
        noStroke();
        emissiveMaterial(this.col);
        translate(0, 0, size * 0.5 + this.jump);
        sphere(this.size * 0.5);
        pop();
    }
}

function createEnv(){
    // create ground
    for(let i = -grid; i<=grid; i++){
        for(let n = -grid; n<=grid; n++){
            let type ="";
            let used = false;
            if(n < -4){
                type = "sea";
                used = true;
            }else{
                type = "ground";
            }
            if((i == 0 && n == 0) || (i == 0 && n == 1)){
                used = true;
            }
            let tile = new Tile(i, n, size, grid, type, used);
            tiles.push(tile);
        }
    }

}

function drawWhiteWave(){
    // create white wave
    push();
    translate(0,0,0.01);
    noStroke();
    ambientMaterial("#ffffff")
    //fill(255);
    beginShape();
    for(let n =0; n < 2; n++){
        for(let i = -grid; i<=grid; i++){
            let mult = (n - 0.5) * 2.0;
            curveVertex(i * size * mult, -5.5* size + noise(i * size + frameCount * 0.01 + n * 1234) * size + size * n);
        }
    }
    endShape(CLOSE);
    pop();
}

class TreasureBox{
    constructor(x, y, size){
        this.x = x;
        this.y = y;
        this.size = size;
        this.ang = 0;
        this.boxh1 = this.size * 0.7;
        this.boxh2 = this.size * 0.3;
        this.col1 = color("#f8615a");
        this.col2 = color("#ffd868");
        this.smokeScale = 1.0;
        this.smokeAlpha = 255;
    }
    
    update(){
        if(toFuture == false){
            this.ang = -noise(frameCount* 0.1) * radians(15);
            this.smokeScale = 1.0;
            this.smoleAlpha = 255;
        }else{
            this.ang -= radians(5);
            this.ang = max(-PI * 0.75, this.ang);

            if(inFuture == false){
                this.smokeScale *= 1.1
                this.smokeScale = min(this.smokeScale, grid / 0.5);
                if(this.smokeScale > grid / 0.5  - 0.01 ){
                    inFuture = true;
                }
            }
            
            if(inFuture == true){
                if(restart == false){
                    this.smokeAlpha -= 10;
                    this.smokeAlpha = max(this.smokeAlpha, 0);
                }else{
                    this.smokeAlpha += 15;
                }
            }
        }
        
        // if(restart){
        //  restartCount++;
        // }

        if(this.smokeAlpha > 255 && restart == true){
            toFuture = false;
            inFuture = false;
            end = false;
            restart = false;
            createRandomMobs();
        }
    }
    
    draw(){
        push();
        noStroke();
        ambientMaterial(lerpColor(this.col1, this.col2, 0.25));
        translate(0, this.size, this.boxh1 * 0.5);
        box(this.size, this.size, this.boxh1);
        pop();

        push();
        noStroke();
        ambientMaterial(lerpColor(this.col1, this.col2, 0.75));
        translate(0, this.size + this.size * 0.5, this.boxh1);
        rotateX(this.ang);
        translate(0, -this.size * 0.5, + this.boxh2 * 0.5);
        box(this.size, this.size, this.boxh2);
        pop();

        push();
        noStroke();
        emissiveMaterial(255, 255, 255, this.smokeAlpha);
        translate(0, this.size, this.size * 0.5);
        sphere(this.size * 0.5 * this.smokeScale);
        pop();
    }
}
