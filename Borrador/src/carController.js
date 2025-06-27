// carController.js
import * as THREE from 'three';

/**
 * Controla el movimiento de un objeto 3D (un coche) basado en la entrada del teclado WASD.
 */
export class CarController {
    /**
     * @param {THREE.Object3D} carMesh El objeto 3D que representa el coche.
     */
    constructor(carMesh) {
        this.carMesh = carMesh;
        this.keysPressed = {}; // Almacena el estado de las teclas pulsadas

        // Propiedades de movimiento (ajustadas para una mejor sensación con deltaTime)
        this.speed = 0;
        this.rotationSpeed = 0;
        this.maxSpeed = 15; // Velocidad máxima hacia adelante/atrás (unidades/segundo)
        this.acceleration = 10; // Aceleración (unidades/segundo^2)
        this.braking = 15; // Desaceleración/frenado (unidades/segundo^2)
        this.maxRotationSpeed = THREE.MathUtils.degToRad(180); // Velocidad máxima de rotación (radianes/segundo, 180 grados/segundo)
        this.rotationAcceleration = THREE.MathUtils.degToRad(360); // Aceleración de rotación (radianes/segundo^2)
        this.rotationDamping = THREE.MathUtils.degToRad(360); // Amortiguamiento de rotación (radianes/segundo^2)

        // Escucha los eventos del teclado
        this.handleKeyDownBound = this.handleKeyDown.bind(this);
        this.handleKeyUpBound = this.handleKeyUp.bind(this);
    }

    /**
     * Activa los escuchadores de eventos del teclado.
     * Debes llamarlo cuando el control del coche sea activado.
     */
    enable() {
        window.addEventListener('keydown', this.handleKeyDownBound);
        window.addEventListener('keyup', this.handleKeyUpBound);
    }

    /**
     * Desactiva los escuchadores de eventos del teclado y resetea el estado de las teclas.
     * Debes llamarlo cuando el control del coche sea desactivado.
     */
    disable() {
        window.removeEventListener('keydown', this.handleKeyDownBound);
        window.removeEventListener('keyup', this.handleKeyUpBound);
        this.keysPressed = {}; // Resetear todas las teclas
        this.speed = 0; // Detener el coche
        this.rotationSpeed = 0;
    }

    /**
     * Maneja el evento de pulsación de tecla.
     * @param {KeyboardEvent} event El evento de teclado.
     */
    handleKeyDown(event) {
        this.keysPressed[event.key.toLowerCase()] = true;
    }

    /**
     * Maneja el evento de liberación de tecla.
     * @param {KeyboardEvent} event El evento de teclado.
     */
    handleKeyUp(event) {
        this.keysPressed[event.key.toLowerCase()] = false;
    }

    /**
     * Actualiza la posición y rotación del coche.
     * Debe llamarse en el bucle de animación.
     * @param {number} deltaTime El tiempo transcurrido desde el último frame en segundos.
     */
    update(deltaTime) {
        let moveDirection = 0; // 1 = adelante, -1 = atrás
        let turnDirection = 0; // 1 = izquierda, -1 = derecha

        // Determinar movimiento lineal
        if (this.keysPressed['w']) {
            moveDirection = 1;
        } else if (this.keysPressed['s']) {
            moveDirection = -1;
        }

        // Determinar rotación
        if (this.keysPressed['a']) {
            turnDirection = 1; // Girar a la izquierda
        } else if (this.keysPressed['d']) {
            turnDirection = -1; // Girar a la derecha
        }

        // --- Actualizar velocidad lineal ---
        if (moveDirection !== 0) {
            this.speed += moveDirection * this.acceleration * deltaTime;
            this.speed = THREE.MathUtils.clamp(this.speed, -this.maxSpeed, this.maxSpeed);
        } else {
            // Aplicar fricción/frenado cuando no se pulsa ninguna tecla de movimiento
            if (this.speed > 0) {
                this.speed = Math.max(0, this.speed - this.braking * deltaTime);
            } else if (this.speed < 0) {
                this.speed = Math.min(0, this.speed + this.braking * deltaTime);
            }
        }

        // --- Actualizar velocidad de rotación ---
        if (turnDirection !== 0) {
            this.rotationSpeed += turnDirection * this.rotationAcceleration * deltaTime;
            this.rotationSpeed = THREE.MathUtils.clamp(this.rotationSpeed, -this.maxRotationSpeed, this.maxRotationSpeed);
        } else {
            // Aplicar amortiguamiento de rotación
            if (this.rotationSpeed > 0) {
                this.rotationSpeed = Math.max(0, this.rotationSpeed - this.rotationDamping * deltaTime);
            } else if (this.rotationSpeed < 0) {
                this.rotationSpeed = Math.min(0, this.rotationSpeed + this.rotationDamping * deltaTime);
            }
        }

        // Aplicar rotación al coche
        this.carMesh.rotation.y += this.rotationSpeed * deltaTime;

        // Aplicar movimiento lineal en la dirección actual del coche
        // NOTA IMPORTANTE: El vector "hacia adelante" del modelo 3D (0,0,1) debe coincidir
        // con la orientación inicial del modelo GLB después de cargarlo y cualquier ajuste.
        const forwardVector = new THREE.Vector3(0, 0, 1);
        forwardVector.applyQuaternion(this.carMesh.quaternion);
        this.carMesh.position.addScaledVector(forwardVector, this.speed * deltaTime);

        // Opcional: Rotar las ruedas si el modelo las tiene y están en userData.ruedas
        if (this.carMesh.userData.ruedas && this.carMesh.userData.ruedas.length > 0) {
            this.carMesh.userData.ruedas.forEach(rueda => {
                // Rotar las ruedas según la velocidad del coche
                // Ajusta el multiplicador (e.g., 0.1) para que coincida con la velocidad visual de las ruedas
                // Asume que las ruedas rotan alrededor de su propio eje local X
                rueda.rotation.x += this.speed * deltaTime * 5; // Multiplicador ajustado
            });
        }
    }
}
