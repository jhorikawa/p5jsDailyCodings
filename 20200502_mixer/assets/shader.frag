#ifdef GL_ES
precision mediump float;
#endif

#define PI 3.14159265359
#define TWO_PI 6.28318530718
#define POSITIONNUM 300

uniform sampler2D u_colbuffer;
uniform vec2 u_resolution;
uniform float u_time;
uniform vec4 u_backcol;
uniform int u_ptnum;
uniform float u_speed;
uniform vec2 u_positions[POSITIONNUM];
uniform vec2 u_directions[POSITIONNUM];

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

vec4 mixColor(vec4 fg, vec4 bg){
  vec4 r = vec4(0.0);
  r.a = 1. - (1. - fg.a) * (1. - bg.a);
  if (r.a < 1.0e-6) return r; // Fully transparent -- R,G,B not important
  r.r = fg.r * fg.a / r.a + bg.r * bg.a * (1. - fg.a) / r.a;
  r.g = fg.g * fg.a / r.a + bg.g * bg.a * (1. - fg.a) / r.a;
  r.b = fg.b * fg.a / r.a + bg.b * bg.a * (1. - fg.a) / r.a;
  return r;
}

void main(){
  vec2 st = gl_FragCoord.xy/u_resolution;

  vec2 texcoord = vec2(vTexCoord.x, 1.0 - vTexCoord.y);
  vec4 texcol = texture2D(u_colbuffer, texcoord);

  float maxdist = 150.0;
  vec2 dir = vec2(0.0);
  for(int i=0; i<POSITIONNUM; i++){
    if(i < u_ptnum){
      vec2 pos = u_positions[i];
      float dist = distance(pos, gl_FragCoord.xy);
      if(dist < maxdist){
        dir -= (u_directions[i] * pow((1.0 - dist / maxdist), 1.0));
      }
    }
  }
  dir = normalize(dir) * u_speed;
  dir = dir / u_resolution;

  vec4 texcol2 = texture2D(u_colbuffer, mod(texcoord + dir, vec2(1.0, 1.0)));
  if(texcol.x == 0. && texcol.y == 0. && texcol.z == 0.){
    texcol = u_backcol;
    texcol2 = u_backcol;
  }

  texcol = mix(mix(texcol, texcol2, 0.5), u_backcol, 0.002);

  gl_FragColor = vec4(vec3(texcol.xyz), 1.0);
}
