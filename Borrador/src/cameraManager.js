// cameraManager.js
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';

export class CameraManager {
    constructor(domElement, initialCamera) {
        const aspect = window.innerWidth / window.innerHeight;

        // Cámara perspectiva para modo 1 (OrbitControls)
        this.cameraPersp = initialCamera; 

        // Cámara perspectiva para modo 2 (Free walk) con PointerLock
        this.cameraFreeWalk = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
        this.cameraFreeWalk.position.set(0, 2, 5);

        // Cámara para tercera persona (modo 3)
        this.cameraTercera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);

        // Cámara para modo vehículo (modo 4)
        this.cameraVehicle = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);

        // Controles
        this.orbitControls = new OrbitControls(this.cameraPersp, domElement);
        this.orbitControls.enableDamping = true;

        this.pointerLockControlsFreeWalk = new PointerLockControls(this.cameraFreeWalk, domElement);
        this.pointerLockControlsVehicle = new PointerLockControls(this.cameraVehicle, domElement);

        // Mapear tipos a cámaras y controles
        this.cameras = {
            orbit: { camera: this.cameraPersp, controls: this.orbitControls },
            freeWalk: { camera: this.cameraFreeWalk, controls: this.pointerLockControlsFreeWalk },
            terceraPersona: { camera: this.cameraTercera, controls: null }, // Sin controles manuales (sigue auto)
            vehicle: { camera: this.cameraVehicle, controls: this.pointerLockControlsVehicle }
        };

        this.currentType = 'orbit';
        this.activeCamera = this.cameras[this.currentType].camera;

        // Inicializar controles
        this._setupControls();

        // Eventos click para activar PointerLock cuando toca
        domElement.addEventListener('click', () => {
            if (this.currentType === 'freeWalk') this.pointerLockControlsFreeWalk.lock();
            if (this.currentType === 'vehicle') this.pointerLockControlsVehicle.lock();
        });
    }

    _setupControls() {
        // Desconectar todos los pointerLocks para comenzar
        this.pointerLockControlsFreeWalk.disconnect();
        this.pointerLockControlsVehicle.disconnect();

        // OrbitControls siempre conectados para orbit
        this.orbitControls.enabled = (this.currentType === 'orbit');
    }

    setCameraByType(type) {
        if (!(type in this.cameras)) return;

        // Desconectar controles previos
        if (this.currentType === 'freeWalk') this.pointerLockControlsFreeWalk.disconnect();
        if (this.currentType === 'vehicle') this.pointerLockControlsVehicle.disconnect();

        if (this.currentType === 'orbit') this.orbitControls.enabled = false;

        this.currentType = type;
        this.activeCamera = this.cameras[type].camera;

        // Activar controles nuevos
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
            // PointerLock actualiza automáticamente la cámara
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

        // Mover pointerLockControlsVehicle a la cámara actual
        this.pointerLockControlsVehicle.getObject().position.copy(this.cameraVehicle.position);
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
