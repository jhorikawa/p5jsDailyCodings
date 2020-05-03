#ifdef GL_ES
precision mediump float;
#endif

#define PI 3.14159265359
#define TWO_PI 6.28318530718
#define POSITIONNUM 500

uniform vec2 u_resolution;
uniform float u_time;
uniform vec3 u_campos;
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
  float minval = 0.9;
  float maxval = 0.95;
  depth = map(clamp(depth, minval, maxval), minval, maxval, 1.0, 0.0);

  vec3 dir = normalize(vPosition - u_campos);
  float edgemin = 0.7;
  float dotval = map(min(edgemin, pow(abs(dot(dir, vNormal)), 0.5)), 0.0, edgemin, 0.0, 1.0);

  vec3 col1 = u_col2.xyz * depth;
  vec3 col2 = u_col3.xyz * depth;
  float intensity = map(dot(vec3(0.0, -1.0, 0.0), vNormal), -1.0, 1.0, 0.0, 1.0);
  vec3 col = mix(col1, col2, intensity);
  col = mix(u_col1.xyz, col, dotval);

  gl_FragColor = vec4(col, 1.0);
}
