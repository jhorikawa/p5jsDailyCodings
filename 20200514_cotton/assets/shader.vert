precision highp float; 

attribute vec3 aPosition;
attribute vec2 aTexCoord;
attribute vec3 aNormal;
uniform mat4 uProjectionMatrix;
uniform mat4 uModelViewMatrix;
uniform float u_time;

varying vec2 vTexCoord;
varying vec3 vNormal;

void main() { 

  vec3 newPosition = aPosition;
	
  gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(newPosition, 1.0);
  vTexCoord = aTexCoord;
  vNormal = aNormal;
}
