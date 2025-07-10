// vehicleController.js
import * as THREE from 'three';

export class VehicleController {
    constructor(object) {
        this.object = object;

        this.maxSpeed = 0.9;
        this.acceleration = 5;
        this.deceleration = 7;
        this.turnSpeed = THREE.MathUtils.degToRad(40); // grados por segundo

        this.currentSpeed = 0;
        this.keys = { w: false, a: false, s: false, d: false };

        window.addEventListener('keydown', (e) => {
            const k = e.key.toLowerCase();
            if (k in this.keys) this.keys[k] = true;
        });
        window.addEventListener('keyup', (e) => {
            const k = e.key.toLowerCase();
            if (k in this.keys) this.keys[k] = false;
        });
    }

    update(deltaTime) {
        if (!this.object) return;

        // Giro
        if (this.keys.a) this.object.rotation.y += this.turnSpeed * deltaTime;
        if (this.keys.d) this.object.rotation.y -= this.turnSpeed * deltaTime;

        // Aceleración y freno
        if (this.keys.w) {
            this.currentSpeed = Math.min(this.maxSpeed, this.currentSpeed + this.acceleration * deltaTime);
        } else if (this.keys.s) {
            this.currentSpeed = Math.max(-this.maxSpeed, this.currentSpeed - this.acceleration * deltaTime);
        } else {
            // Frenado natural
            if (this.currentSpeed > 0) this.currentSpeed = Math.max(0, this.currentSpeed - this.deceleration * deltaTime);
            else if (this.currentSpeed < 0) this.currentSpeed = Math.min(0, this.currentSpeed + this.deceleration * deltaTime);
        }

        // Mover
        const forwardX = Math.sin(this.object.rotation.y);
        const forwardZ = Math.cos(this.object.rotation.y);

        this.object.position.x += forwardX * this.currentSpeed * deltaTime;
        this.object.position.z += forwardZ * this.currentSpeed * deltaTime;
    }
}
