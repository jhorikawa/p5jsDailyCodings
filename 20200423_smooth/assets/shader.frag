#ifdef GL_ES
precision highp float;
#endif

#define PI 3.14159265359
#define TWO_PI 6.28318530718
#define METABALLNUM 100

uniform vec3 uLightingDirection;
uniform vec2 u_resolution;
uniform float u_time;
uniform bool u_front;
uniform vec4 u_col;
uniform float u_index;
uniform float u_depth;

varying vec2 vTexCoord;
varying vec3 vNormal;

float map(float value, float from1, float to1, float from2, float to2){
  return from2 + (value - from1) / (to1 - from1) * (to2 - from2);
}

float random (vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

float random( vec3 scale, float seed ){
  return fract( sin( dot( gl_FragCoord.xyz + seed, scale ) ) * 43758.5453 + seed ) ;
}

void main(){
  vec2 st = gl_FragCoord.xy/u_resolution;
  float dotval = map(pow(u_depth, 0.5), 0.0, 1.0, 0.5, 1.0);
  
  if(!u_front){
    dotval *= 0.7;
  }

  float alpha = step(map(sin(radians(u_time * 100.0)), -1.0, 1.0, 0.3, 0.4), vTexCoord.y);
  float stepval = map(pow(u_index, 0.5), 0.0, 1.0, 0.3, 0.00);
  alpha = step(stepval, vTexCoord.y);
  
  gl_FragColor = vec4(vec3(u_col.xyz) * dotval, alpha);
}
