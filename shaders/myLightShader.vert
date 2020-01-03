#version 410 core

layout(location=0) in vec3 vPosition;
layout(location=1) in vec3 vNormal;
layout(location=2) in vec2 vTexCoords;

out vec3 Normal;
out vec3 FragPos;
out vec2 TexCoords;
out vec4 FragPosEye;
out vec4 FragPosLightSpace;
out vec4 FragPosFlashlightSpace;

uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;
uniform mat4 lightSpaceTrMatrix;

void main() 
{
	FragPosEye = view * model * vec4(vPosition, 1.0f);
	FragPos = vec3(model * vec4(vPosition, 1.0f));
	Normal = mat3(transpose(inverse(model))) * vNormal;
	TexCoords = vTexCoords;
	FragPosLightSpace = lightSpaceTrMatrix * model * vec4(vPosition, 1.0f);
	FragPosFlashlightSpace = projection * view * model * vec4(vPosition, 1.0f);
	
	gl_Position = projection * view * model * vec4(vPosition, 1.0f);
}
