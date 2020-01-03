#version 410 core

#define NR_POINT_LIGHTS 1 
#define NR_SPOT_LIGHTS 3

#ifdef GL_ES
precision mediump float;
#endif

	#define LAYERS 200
	#define DEPTH .1
	#define WIDTH .8
	#define SPEED 1.5


#extension GL_OES_standard_derivatives : enable

struct DirLight{
	vec3 direction;
	
	vec3 ambient;
	vec3 diffuse;
	vec3 specular;
};

struct PointLight {    
    vec3 position;
    
    float constant;
    float linear;
    float quadratic;  

    vec3 ambient;
    vec3 diffuse;
    vec3 specular;
};  

struct SpotLight{
	vec3 position;
	vec3 direction;
	float outerCutoff;
	float cutoff;
	
	float constant;
    float linear;
    float quadratic;
	
	vec3 ambient;
    vec3 diffuse;
    vec3 specular;
	
};

in vec3 FragPos;
in vec3 Normal;
in vec2 TexCoords;
in vec4 FragPosLightSpace;
in vec4 FragPosFlashlightSpace;
in vec4 FragPosEye;

out vec4 FragColor;

uniform vec3 viewPos;
uniform PointLight pointLights[NR_POINT_LIGHTS];
uniform DirLight dirLight;
uniform SpotLight spotLight[NR_SPOT_LIGHTS];
uniform sampler2D diffuseTexture;
uniform sampler2D specularTexture;
uniform sampler2D shadowDirMap;
uniform sampler2D shadowSpotMap;
uniform samplerCube skybox;
uniform samplerCube depthMap;
uniform float shininess;
uniform int fog;

uniform int hasDirLight;
uniform int hasPointLight;

uniform int showCarLights;
uniform int showFlashLight;
uniform int objectReflectsSkybox;

uniform float far_plane;

float shadow;
float shadowDir;
float shadowSpot;

vec3 calculateDirectionalLight(DirLight light, vec3 normal, vec3 viewDir);
vec3 calculatePointLights(PointLight light, vec3 normal, vec3 fragPos, vec3 viewDir);  
vec3 calculateSpotlight(SpotLight light, vec3 normal, vec3 fragPos, vec3 viewDir);
float shadowCalculation(vec3 fragPos, PointLight light, vec3 normal);
float DirectionalShadowCalculation(vec4 fragPosLightSpace, vec3 normal);
float SpotlightShadowCalculation(vec4 fragPosLightSpace, SpotLight light, vec3 normal);
float computeFog();
/*
void main(){
	vec3 norm = normalize(Normal);
    vec3 viewDir = normalize(viewPos - FragPos);
	
	vec4 colorFromTexture = texture(diffuseTexture, TexCoords);
	if(colorFromTexture.a < 0.1) discard;
	
	vec3 outputColor = vec3(0.0);
	shadow = shadowCalculation(FragPos, pointLights[0], norm);
	shadowDir = DirectionalShadowCalculation(FragPosLightSpace, norm);
	shadowSpot = SpotlightShadowCalculation(FragPosFlashlightSpace, spotLight[2], norm);
	
	if(hasDirLight != 0)
		outputColor += calculateDirectionalLight(dirLight, norm, viewDir);
	
	if(hasPointLight != 0)
		for(int i = 0; i < NR_POINT_LIGHTS; i++)
			outputColor += calculatePointLights(pointLights[i], norm, FragPos, viewDir);
	
	if(showCarLights != 0){
		outputColor += calculateSpotlight(spotLight[0], norm, FragPos, viewDir);
		outputColor += calculateSpotlight(spotLight[1], norm, FragPos, viewDir);
	}
	if(showFlashLight != 0){
		outputColor += calculateSpotlight(spotLight[2], norm, FragPos, viewDir);
	}
		
	float skyboxInfluence;
	float fogFactor;
	
	if(objectReflectsSkybox > 0){
		skyboxInfluence = 0.3;
	} else {
		skyboxInfluence = 0.0;
	}
	if(fog > 0){
		fogFactor = computeFog();
	} else {
		fogFactor = 1.0f;
	}
	vec3 reflection = reflect(viewDir, norm);
	vec3 colorFromSkyBox = vec3(texture(skybox, reflection));
	vec4 colorWithSkyboxInfluence = vec4(outputColor + skyboxInfluence * colorFromSkyBox, colorFromTexture.a);
	vec4 fogColor = vec4(0.5f, 0.5f, 0.5f, 1.0f);
	FragColor = mix(fogColor, colorWithSkyboxInfluence, fogFactor);
}
*/



uniform float time;
uniform vec2 mouse;
uniform vec2 resolution;

void main( void ) {
	const mat3 p = mat3(13.323122,23.5112,21.71123,21.1212,28.7312,11.9312,21.8112,14.7212,61.3934);
	vec2 uv = mouse.xy/resolution.xy + vec2(1.,resolution.y/resolution.x)*gl_FragCoord.xy / resolution.xy;
	vec3 acc = vec3(0.0);
	float dof = 5.*sin(time*.1);
	for (int i=0;i<LAYERS;i++) {
		float fi = float(i);
		vec2 q = uv*(1.+fi*DEPTH);
		q += vec2(q.y*(WIDTH*mod(fi*7.238917,1.)-WIDTH*.5),SPEED*time/(1.+fi*DEPTH*.03));
		vec3 n = vec3(floor(q),31.189+fi);
		vec3 m = floor(n)*.00001 + fract(n);
		vec3 mp = (31415.9+m)/fract(p*m);
		vec3 r = fract(mp);
		vec2 s = abs(mod(q,1.)-.5+.9*r.xy-.45);
		s += .01*abs(2.*fract(10.*q.yx)-1.); 
		float d = .6*max(s.x-s.y,s.x+s.y)+max(s.x,s.y)-.01;
		float edge = .005+.05*min(.5*abs(fi-5.-dof),1.);
		acc += vec3(smoothstep(edge,-edge,d)*(r.x/(1.+.02*fi*DEPTH)));
	}

	FragColor = vec4(vec3(acc),1.0);

}

vec3 calculateDirectionalLight(DirLight light, vec3 normal, vec3 viewDir){
	vec3 lightDir = normalize(light.direction);
	
    // diffuse shading
    float diff = max(dot(normal, lightDir), 0.0);
	
    // specular shading
	vec3 halfwayDir = normalize(lightDir + viewDir);
    float spec = pow(max(dot(normal, halfwayDir), 0.0), shininess);
	
    // combine results
    vec3 ambient  = light.ambient  * vec3(texture(diffuseTexture, TexCoords));
    vec3 diffuse  = light.diffuse  * diff * vec3(texture(diffuseTexture, TexCoords));
    vec3 specular = light.specular * spec * vec3(texture(specularTexture, TexCoords));
	
    
	return (ambient + (1.0 - shadowDir) * (diffuse + specular));
}

vec3 calculatePointLights(PointLight light, vec3 normal, vec3 fragPos, vec3 viewDir)
{
    vec3 lightDir = normalize(light.position - fragPos);
	
    // diffuse shading
    float diff = max(dot(normal, lightDir), 0.0);
	
    // specular shading
    vec3 halfwayDir = normalize(lightDir + viewDir);
    float spec = pow(max(dot(normal, halfwayDir), 0.0), shininess);
	
    // attenuation
    float distance    = length(light.position - fragPos);
    float attenuation = 1.0 / (light.constant + light.linear * distance + 
  			     light.quadratic * (distance * distance));    
    
	// combine results
    vec3 ambient  = light.ambient  * vec3(texture(diffuseTexture, TexCoords));
    vec3 diffuse  = light.diffuse  * diff * vec3(texture(diffuseTexture, TexCoords));
    vec3 specular = light.specular * spec * vec3(texture(specularTexture, TexCoords));
    
	ambient  *= attenuation;
    diffuse  *= attenuation;
    specular *= attenuation;
    
	return (ambient + (1.0 - shadow) * (diffuse + specular));
} 

vec3 calculateSpotlight(SpotLight light, vec3 normal, vec3 fragPos, vec3 viewDir)
{
    vec3 lightDir = normalize( light.position - fragPos );
    
    float theta = dot(lightDir, normalize(-light.direction));
	
	// Diffuse shading
	float diff = max( dot( normal, lightDir ), 0.0 );
		
	// Specular shading
    vec3 halfwayDir = normalize(lightDir + viewDir);
    float spec = pow(max(dot(normal, halfwayDir), 0.0), shininess);
	
	// Attenuation
	float distance = length( light.position - fragPos );
	float attenuation = 1.0f / ( light.constant + light.linear * distance + light.quadratic * ( distance * distance ) );
		
	// Spotlight intensity
	float epsilon = light.cutoff - light.outerCutoff;
	float intensity = clamp( ( theta - light.outerCutoff ) / epsilon, 0.0, 1.0 );
		
	// Combine results
	vec3 ambient = light.ambient * vec3( texture( diffuseTexture, TexCoords ) );
	vec3 diffuse = light.diffuse * diff * vec3( texture( diffuseTexture, TexCoords ) );
	vec3 specular = light.specular * spec * vec3( texture( specularTexture, TexCoords ) );
		
	ambient *= attenuation;
	diffuse *=  attenuation * intensity;
	specular *=  attenuation * intensity;
		
	return (ambient + (1.0 - shadowSpot) * ( diffuse + specular));
}


float shadowCalculation(vec3 fragPos, PointLight light, vec3 normal){
	vec3 lightDir = normalize(light.position - fragPos);
	
	vec3 fragToLight = fragPos - light.position;
	float closestDepth = texture(depthMap, fragToLight).r;
	closestDepth *= far_plane;
	float currentDepth = length(fragToLight);

	float bias = max(0.05 * (1.0 - dot(normal, lightDir)), 0.005);  
	float shadow = currentDepth -  bias > closestDepth ? 1.0 : 0.0;        
	
	return shadow;
}

float DirectionalShadowCalculation(vec4 fragPosLightSpace, vec3 normal){
	vec3 projCoords = fragPosLightSpace.xyz / fragPosLightSpace.w;
	if(projCoords.z > 1.0f)
        return 0.0f;
	projCoords = projCoords * 0.5 + 0.5;
	
	float closestDepth = texture(shadowDirMap, projCoords.xy).r;
	float currentDepth = projCoords.z;
	
	float bias = max(0.05 * (1.0 - dot(normal, dirLight.direction)), 0.005);
    float shadow = currentDepth - bias> closestDepth  ? 1.0f : 0.0f;

    return shadow;	
	
}

float SpotlightShadowCalculation(vec4 fragPosLightSpace, SpotLight light, vec3 normal){
	vec3 projCoords = fragPosLightSpace.xyz / fragPosLightSpace.w;
	projCoords = projCoords * 0.5 + 0.5;
	
	float closestDepth = texture(shadowSpotMap, projCoords.xy).r;
	closestDepth *= far_plane;
	float currentDepth = projCoords.z;
	
	float bias = max(0.05 * (1.0 - dot(normal, light.direction)), 0.005);
    float shadow = currentDepth - bias> closestDepth  ? 1.0f : 0.0f;

    return shadow;	
}

float computeFog(){
	float fogDensity = 0.3f;
	float fragmentDistance = length(FragPosEye);
	float fogFactor = exp(-pow(fragmentDistance * fogDensity, 2));

	return clamp(fogFactor, 0.0f, 1.0f);
}













