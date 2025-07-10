// cameraManager.js
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';

export class CameraManager {
    constructor(domElement, initialCamera) {
        const aspect = window.innerWidth / window.innerHeight;

        this.cameraPersp = initialCamera; 
        this.cameraFreeWalk = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
        this.cameraFreeWalk.position.set(0, 2, 5);
        this.cameraTercera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
        this.cameraVehicle = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);

        this.orbitControls = new OrbitControls(this.cameraPersp, domElement);
        this.orbitControls.enableDamping = true;

        this.pointerLockControlsFreeWalk = new PointerLockControls(this.cameraFreeWalk, domElement);
        this.pointerLockControlsVehicle = new PointerLockControls(this.cameraVehicle, domElement);

        // Movimiento WASD para FreeWalk
        this.velocity = new THREE.Vector3();
        this.direction = new THREE.Vector3();
        this.moveForward = false;
        this.moveBackward = false;
        this.moveLeft = false;
        this.moveRight = false;
        this.freeWalkSpeed = 3; // Velocidad reducida para caminar
        this.freeWalkRotationSpeed = 2.0; // Velocidad de rotación al girar

        this.cameras = {
            orbit: { camera: this.cameraPersp, controls: this.orbitControls },
            freeWalk: { camera: this.cameraFreeWalk, controls: this.pointerLockControlsFreeWalk },
            terceraPersona: { camera: this.cameraTercera, controls: null },
            vehicle: { camera: this.cameraVehicle, controls: this.pointerLockControlsVehicle }
        };

        this.currentType = 'orbit';
        this.activeCamera = this.cameras[this.currentType].camera;

        this._setupControls();

        domElement.addEventListener('click', () => {
            if (this.currentType === 'freeWalk') this.pointerLockControlsFreeWalk.lock();
            if (this.currentType === 'vehicle') this.pointerLockControlsVehicle.lock();
        });

        document.addEventListener('keydown', (event) => this._onKeyDown(event));
        document.addEventListener('keyup', (event) => this._onKeyUp(event));
    }

    _setupControls() {
        this.pointerLockControlsFreeWalk.disconnect();
        this.pointerLockControlsVehicle.disconnect();
        this.orbitControls.enabled = (this.currentType === 'orbit');
    }

    setCameraByType(type) {
        if (!(type in this.cameras)) return;

        if (this.currentType === 'freeWalk') this.pointerLockControlsFreeWalk.disconnect();
        if (this.currentType === 'vehicle') this.pointerLockControlsVehicle.disconnect();
        if (this.currentType === 'orbit') this.orbitControls.enabled = false;

        this.currentType = type;
        this.activeCamera = this.cameras[type].camera;

        if (type === 'orbit') {
            this.orbitControls.enabled = true;
        } else if (type === 'freeWalk') {
            this.pointerLockControlsFreeWalk.connect();
        } else if (type === 'vehicle') {
            this.pointerLockControlsVehicle.connect();
        }

        console.log(`Cámara cambiada a: ${type}`);
    }

    getActiveCamera() {
        return this.activeCamera;
    }

    getActiveCameraType() {
        return this.currentType;
    }

    update(deltaTime, vehicleController, auto) {
        if (this.currentType === 'orbit') {
            this.orbitControls.update();
        } else if (this.currentType === 'freeWalk') {
            this._updateFreeWalkMovement(deltaTime);
        } else if (this.currentType === 'terceraPersona' && auto) {
            this.updateTerceraPersonaCamera(auto.position, auto.quaternion);
        } else if (this.currentType === 'vehicle' && auto) {
            this.updateCamaraDetrasAuto(auto.position, auto.quaternion);
            if (vehicleController) vehicleController.update(deltaTime);
        }
    }

    updateTerceraPersonaCamera(objectPosition, objectQuaternion) {
        const offset = new THREE.Vector3(-1, 1, 0);
        offset.applyQuaternion(objectQuaternion);
        this.cameraTercera.position.copy(objectPosition).add(offset);
        this.cameraTercera.lookAt(objectPosition);
    }

    updateCamaraDetrasAuto(objectPosition, objectQuaternion) {
        const offset = new THREE.Vector3(0, 0.5, -1);
        offset.applyQuaternion(objectQuaternion);
        this.cameraVehicle.position.copy(objectPosition).add(offset);
        this.cameraVehicle.lookAt(objectPosition);
        this.pointerLockControlsVehicle.getObject().position.copy(this.cameraVehicle.position);
    }

    _onKeyDown(event) {
        switch (event.code) {
            case 'ArrowUp':
            case 'KeyW': this.moveForward = true; break;
            case 'ArrowLeft':
            case 'KeyA': this.moveLeft = true; break;
            case 'ArrowDown':
            case 'KeyS': this.moveBackward = true; break;
            case 'ArrowRight':
            case 'KeyD': this.moveRight = true; break;
        }
    }

    _onKeyUp(event) {
        switch (event.code) {
            case 'ArrowUp':
            case 'KeyW': this.moveForward = false; break;
            case 'ArrowLeft':
            case 'KeyA': this.moveLeft = false; break;
            case 'ArrowDown':
            case 'KeyS': this.moveBackward = false; break;
            case 'ArrowRight':
            case 'KeyD': this.moveRight = false; break;
        }
    }

_updateFreeWalkMovement(deltaTime) {
    if (!this.pointerLockControlsFreeWalk.isLocked) return;

    this.direction.set(0, 0, 0);
    if (this.moveForward) this.direction.z -= 1;
    if (this.moveBackward) this.direction.z += 1;
    if (this.moveLeft) this.direction.x -= 1;
    if (this.moveRight) this.direction.x += 1;
    this.direction.normalize();

    const speed = this.freeWalkSpeed * deltaTime;
    const move = new THREE.Vector3(this.direction.x * speed, 0, this.direction.z * speed);
    
    this.pointerLockControlsFreeWalk.moveRight(move.x);
    this.pointerLockControlsFreeWalk.moveForward(-move.z); // CORREGIDO
}


    onWindowResize(width, height) {
        const aspect = width / height;
        for (const camKey in this.cameras) {
            const cam = this.cameras[camKey].camera;
            cam.aspect = aspect;
            cam.updateProjectionMatrix();
        }
    }
}
