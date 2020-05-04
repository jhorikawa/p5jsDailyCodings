#ifdef GL_ES
precision mediump float;
#endif

#define PI 3.14159265359
#define TWO_PI 6.28318530718
#define METABALLNUM 10

uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_positions[METABALLNUM];
uniform float u_radiuses[METABALLNUM];
uniform int u_metanum;
uniform vec4 u_backcol1;
uniform vec4 u_backcol2;
uniform vec4 u_col1;
uniform vec4 u_col2;

varying vec3 vNormal;
varying vec3 vPosition;
varying vec2 vTexCoord;

float map(float value, float from1, float to1, float from2, float to2){
  return from2 + (value - from1) / (to1 - from1) * (to2 - from2);
}

float rand(float n){return fract(sin(n) * 43758.5453123);}

float rand(vec2 n) { 
	return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
}

float metaball(vec2 metapos, float rad)
{
  vec2 p = gl_FragCoord.xy - metapos;
	return pow(rad, 2.0)  / dot(p, p);
}

void main(){
  vec2 st = gl_FragCoord.xy/u_resolution;

  vec3 col = mix(u_backcol1.xyz, u_backcol2.xyz, st.y);
  float maxPower = 0.;
  float pixPower = 0.;

  for(int i=0; i<METABALLNUM; i++){
    if(i < u_metanum){
      vec2 pos = u_positions[i];
      float rad = u_radiuses[i];
      float power = metaball(pos, rad);
      pixPower += power;

      if(maxPower < power){
        maxPower = power;
      }
    }
  }

  vec3 val = vec3(0.0);
  val = mix(u_col1.xyz, u_col2.xyz, st.y);

  
  float pixMin = 2.5;
  float thresh = 0.02;
  if(pixPower > pixMin){
    float mixval = map(min(pixPower, pixMin + thresh), pixMin, pixMin + thresh, 0.0, 1.0);
    col = mix(mix(u_backcol1.xyz, u_backcol2.xyz, st.y), val, mixval);
  }

  col = mix(col, vec3(1.0), rand(st * 2.523) * 0.4);

  gl_FragColor = vec4(col, 1.0);
}
