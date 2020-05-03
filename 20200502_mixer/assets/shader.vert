precision highp float; 

attribute vec3 aPosition;
attribute vec3 aNormal;
attribute vec2 aTexCoord;
uniform mat4 uProjectionMatrix;
uniform mat4 uModelViewMatrix;

varying vec2 vTexCoord;
varying vec3 vNormal;
varying vec3 vPosition;
varying vec4 glPosition;

void main() { 
  vec4 positionVec4 = vec4(aPosition, 1.0);

  gl_Position = positionVec4;
  vPosition = aPosition;
  vNormal = aNormal;
  
  vTexCoord = aTexCoord;
}
