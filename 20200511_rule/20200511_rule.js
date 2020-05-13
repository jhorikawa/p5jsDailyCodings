let renderer;
let num = 10;

const ColorPalette = Object.freeze({
	"dark": "#f38181",
  "light": "#fce38a",
  "shadow": "#eaffd0",
  "shade" : "#ff9de2",
  "white" : "#ffffff"
});

function setup() {
  renderer = createCanvas(windowWidth, windowHeight);
}

function draw() {
  background(ColorPalette.light);
  strokeWeight(1);
  noStroke();

  let brad = min(height, width) * 0.4;
  let lastrad = brad;
  let speed = frameCount * 5 / num;

  push();
    translate(width * 0.5, height * 0.5);
    for(let i=0; i<num; i++){
      let t = i / (num-1);
      let timeval = map(sin(radians(speed)), -1.0, 1.0, 0.0, 1.0);
      timeval = easeInOutQuart(timeval);
      let rad = map(t, 0.0, 1.0, brad, brad * 0.1);
      let ang = radians(speed);

      let col = lerpColor(color(ColorPalette.dark), color(ColorPalette.shadow), t);
      fill(col);

      
      let movex = lastrad - rad;
      translate(movex, 0);
      rotate(ang);
      noStroke();
      ellipse(0, 0, rad * 2.0, rad * 2.0);

      lastrad = rad;
    }
  pop();
}

function easeOutElastic(x) {
  const c4 = (2 * Math.PI) / 3;
  
  return x === 0
    ? 0
    : x === 1
    ? 1
    : pow(2, -10 * x) * sin((x * 10 - 0.75) * c4) + 1;
  }

function easeInOutQuart(x) {
  return x < 0.5 ? 8 * x * x * x * x : 1 - pow(-2 * x + 2, 4) / 2;
  }
