#ifdef GL_ES
precision highp float;
#endif

#define PI 3.14159265359
#define TWO_PI 6.28318530718
#define METABALLNUM 100

uniform vec2 u_resolution;
uniform float u_time;
uniform vec4 u_col1;
uniform vec4 u_col2;

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

  vec3 lightdir = normalize(vec3(-0.5, -0.8, 1.0));
  float lightdot = clamp(dot(lightdir, vNormal), 0.0, 1.0);

  float dotScale = 1.0;

  vec2 v = gl_FragCoord.xy * dotScale;
  float f = (sin(v.x) * 0.5 + 0.5) + (sin(v.y) * 0.5 + 0.5);

  float s;
  if(lightdot > 0.7){
      s = 1.0;
  }else if(lightdot > 0.2){
      s = 0.6;
  }else{
      s = 0.4;
  }

  float mixval = (lightdot + f) * s;
  vec3 col = mix(u_col2.xyz, u_col1.xyz, mixval);
  

  gl_FragColor = vec4(col, 1.0);
}
