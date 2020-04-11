#ifdef GL_ES
precision highp float;
#endif

#define PI 3.14159265359
#define TWO_PI 6.28318530718

uniform vec2 u_resolution;
uniform float u_time;
uniform float u_scale;
uniform vec4 u_color;

float map(float value, float from1, float to1, float from2, float to2){
  return from2 + (value - from1) / (to1 - from1) * (to2 - from2);
}

void main(){
  vec2 st = gl_FragCoord.xy/u_resolution;

  float sw = clamp(cos(u_time * 5.0), -0.25, 0.25) * 4.0;
  float swm = sw / abs(sw);

  vec2 st2 = (st - vec2(0.5, 0.5)) * 2.0;
  float dist = distance(st2, vec2(0,0));
  float alpha = 1.0;
  float min = 0.65;
  float max = map(u_scale, 0.0, 1.0, 0.7, 0.9);//map(sw, -1.0, 1.0, 0.7, 0.85);
  if(dist < min || dist > max){
    alpha= 0.0;
  }

  float sep = 1.0 / cos(radians(30.0));
  for(float i=0.0; i<3.0; i++){
    float rang = radians(30.0 + 120.0 * i);
    vec2 bst = vec2(cos(rang), sin(rang)) * sep;
    float dist2 = distance(bst, st2);

    vec2 nst2 = normalize(st2);

    float ang = mod(atan(nst2.y, nst2.x) + TWO_PI + radians(30.0 * swm - 120.0 * i), TWO_PI);

    if(dist2 < max + 0.1 && dist2 > min - 0.1){ 
      if(ang > 0.0 && ang < radians(60.0) && alpha == 1.0){
        alpha = 1.0 - abs(sw);
      }
    }
  }

  gl_FragColor = vec4(u_color.xyz, alpha);
}
