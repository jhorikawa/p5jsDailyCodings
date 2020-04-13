#ifdef GL_ES
precision highp float;
#endif

#define PI 3.14159265359
#define TWO_PI 6.28318530718

uniform vec2 u_resolution;
uniform float u_time;
uniform sampler2D u_texture;
uniform float u_millis;
uniform vec4 u_col1;
uniform vec4 u_col2;

varying vec2 vTexCoord;

float map(float value, float from1, float to1, float from2, float to2){
  return from2 + (value - from1) / (to1 - from1) * (to2 - from2);
}

void main(){
  vec2 st = gl_FragCoord.xy/u_resolution;

  vec4 tex = texture2D(u_texture, vTexCoord);

  float stepy = map(sin(u_millis * TWO_PI), -1.0, 1.0, 25.0, 25.5);//map(sin(radians(u_time * 0.25)), -1.0, 1.0, 10.0, 30.0);
  float stripe = 0.0;
  if(abs(floor(gl_FragCoord.y / stepy) * stepy - gl_FragCoord.y) <= 1.0){
    stripe = 1.0;
  }

  float ang = map(u_millis, 0.0, 1.0, PI * 0.5, -PI * 0.5);
  float scale = sin(ang);
  const float val = 8.0;
  for(float i = - val; i<= val; i++){
    if(i != 0.0){
      vec4 texup = texture2D(u_texture, vTexCoord + vec2(0.0, i / gl_FragCoord.y));
      if(texup.x > 0.5 && (abs(floor((gl_FragCoord.y + i) / stepy) * stepy - (gl_FragCoord.y + i)) <= 1.0)){
        stripe = pow(map(abs(i), 0.0, val, scale, 0.0), 2.0);
      }
    }
  }

  vec4 col = mix(u_col1, u_col2, stripe);

  gl_FragColor = col;
}
