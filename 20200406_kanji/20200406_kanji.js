let size = 300;
let kanjis = [];
let offset = 40;
let num = 4;
let woffset = 0;
let count = 0;
let gridNum = 7;
let thickness = 9;
let bold = true;

const ColorPalette = Object.freeze({
    "black": "#1b262c",
    "blue": "#0f4c81",
    "purple": "#721b65", 
    "red": "#b80d57", 
    "orange": "#f8615a",
    "yellow": "#ffd868",
    "lightblue": "#00a8cc"
});

function setup() {
    createCanvas(windowWidth, windowHeight);
    background(ColorPalette.red);
    createKanjis();
}

function draw() {
    if(frameCount % 5 == 0){
        count++;
        let index = floor(random(0, kanjis.length));//count % kanjis.length;
        kanjis[index] = createKanji(kanjis[index].x, kanjis[index].y);
    }
}

function createKanjis(){
    size = floor(height / num);
    woffset = (size - width % size) * 0.5;
    for(let i=0; i< num; i++){
        for(let n=0; n< ceil(width / size); n++){
            let txt = String.fromCharCode(random((0x4E00, 0x9FD0)));
            let kanji = new Kanji(n * size + offset * 0.5 - woffset, i * size + offset * 0.5, size - offset, gridNum, thickness, txt, bold);
            kanji.setup();
            kanji.draw();
            
            kanjis.push(kanji);
        }
    }
}

function createKanji(x, y){
    let txt = String.fromCharCode(random((0x4E00, 0x9FD0)));
    let kanji = new Kanji(x, y, size - offset, gridNum, thickness, txt, bold);
    kanji.setup();
    kanji.draw();
    return kanji;
}



class Node{
    constructor(id, x, y, pos){
        this.id = id;
        this.x = x;
        this.y = y;
        this.pos = pos;
        this.lines = [];
    }
}

class Line{
    constructor(node1, node2){
        this.node1 = node1;
        this.node2 = node2;
        this.display = true;
        
        this.midpos = this.node1.pos.copy(); 
        this.midpos.add(this.node2.pos); 
        this.midpos.mult(0.5);
    }
    
    getMidIndex(width){
        let midindex = (floor(this.midpos.x) + floor(this.midpos.y)* width) * 4;
        return midindex;
    }
    
    draw1(pg, thickness){
        if(this.display == true){
            pg.stroke(ColorPalette.yellow);
            pg.strokeWeight(thickness * 2);
            pg.line(this.node1.pos.x, this.node1.pos.y, this.node2.pos.x, this.node2.pos.y);
        }
    }
    
    draw2(pg, thickness){
        if(this.display == true){
            pg.stroke(ColorPalette.red);
            pg.strokeWeight(thickness);
            pg.line(this.node1.pos.x, this.node1.pos.y, this.node2.pos.x, this.node2.pos.y);
        }
    }
}

class Kanji{
    constructor(x, y, size, gridNum, thickness, char, bold){
        this.bold = bold;
        this.x = x;
        this.y = y;
        this.size = size;
        this.thickness = thickness;
        this.mainPg = createGraphics(this.size, this.size);
        this.maskPg = createGraphics(this.size, this.size);
        this.textPg = createGraphics(this.size, this.size);
        this.char = char;
        this.gridNum = gridNum;
        this.pixels = [];
        this.nodes = [];
        this.lines = [];
    }
    
    getNode(x, y){
        let index = this.gridNum * y + x;
        return this.nodes[index];
    }
    
    setup(){
        this.maskPg.fill(255);
        this.maskPg.noStroke();
        this.maskPg.ellipse(this.size * 0.5, this.size * 0.5, this.size, this.size);
        
        this.textPg.background(255);
        this.textPg.fill(0);
        this.textPg.noStroke();
        this.textPg.textSize(this.size);
        this.textPg.textAlign(LEFT, BOTTOM);
        if(this.bold){
            this.textPg.textStyle(BOLD);
        }
        this.textPg.text(this.char, 0, this.size * 1.05);
        this.textPg.loadPixels();
        this.pixels = this.textPg.pixels.slice();
        
        this.mainPg.background(ColorPalette.blue);
        let id = 0;
        for(let n=0; n<this.gridNum; n++){
            for(let i=0; i<this.gridNum; i++){
                let pos = createVector(this.size / (this.gridNum-1) * i, this.size / (this.gridNum - 1) * n);
                let node = new Node(id, i, n, pos);
                this.nodes.push(node);
                id += 1;
            }
        }
        
        for(let n=0; n<this.gridNum-1; n++){
            for(let i=0; i<this.gridNum-1; i++){
                let nind1 = n * this.gridNum + i;
                let nind2 = n * this.gridNum + i  + 1;
                let nind3 = (n + 1) * this.gridNum + i;

                let node1 = this.getNode(i, n);
                let node2 = this.getNode(i + 1, n);
                let node3 = this.getNode(i, n+1);

                let line12 = new Line(node1, node2);
                let line13 = new Line(node1, node3);

                let ind12 = line12.getMidIndex(this.size);
                let ind13 = line13.getMidIndex(this.size);

                if(this.pixels[ind13] < 50){
                    this.lines.push(line13);
                    node1.lines.push(line13);
                    node3.lines.push(line13);
                }
                if(this.pixels[ind12]  < 50){
                    this.lines.push(line12);
                    node1.lines.push(line12);
                    node2.lines.push(line12);
                }
            }
        }

        for(let i=0; i<this.nodes.length; i++){
            let node = this.nodes[i];
            if (node.lines.length == 1){
                node.lines[0].display = false;
            }
        }
    }
    
    draw(){
        push();
        translate(this.x, this.y);
        
        this.mainPg.noFill();
        this.mainPg.stroke(ColorPalette.yellow);
        this.mainPg.strokeWeight(this.thickness * 3);
        this.mainPg.ellipse(this.size * 0.5, this.size * 0.5, this.size, this.size);
        
        for(let i=0; i<this.lines.length; i++){
            let line = this.lines[i];
            line.draw1(this.mainPg, this.thickness);
        }
        
        for(let i=0; i<this.lines.length; i++){
            let line = this.lines[i];
            line.draw2(this.mainPg, this.thickness);
        }

        this.mainPg.stroke(ColorPalette.red);
        this.mainPg.strokeWeight(this.thickness * 2);
        this.mainPg.ellipse(this.size * 0.5, this.size * 0.5, this.size, this.size);
        
        var mainImg = createImage(this.mainPg.width, this.mainPg.height);
        mainImg.copy(this.mainPg, 0, 0, this.mainPg.width, this.mainPg.height, 0, 0, this.mainPg.width, this.mainPg.height);

        mainImg.mask(this.maskPg);
        image(mainImg, 0, 0);
        pop();
    }
}