let bgcol = "#ff7272";

function setup() {
    createCanvas(windowWidth, windowHeight);
    background(bgcol);
}

function draw() {
    background(bgcol);
    let from = color("#ffd31d");
    let to = color("#fae7cb");
    let num =400;
    let nnum = 10;
    for(let n=0; n<nnum; n++){
        for(let i=0; i<num; i++){
            let nval = n / float(nnum);
            let angle =sqrt(i) +nval * TWO_PI + radians(frameCount);
            let rad =  sqrt(i * 1500.0);
            let x = cos(angle) * rad + windowWidth * 0.5;
            let y = sin(angle) * rad  + windowHeight * 0.5;
            noStroke();

            
            let crad = 20;
            //let size =  (angle + TWO_PI) % TWO_PI * 2;
            nval += frameCount * 0.05;
            nval = nval % 1.0;
            let interCol =lerpColor(from, to,  nval);
            fill(interCol);
            ellipse(x, y, crad * nval, crad * nval);
        }
    }
}