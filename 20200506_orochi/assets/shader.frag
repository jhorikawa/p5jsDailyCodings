#ifdef GL_ES
precision mediump float;
#endif

#define PI 3.14159265359
#define TWO_PI 6.28318530718
#define POSITIONNUM 500

uniform vec2 u_resolution;
uniform float u_time;
uniform vec4 u_col1;
uniform vec4 u_col2;
uniform vec4 u_col3;

varying vec3 vNormal;
varying vec3 vPosition;
varying vec4 glPosition;

float map(float value, float from1, float to1, float from2, float to2){
  return from2 + (value - from1) / (to1 - from1) * (to2 - from2);
}

float rand(float n){return fract(sin(n) * 43758.5453123);}

float rand(vec2 n) { 
	return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
}

float noise(float p){
	float fl = floor(p);
  float fc = fract(p);
	return mix(rand(fl), rand(fl + 1.0), fc);
}
	
float noise(vec2 n) {
	const vec2 d = vec2(0.0, 1.0);
  vec2 b = floor(n), f = smoothstep(vec2(0.0), vec2(1.0), fract(n));
	return mix(mix(rand(b), rand(b + d.yx), f.x), mix(rand(b + d.xy), rand(b + d.yy), f.x), f.y);
}

void main(){
  vec2 st = gl_FragCoord.xy/u_resolution;
  float depth = (glPosition.z / glPosition.w + 1.0) * 0.5;
  float minval = 0.8;
  float maxval = 0.95;
  depth = map(clamp(depth, minval, maxval), minval, maxval, 1.0, 0.0);

  vec3 light = vec3(0.5, 1.0, -0.5);
  float dotval = map(dot(light, vNormal), -1.0, 1.0, 1.0, 0.0);
  float val = 1.0;
  // if(dotval * depth < 0.27){
  //   float gridsep = 15.;
  //   float dist = gridsep * 100.0;
  //   vec2 gridmin = floor(gl_FragCoord.xy / gridsep);
  //   for(float i=0.; i<2.; i++){
  //     for(float n = 0.; n<2.; n++){
  //       vec2 gridind = gridmin + vec2(i, n);
  //       vec2 gridpos = gridind * gridsep;
  //       dist = min(distance(gl_FragCoord.xy, gridpos), dist);
  //     }
  //   }

  //   float rad = gridsep * 0.4;
  //   if(dist < rad){
  //     val = pow(dist / rad, 4.0);
  //   }
  // }

  vec3 col = mix(u_col2.xyz, u_col3.xyz, step(0.27, dotval * depth));
  col = mix(u_col1.xyz, col.xyz, val);

  gl_FragColor = vec4(col, 1.0);
}
