let backShader;
let curTime = 0.0;

const ColorPalette = Object.freeze({
	"color1": "#af8baf",
	"color2": "#142850"
});

function preload(){
  backShader = loadShader('assets/shader.vert', 'assets/shader.frag');
}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);

  noStroke();
  pixelDensity(1.0);

}

function draw() {
  background(50);

  if(frameCount < 5){
    backShader.setUniform('u_resolution', [width, height]);
    backShader.setUniform('u_col1', color(ColorPalette.color1)._array);
    backShader.setUniform('u_col2', color(ColorPalette.color2)._array);
  }
  backShader.setUniform('u_time', curTime);

  
  fill(255,0,0);
  shader(backShader);
  rect(-width * 0.5, -height * 0.5, width, height);
  resetShader();

  curTime += deltaTime * 0.001;
}

