let backShader;
let torusShader;
let shaderTexture;
let grid;
let prevsep = -1.0;
let colcount1 = 1;
let colcount2 = 0;
let flip = 1.0;
let div = 20.0;

let colors = [
  "#21243d",
  "#ff7c7c",
  "#ffd082",
  "#88e1f2"
];

function preload(){
  backShader = loadShader('assets/shader.vert', 'assets/shader.frag');
  torusShader = loadShader('assets/shader.vert', 'assets/shader.frag');
}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  pixelDensity(2);
  camera(0,400, 1, 0, 0, 0, 0, 1, 0);
  shaderTexture = createGraphics(512, 512, WEBGL);
  shaderTexture.noStroke();
  shaderTexture.shader(torusShader);
  
}

function draw() {
  background(255);
  if(frameCount < 3){
    torusShader.setUniform('u_resolution', [shaderTexture.width, shaderTexture.height]);
    
  }
  torusShader.setUniform('u_time', radians(frameCount));


  let sep = constrain(map(sin(radians(frameCount * 1.0)), -1.0, 1.0, -0.1, 1.1), 0.0, 1.0);
  torusShader.setUniform('u_sep', sep);

  let col1, col2;

  if(sep != prevsep && sep == 1.0){
    colcount1 ++;
    colcount1 = colcount1 % colors.length;
    flip *= -1.0;
    div = floor(random(3.0, 30.0));
    prevsep = sep;
  }

  if(sep != prevsep && sep == 0.0){
    colcount2 ++;
    colcount2 = colcount2 % colors.length;
    flip *= -1.0;
    div = floor(random(3.0, 30.0));
    prevsep = sep;
  }
  
  col1 = colors[colcount1];
  col2 = colors[colcount2];

  torusShader.setUniform('u_color1', color(col2)._array);
  torusShader.setUniform('u_color2', color(col1)._array);
  torusShader.setUniform('u_flip', flip);
  torusShader.setUniform('u_div', div);

  shaderTexture.rect(-shaderTexture.width*0.5, - shaderTexture.height * 0.5,shaderTexture.width, shaderTexture.height);

  texture(shaderTexture);
  noStroke();
  let size = map(sep, 0.0, 1.0, 140, 180);
  torus(200, size, 80, 60);
}
