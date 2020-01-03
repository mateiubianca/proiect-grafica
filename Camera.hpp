//
//  Camera.hpp
//
//  Created by CGIS on 28/10/2016.
//  Copyright © 2016 CGIS. All rights reserved.
//

#ifndef Camera_hpp
#define Camera_hpp

#include <stdio.h>
#include "glm/glm.hpp"
#include "glm/gtx/transform.hpp"

namespace gps {
    
    enum MOVE_DIRECTION {MOVE_FORWARD, MOVE_BACKWARD, MOVE_RIGHT, MOVE_LEFT, ROTATE, MOVE_UP, MOVE_DOWN};
    
	const float YAW = -90.0f;
	const float PITCH = 0.0f;

    class Camera
    {
    public:
        Camera(glm::vec3 cameraPosition, glm::vec3 cameraTarget);
      
		glm::vec3 cameraPosition;
		glm::vec3 cameraDirection;
		glm::vec3 cameraTarget;
		glm::vec3 cameraRightDirection;
		glm::vec3 cameraUpDirection;
		glm::vec3 worldUp;
		
		glm::mat4 getViewMatrix();
		glm::vec3 getCameraTarget();
		void move(MOVE_DIRECTION direction, float speed, float yaw, float pitch);
        void rotate(float pitch, float yaw);	
		glm::vec3 Camera::getFrontCamera();
        
    };
    
}

#endif /* Camera_hpp */
