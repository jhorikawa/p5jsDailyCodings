#ifdef GL_ES
precision highp float;
#endif

#define PI 3.14159265359
#define TWO_PI 6.28318530718

uniform vec2 u_resolution;
uniform float u_time;
uniform float u_glitchval;
uniform float u_glitchdiv;
uniform float u_glitchdens;
uniform sampler2D u_tex;
uniform sampler2D u_mask;


float map(float value, float from1, float to1, float from2, float to2){
  return from2 + (value - from1) / (to1 - from1) * (to2 - from2);
}

float random (vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

void main(){
  vec2 st = gl_FragCoord.xy/u_resolution;

  float ynum = floor(st.y / u_glitchdiv);
  vec2 glitchoffset = vec2(0.0, 0.0);
  if(random(vec2(u_time * 0.0000001 + 23.0, ynum)) < u_glitchdens){
    float glitchval = u_glitchval * random(vec2(u_time * 0.00000001 + 234.0, ynum));
    glitchoffset = vec2(map(random(vec2(u_time * 0.00000001, ynum)), 0.0, 1.0, -glitchval, glitchval) / u_resolution.x, 0.0);
  }

  vec4 mask = texture2D(u_mask, st + glitchoffset);
  vec4 texcol = texture2D(u_tex, st+ glitchoffset);


  float offset = 10.0;
  
  vec4 offsetmask1 = texture2D(u_mask, vec2(st.x - offset / u_resolution.x, st.y)+ glitchoffset);
  vec4 offsetmask2 = texture2D(u_mask, vec2(st.x + offset / u_resolution.x, st.y)+ glitchoffset);
  
  vec4 offsetcol1 = texture2D(u_tex, vec2(st.x - offset / u_resolution.x, st.y)+ glitchoffset);
  vec4 offsetcol2 = texture2D(u_tex, vec2(st.x + offset / u_resolution.x, st.y)+ glitchoffset);

  vec4 col = texcol;
  if(offsetmask1.x > 0.5 && mask.x < 0.5){
    col = max(texcol, vec4(0.8, 0.0, 0.0, 1.0));
  }else if(offsetmask2.x > 0.5 && mask.x < 0.5){
    col = max(texcol, vec4(0.0, 0.0, 0.8, 1.0));
  }

  gl_FragColor = col;
}
