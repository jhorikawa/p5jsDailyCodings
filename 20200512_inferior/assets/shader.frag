#ifdef GL_ES
precision mediump float;
#endif

#define PI 3.14159265359
#define TWO_PI 6.28318530718
#define POSITIONNUM 20

uniform vec2 u_resolution;
uniform float u_time;
uniform vec4 u_col1;
uniform vec4 u_col2;
uniform vec2 u_positions[POSITIONNUM];
uniform vec2 u_light;
uniform float u_inferiorrad;
uniform float u_superiorrad;
uniform int u_positionsnum;
uniform float u_offset;

varying vec3 vNormal;
varying vec3 vPosition;
varying vec4 glPosition;
varying vec2 vTexCoord;

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

vec2 rotate(vec2 v, float a) {
	float s = sin(a);
	float c = cos(a);
	mat2 m = mat2(c, -s, s, c);
	return m * v;
}

void main(){
  vec2 st = gl_FragCoord.xy/u_resolution;

  float colval = 1.0;
  vec2 sidevec = rotate(u_light, PI * 0.5);
  vec2 lightvec = normalize(u_light);
  float shadowlen = min(u_resolution.x, u_resolution.y) * 1.0;

  float lightdot2 = dot(gl_FragCoord.xy - u_resolution * 0.5, lightvec);
  float sidedot2 = dot(gl_FragCoord.xy - u_resolution * 0.5, sidevec);
  float infshadow = 0.0;
  float inferiorshadowsize = shadowlen * 0.3;

  float mingrad = 0.4;
  float shadow = 1.0;
  for(int i=0; i< POSITIONNUM; i++){
    if(i < u_positionsnum){
      vec2 pos = u_positions[i];

      float lightdot = dot(gl_FragCoord.xy - pos, lightvec);
      float sidedot = dot(gl_FragCoord.xy - pos, sidevec);
      
      float grad = map(max(mingrad, (sidedot) / shadowlen), mingrad, 1.0, 0.0, 1.0);
      grad = clamp(pow(grad, 1.), 0.0, 1.0);
      
      if(lightdot < u_superiorrad && lightdot > -u_superiorrad && sidedot > 0.){
        colval = grad;
        shadow = 0.0;
      }

      vec2 infdir = normalize(pos - u_resolution * 0.5 + vec2(-u_offset, 0.));
      float infdot = dot(infdir, sidevec);
      if(infdot < 0.0 && lightdot2 < u_inferiorrad && lightdot2 > -u_inferiorrad && sidedot2 > 0.){
        
        float grad2 = min(inferiorshadowsize, sidedot2) / inferiorshadowsize;
        colval = clamp(mix(colval, 1.0, 1.0 - grad2), 0., 1.);
      }
    }
  }

  if(lightdot2 < u_inferiorrad && lightdot2 > -u_inferiorrad && sidedot2 > 0.){
    if(shadow == 1.0){
      float grad2 = min(inferiorshadowsize, sidedot2) / inferiorshadowsize;
      colval = grad2;
    }
  }
  
  vec3 col = mix(u_col1.xyz, u_col2.xyz, colval);
  gl_FragColor = vec4(col, 1.0);
}
