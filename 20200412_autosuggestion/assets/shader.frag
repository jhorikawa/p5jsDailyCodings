#ifdef GL_ES
precision highp float;
#endif

#define PI 3.14159265359
#define TWO_PI 6.28318530718

uniform vec2 u_resolution;
uniform float u_time;
uniform vec4 u_color1;
uniform vec4 u_color2;
uniform float u_sep;
uniform float u_div;
uniform float u_flip;

float map(float value, float from1, float to1, float from2, float to2){
  return from2 + (value - from1) / (to1 - from1) * (to2 - from2);
}

void main(){
  vec2 st = gl_FragCoord.xy/u_resolution;

  float dlen = sqrt(2.0);
  float div = dlen / u_div;

  vec2 norm = normalize(vec2(1.0, 1.0 * u_flip));
  float len = dot(norm, st) + u_time * 0.5;
  float modlen = mod(len, div);

  float sep = clamp(map(sin(radians(u_time * 100.0)), -1.0, 1.0, -0.05, 1.05), 0.0, 1.0);


  vec4 col = mix(u_color1, u_color2, step(div * u_sep, modlen));

  gl_FragColor = col;
}
