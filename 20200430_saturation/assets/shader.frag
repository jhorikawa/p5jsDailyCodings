#ifdef GL_ES
precision mediump float;
#endif

#define PI 3.14159265359
#define TWO_PI 6.28318530718
#define POSITIONNUM 500

uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_positions[POSITIONNUM];
uniform int u_num;
uniform float u_stepsize;
uniform vec4 u_col1;
uniform vec4 u_col2;
uniform vec4 u_col3;
uniform vec4 u_bgcol;
uniform float u_colval;


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

  float minDist = 1000000.0;
  int minIndex = -1;
  for(int i=0; i < POSITIONNUM; i++){
    if(i < u_num){
      vec2 pos = u_positions[i];
      float dist = pow(abs(gl_FragCoord.x - pos.x), 3.5) + pow(abs(gl_FragCoord.y - pos.y), 3.5);//distance(gl_FragCoord.xy, pos.xy);
      if(minDist > dist){
        minDist = dist;
        minIndex = i;
      }
    }
  }

  float ind = float(minIndex);
  vec3 col = u_bgcol.xyz;
  if(minIndex != -1){
    float thresh = clamp(minDist / pow(u_stepsize, 3.5), 0., 1.);
    vec3 tcol = mix(mix(u_col1.xyz, u_col2.xyz, rand(float(ind) * 5.6623)), u_col3.xyz, u_colval * 0.6);
    col = mix(tcol, col, thresh);
    
  }
  

  gl_FragColor = vec4(col, 1.0);
}
