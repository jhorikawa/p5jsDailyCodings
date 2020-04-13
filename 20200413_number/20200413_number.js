let backShader;
let font
let pg;
let primes = [];

let colors = [
  "#084177",
  "#687466",
  "#cd8d7b",
  "#fbc490"
];

function preload(){
  backShader = loadShader('assets/shader.vert', 'assets/shader.frag');
  font = loadFont('assets/SourceCodePro-Bold.ttf');
}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  pixelDensity(1);

  pg = createGraphics(width, height);
  pg.background(0);
  pg.textFont(font);
  pg.textSize(width * 0.4);
  pg.noStroke();
  pg.fill(255);
  pg.textAlign(CENTER, CENTER);

  generatePrimes();
  
}

function generatePrimes(){
  let searches = [];
  let maxnum = 100000;
  let limit = sqrt(maxnum);
  for(let i = 2; i<maxnum; i++){
    searches.push(i);
  }

  for(let n =0; n< maxnum; n++){
    let prime = searches[0];
    if(prime < limit){
      primes.push(prime);
      for(let i = searches.length-1; i>=0; i--){
        if(searches[i] % prime == 0){
          searches.splice(i, 1);
        }
      }
    }else{
      break;
    }
  }
}

function draw() {
  backShader.setUniform('u_resolution', [width, height]);
  backShader.setUniform('u_time', frameCount);
  backShader.setUniform('u_col1', color(colors[0])._array);
  backShader.setUniform('u_col2', color(colors[3])._array);

  pg.background(0);
  
  
  let mil = millis();
  let milval = mil % 1000 / 1000.0;
  backShader.setUniform('u_millis', milval);
  
  randomSeed(hour() * 425.234 + minute() * 592.52 + round(mil / 1000.0) * 395.235);
  pg.text(primes[floor(random() * primes.length)], width * 0.5, height * 0.4);
  backShader.setUniform('u_texture', pg);
  
  shader(backShader);
  rect(-width * 0.5, -height * 0.5, width, height);
}
