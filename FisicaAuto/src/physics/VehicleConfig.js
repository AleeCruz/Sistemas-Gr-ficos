// src/physics/VehicleConfig.js
import * as THREE from 'three';

export const defaultVehicleParams = {
    wheelSeparation: 2.5,
    axesSeparation: 3,
    wheelRadius: 0.6,
    wheelWidth: 0.4,
    suspensionRestLength: 0.8,
    initialPosition: new THREE.Vector3(0, 2, 0),
    initialYRotation: 0,
    steeringReaction: 0.1,
    maxSteeringAngle: Math.PI / 16,
    mass: 20,
    accelerateForce: { min: -15, max: 40, step: 2 },
    brakeForce: { min: 0, max: 1, step: 0.05 },
};

export const defaultGroundParams = {
    width: 20,
    height: 0.1,
    length: 20,
};
