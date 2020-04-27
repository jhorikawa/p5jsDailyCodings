let curTime = 0.0;
let seed;

const ColorPalette = Object.freeze({
  "yellow" : "#fff5a5",
  "orange" : "#ffaa64",
  "darkorange" : "#ff8264",
  "red": "#ff6464",
  "lightblue": "#dff6f0",
  "blue":"#46b3e6",
  "purple": "#4d80e4",
  "darkblue":"#2e279d"
});


function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  pixelDensity(1);
  noStroke();
  
  perspective(PI / 3.0, width / height, 0.1, 100000);
  seed = random(100.0, 1000.0);
}

function draw() {
  background(255);
  
  camera(0, 1800, (height/2.0) / tan(PI*30.0 / 180.0), 0, 1800, 0, 0, -1.0, 0);
  directionalLight(200, 200, 200, -0.5, -0.7, -1);
  ambientLight(200);
  noStroke();
  let stepNum = 50;
  let stepHeight = 150.0;
  let stepDepth = 300.0;
  let stepRatio = stepHeight / stepDepth;
  let speed = 10.0;
  
  push();
  translate(0,-frameCount * speed * stepRatio,frameCount * speed);
  let stepgo = floor((frameCount * speed) / stepDepth);
  for(let i=stepgo; i<stepNum + stepgo; i++){
    push();
    translate(0, i * stepHeight, -i * stepDepth + 2000);
    rotateY(0);
    let colthresh = map(i, stepgo, stepNum + stepgo-1, 0.0, 1.0);
    colthresh = map(min(colthresh, 0.7), 0, 0.7, 0.0, 1.0);
    let col1 = lerpColor(color(ColorPalette.blue), color(ColorPalette.lightblue), pow(colthresh,1.5));
    fill(col1);
    box(100000, stepHeight, stepDepth);
    pop();
  }

  
  let buildstep = 3;
  let stepgo2 = floor(stepgo / buildstep) * buildstep;

  for(let i=stepgo2; i<stepNum*2 + stepgo2; i+=buildstep){
    let sizex = random(2000, 10000);
    randomSeed(i * seed);
    let sizey = random(300,1500) + stepHeight * i;
    let sizez = random(500, 3000);

    for(let n=-1; n<=1; n+=2){
      push();
      translate((sizex * 0.5 + width * 0.75) * n, sizey * 0.5, -i * stepDepth + 2000);
      translate((cos(radians(i * 10)) - cos(radians(75 + frameCount * speed / buildstep * 0.1))) * width * 0.5, 0, 0); //75 -
      let thresh = map(i, stepgo2, stepNum*2 + stepgo2, 0.0, 1.0); 
      thresh = map(min(thresh, 0.4), 0.0, 0.4, 0.0, 1.0);
      let col1 = lerpColor(color(ColorPalette.blue), color(ColorPalette.purple), random());
      let col2 = color(ColorPalette.lightblue);
      ambientMaterial(lerpColor(col1, col2, pow(thresh, 1.5)));
      box(sizex, sizey, sizez);
      pop();
    }
    
  }
  pop();

  curTime += deltaTime * 0.001;
}

