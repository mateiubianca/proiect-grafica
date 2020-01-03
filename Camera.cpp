//
//  Camera.cpp
//  Lab5
//
//  Created by CGIS on 28/10/2016.
//  Copyright © 2016 CGIS. All rights reserved.
//

#include "Camera.hpp"

namespace gps {
    
    Camera::Camera(glm::vec3 cameraPosition, glm::vec3 cameraTarget)
    {
        this->cameraPosition = cameraPosition;
        this->cameraTarget = cameraTarget;
		this->worldUp = glm::vec3(0.0f, 1.0f, 0.0f);
        this->cameraDirection = glm::normalize(cameraTarget - cameraPosition);
        this->cameraRightDirection = glm::normalize(glm::cross(this->cameraDirection, worldUp));
		this->cameraUpDirection = glm::normalize(glm::cross(cameraRightDirection, this->cameraDirection));
    }
    
    glm::mat4 Camera::getViewMatrix()
    {
        return glm::lookAt(cameraPosition, cameraPosition + cameraDirection , cameraUpDirection);
    }

	glm::vec3 Camera::getFrontCamera()
	{
		return cameraPosition + cameraDirection * 0.3f;
	}
    
    void Camera::move(MOVE_DIRECTION direction, float speed, float yaw, float pitch)
    {
		float x_left = -2.4;
		float x_right = 3.9;
		float z_front = -3.3;
		float z_back = 3.0;


        switch (direction) {
            case MOVE_FORWARD:
                cameraPosition += cameraDirection * speed;
                break;
                
            case MOVE_BACKWARD:
                cameraPosition -= cameraDirection * speed;
                break;
                
            case MOVE_RIGHT:
                cameraPosition += cameraRightDirection * speed;
                break;
                
            case MOVE_LEFT:
                cameraPosition -= cameraRightDirection * speed;
                break;

			case ROTATE:
				this->rotate(pitch, yaw);
				break;

		
			//case MOVE_UP:
			//	cameraPosition += cameraUpDirection * speed;
			//	break;

			//case MOVE_DOWN:
			//	cameraPosition -= cameraUpDirection * speed;
			//	break;
        }
		cameraPosition.y = 0.2f;
		
		if (cameraPosition.x < x_left) {
			cameraPosition.x = x_left;
		}
		if (cameraPosition.x > x_right) {
			cameraPosition.x = x_right;
		}
		if (cameraPosition.z < z_front) {
			cameraPosition.z = z_front;
		}
		if (cameraPosition.z > z_back) {
			cameraPosition.z = z_back;
		}
    }
    
    void Camera::rotate(float pitch, float yaw)
    {
		cameraDirection = glm::normalize(glm::vec3(
			cos(glm::radians(yaw)) * cos(glm::radians(pitch)),
			sin(glm::radians(pitch)),
			sin(glm::radians(yaw)) * cos(glm::radians(pitch))
		));

		cameraRightDirection = glm::normalize(glm::cross(this->cameraDirection, worldUp));
		cameraUpDirection = glm::normalize(glm::cross(cameraRightDirection, this->cameraDirection));
    }
    
}
