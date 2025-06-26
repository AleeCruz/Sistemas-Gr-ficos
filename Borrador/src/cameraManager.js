// cameraManager.js

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';

export class CameraManager {
    constructor(domElement, initialCamera) {
        const width = window.innerWidth;
        const height = window.innerHeight;
        const aspect = width / height;

        this.cameraPersp = initialCamera; // Reutilizamos la cámara de scene.js como la perspectiva principal
        
        this.cameraOrtho = new THREE.OrthographicCamera(
            (aspect * 10) / -2,
            (aspect * 10) / 2,
            10 / 2,
            -10 / 2,
            0.1,
            1000
        );
        this.cameraOrtho.position.set(10, 10, 10);

        this.cameraPrimera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
        this.cameraPrimera.position.set(0, 1.5, 0); // Posición inicial, será actualizada por el objeto en movimiento

        this.orbitControls = new OrbitControls(this.cameraPersp, domElement);
        this.orbitControls.enableDamping = true; // Mantén tu configuración existente de OrbitControls

        this.pointerControls = new PointerLockControls(this.cameraPrimera, domElement);

        this.cameras = [
            { camera: this.cameraPersp, type: 'perspectiva', controls: this.orbitControls },
            { camera: this.cameraOrtho, type: 'ortografica', controls: this.orbitControls },
            { camera: this.cameraPrimera, type: 'primeraPersona', controls: this.pointerControls }
        ];
        this.currentCameraIndex = 0; // Empieza con la cámara de perspectiva por defecto
        this.activeCamera = this.cameras[this.currentCameraIndex].camera;

        this._setupInitialControls();

        // Manejo de eventos de click para activar PointerLockControls
        domElement.addEventListener('click', () => {
            if (this.getActiveCameraType() === 'primeraPersona') {
                this.enablePointerLock();
            }
        });
    }

    _setupInitialControls() {
        // Desconectar pointerControls al inicio si la cámara inicial no es primera persona
        if (this.cameras[this.currentCameraIndex].type !== 'primeraPersona') {
            this.pointerControls.disconnect();
        }
    }

    toggleCamera() {
        // Desconectar controles de la cámara actual antes de cambiar
        const prevCameraInfo = this.cameras[this.currentCameraIndex];
        if (prevCameraInfo.type === 'primeraPersona') {
            this.pointerControls.unlock(); // Desbloquea el puntero antes de cambiar
            this.pointerControls.disconnect();
        } else {
            this.orbitControls.enabled = false;
        }

        this.currentCameraIndex = (this.currentCameraIndex + 1) % this.cameras.length;
        const newCameraInfo = this.cameras[this.currentCameraIndex];
        this.activeCamera = newCameraInfo.camera;

        // Conectar y habilitar controles para la nueva cámara
        if (newCameraInfo.type === 'primeraPersona') {
            this.pointerControls.connect();
        } else {
            this.orbitControls.object = this.activeCamera;
            this.orbitControls.enabled = true;
        }
    }

    getActiveCamera() {
        return this.activeCamera;
    }

    getActiveCameraType() {
        return this.cameras[this.currentCameraIndex].type;
    }

    enablePointerLock() {
        if (this.getActiveCameraType() === 'primeraPersona') {
            this.pointerControls.lock();
        }
    }

    updatePrimeraPersonaCamera(objectPosition) {
        const offsetAltura = new THREE.Vector3(0, 1.5, 0); // Ajuste para la altura de la cámara
        this.cameraPrimera.position.copy(objectPosition).add(offsetAltura);
    }

    updateControls() {
        // Solo actualizamos OrbitControls, PointerLockControls se actualiza internamente
        if (this.orbitControls.enabled) {
            this.orbitControls.update();
        }
    }

    onWindowResize(width, height) {
        const aspect = width / height;

        // Actualizar cámaras de perspectiva
        this.cameraPersp.aspect = aspect;
        this.cameraPersp.updateProjectionMatrix();
        this.cameraPrimera.aspect = aspect;
        this.cameraPrimera.updateProjectionMatrix();

        // Actualizar cámara ortográfica
        this.cameraOrtho.left = (aspect * 10) / -2;
        this.cameraOrtho.right = (aspect * 10) / 2;
        this.cameraOrtho.top = 10 / 2;
        this.cameraOrtho.bottom = -10 / 2;
        this.cameraOrtho.updateProjectionMatrix();
    }
}