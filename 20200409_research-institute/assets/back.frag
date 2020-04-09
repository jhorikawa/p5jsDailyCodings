#ifdef GL_ES
precision mediump float;
#endif

#define PI 3.14159265359
#define TWO_PI 6.28318530718

uniform vec2 u_resolution;
uniform float u_time;
uniform float u_div;
uniform float u_shift;
uniform float u_speed;
uniform float u_liqlen;
uniform vec4 u_colorfront;
uniform vec4 u_colorback;
uniform int u_dir;

float map(float value, float from1, float to1, float from2, float to2){
  return from2 + (value - from1) / (to1 - from1) * (to2 - from2);
}

void main(){
  vec2 st = gl_FragCoord.xy/u_resolution;

  float time = mod(u_time * u_speed + u_shift, 1.0);
  if(u_dir < 0){
    time = 1.0 - time;
  }

  vec3 col = vec3(0);
  if((st.x > time && st.x < time + u_speed * u_liqlen) || (st.x < mod(time + u_speed * u_liqlen, 1.0) && time + u_speed * u_liqlen > 1.0)){
    col = u_colorfront.xyz;
  }else {
    col = u_colorback.xyz;
  }

  gl_FragColor = vec4(col, 1.0);
}
