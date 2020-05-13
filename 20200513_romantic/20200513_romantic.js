let renderer;
let curTime = 0.0;

const ColorPalette = Object.freeze({
	"color1": "#f8f3d4",
  "color2": "#f6416c",
  "color3": "#ffde7d",
  "color4" : "#ededed"
});


function setup() {
  renderer = createCanvas(windowWidth, windowHeight);
}

function draw() {
  background(ColorPalette.color1);

  stroke(0);
  
  noFill();

  let scale = min(height, width) / 45;
  scale *= map(sin(curTime * 0.5 * TWO_PI), -1, 1, 0.8, 1.0);
  push();
  translate(width * 0.5, height * 0.5);
  let time = (easeInOutElastic(map(sin(curTime * 0.25 * TWO_PI), -1.0, 1.0, 0.0, 1.0)) - 0.5) * 2;
  rotate(radians(15 * time));

  let num = 300;
  let miny = heartPos(HALF_PI * 0.5).y;
  let maxy = heartPos(PI).y;

  for(let i=0; i<num; i++){
    let t = i / num;
    stroke(t * 255, 0, 0);
    let ang = t * TWO_PI;
    let pos = heartPos(ang);


    let elx = 0;
    let ely = -pos.y;
    let dia = pos.x * 2.0
    if((ang < HALF_PI && ang > HALF_PI * 0.5) || (ang > 3 * HALF_PI && ang < 3.5 * HALF_PI)){
      elx = 16.0 * 0.5 * pos.x / abs(pos.x);
      dia -= 16.0 * pos.x / abs(pos.x);
    }

    if((ang > HALF_PI * 0.5 && ang < HALF_PI) || ang >= HALF_PI && ang < PI * 0.93 || (ang > 3 * HALF_PI && ang < 3.5 * HALF_PI)){
      
      let ht = map(pos.y, miny, maxy, 0.0, 1.0);
      let ht2 = map(sin(ht * PI), -1.0, 1.0, 0.0, 1.0);
      let t2 = map(sin((ht + curTime * 0.5) % 1.0 * TWO_PI), -1, 1, 0.0, 1.0);
      let h = sin(ht * PI) * 100 * t2;
      let colt = pow(t2, 1.5);
      strokeWeight(map(colt, 0.0, 1.0, 10.0, 0.0));
      let stcol = lerpColor(color(ColorPalette.color2), color(ColorPalette.color3), colt);
      stcol._array[3] = 0.5;
      stroke(stcol);

      push();
        translate(elx * scale, ely * scale);
        ellipse(0, 0, dia * scale, h);
      pop();
    }

  }
  pop();

  curTime += deltaTime * 0.001;
}

function heartPos(ang){
  let x = 16.0 * pow(sin(ang), 3);
  let y = 13.0 * cos(ang) - 5 * cos(2 * ang) - 2 * cos(3 * ang) - cos(4 * ang);
  return createVector(x, y);
}

function easeInOutElastic(x) {
  const c5 = (2 * Math.PI) / 4.5;

  return x === 0
    ? 0
    : x === 1
    ? 1
    : x < 0.5
    ? -(pow(2, 20 * x - 10) * sin((20 * x - 11.125) * c5)) / 2
    : (pow(2, -20 * x + 10) * sin((20 * x - 11.125) * c5)) / 2 + 1;
}