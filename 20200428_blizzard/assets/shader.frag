#ifdef GL_ES
precision mediump float;
#endif

#define PI 3.14159265359
#define TWO_PI 6.28318530718

uniform vec2 u_resolution;
uniform float u_time;
uniform vec4 u_col1;
uniform vec4 u_col2;


float map(float value, float from1, float to1, float from2, float to2){
  return from2 + (value - from1) / (to1 - from1) * (to2 - from2);
}

float random (vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
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

  vec3 bgcolor = mix(u_col1.xyz, u_col2.xyz, st.y);
  vec3 frcolor = vec3(1.0);
  
  float val = 0.0;
  float size = 100.0;
  vec2 dir = normalize(vec2(-1.0, -1.0));
  for(float i=0.; i<300.0; i++){
    float psize = 50.0 * random(vec2(i * 0.7223));
    float dist = distance(gl_FragCoord.xy, mod(vec2(noise(i*0.7234), noise(i * 0.523)) * dir * u_time * 600. + u_resolution * vec2(random(vec2(i * 0.652)), random(vec2(i * 0.234))), u_resolution));
    dist = max(pow(1.0 - min(dist, size) / size, 15. ) * random(vec2(i * 0.7223)), 0.0);
    val += dist;
  }

  vec3 color = mix(bgcolor, frcolor, val);

  gl_FragColor = vec4(color, 1.0);
}
