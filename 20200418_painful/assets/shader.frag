#ifdef GL_ES
precision highp float;
#endif

#define PI 3.14159265359
#define TWO_PI 6.28318530718
#define METABALLNUM 100

uniform vec2 u_resolution;
uniform float u_time;
uniform vec3 u_metaballs[METABALLNUM];
uniform vec4 u_cols[4];
// uniform vec4 u_col;


float map(float value, float from1, float to1, float from2, float to2){
  return from2 + (value - from1) / (to1 - from1) * (to2 - from2);
}

float random (vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

float ball(vec2 p, float fx, float fy, float ax, float ay) {
    vec2 r = vec2(p.x + sin(u_time * fx) * ax, p.y + cos(u_time * fy) * ay);	
    return 0.09 / length(r);
}

void main(){
  vec2 st = gl_FragCoord.xy/u_resolution;

  float col = 0.0;
  // float maxdist = 0.0;
  for(int i=0; i< METABALLNUM; i++){
    vec3 u_metaball = u_metaballs[i];
    vec2 metapos = u_metaball.xy;
    float rad = u_metaball.z;
    float dist = 0.0;
    if(i == 0){
      rad *= 2.0;
      dist = distance(metapos, gl_FragCoord.xy);
    }else{
      dist = sqrt((pow((gl_FragCoord.x - metapos.x), 2.0) + pow((gl_FragCoord.y - metapos.y) * 0.35, 2.0)));
    }

    float cond = pow(rad / dist, 0.5);
    if(cond > 1.0){
      col += cond - 1.0;
    }
  }

  // col = step(0.5, col);
  float minval = 0.5;
  col = min(col, minval) * (1.0 / minval);
  float div = 5.0;
  col = floor(pow(col, 2.0) * div) / div;

  vec3 col3 = mix(u_cols[0].xyz, u_cols[1].xyz, col);

  vec3 fmetaball = u_metaballs[0];
  vec2 fmetapos = fmetaball.xy;
  float frad = fmetaball.z;
  float scale = map(sin(radians(u_time * 0.05)), -1.0, 1.0, 80000.0, 10000.0);
  float fdist = sqrt(pow((gl_FragCoord.x - fmetapos.x) * scale, 0.8) + pow((gl_FragCoord.y - fmetapos.y) * 1.25, 2.0));
  if(fdist < frad){
    float colval = map(sin(radians(u_time * 0.05)), -1.0, 1.0, 0.0, 1.0);
    col3 = mix(u_cols[2].xyz, u_cols[3].xyz, colval);
  }


  gl_FragColor = vec4(col3, 1.0);
}
