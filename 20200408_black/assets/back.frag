#ifdef GL_ES
precision mediump float;
#endif

#define PI 3.14159265359
#define TWO_PI 6.28318530718

uniform vec2 u_resolution;
uniform float u_time;
uniform float u_div;
uniform float u_thickness;
uniform float u_speed;
uniform vec4 u_color1;
uniform vec4 u_color2;


float map(float value, float from1, float to1, float from2, float to2){
  return from2 + (value - from1) / (to1 - from1) * (to2 - from2);
}


void main(){
  vec2 st = gl_FragCoord.xy/u_resolution;
  
  float y = step(u_thickness * u_div, mod(st.y + u_time * u_speed, u_div));

  vec4 color = mix(u_color1, u_color2, y);
  gl_FragColor = color;
}
