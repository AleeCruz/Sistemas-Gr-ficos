// main.js

import * as THREE from 'three';
import { scene, camera, renderer, controls } from './scene.js'; // Importamos la cámara, el renderizador y los controles desde scene.js
import { catmullRomCurve } from './caminoCurva.js';
import { generarObjetosSinSuperposicion } from './gridObjects.js';
import { crearAuto } from './auto.js';
import { moverCuboSobreCurva } from './movimientoSobreCurva.js';
import { crearCurva } from "./curva.js";
import { CameraManager } from './cameraManager.js'; // Importamos el CameraManager

generarObjetosSinSuperposicion({
    curve: catmullRomCurve,
    streetWidth: 0.5,
    gridSize: 15,
    gridDivision: 15,
});

let auto, curva, clock;
let cameraManager; // Instancia de CameraManager

// --- LUCES ---
const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

const directionalLightHelper = new THREE.DirectionalLightHelper(
    directionalLight,
    1
);
scene.add(directionalLightHelper);

/**
 * Se agregó un auto y se le asignó una curva para que se mueva sobre ella.
 * El auto se mueve a lo largo de la curva y rota suavemente para seguir la dirección
 */
curva = crearCurva(); // Esta es la curva que usará el auto
const puntosCurva = curva.getPoints(200);
const curvaGeometry = new THREE.BufferGeometry().setFromPoints(puntosCurva);
scene.add(new THREE.Line(curvaGeometry, new THREE.LineBasicMaterial({ color: 0xff0000 }))); // Opcional: visualizar la línea de la curva

// NO SE CREA EL TÚNEL AQUÍ

auto = crearAuto();
scene.add(auto);
clock = new THREE.Clock();

// --- INICIALIZAR CAMERA MANAGER ---
// Pasamos el renderer.domElement para que los controles puedan escuchar eventos
// y la 'camera' de scene.js como la cámara inicial de perspectiva.
cameraManager = new CameraManager(renderer.domElement, camera);

// --- CAMBIAR CÁMARA CON TECLA C ---
window.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'c') {
        cameraManager.toggleCamera();
    }
});

// --- ANIMACIÓN Y RENDER ---
function animate() {
    requestAnimationFrame(animate);
    const tiempo = clock.getElapsedTime();

    if (auto && curva) {
        moverCuboSobreCurva(auto, curva, tiempo);
        // Rotar las ruedas del auto
        auto.userData.ruedas.forEach(rueda => {
            rueda.rotation.y += 0.5; // Ajusta la velocidad de rotación según sea necesario
        });

        // Si la cámara activa es la de primera persona, actualizamos su posición
        if (cameraManager.getActiveCameraType() === 'primeraPersona') {
            cameraManager.updatePrimeraPersonaCamera(auto.position);
        }
    }

    // Actualizamos los controles de la cámara activa
    cameraManager.updateControls();

    // Renderizamos la escena con la cámara activa del CameraManager
    renderer.render(scene, cameraManager.getActiveCamera());
}
animate();

// --- RESPONSIVE ---
window.addEventListener('resize', () => {
    // El CameraManager ahora maneja el redimensionamiento de las cámaras
    cameraManager.onWindowResize(window.innerWidth, window.innerHeight);
    renderer.setSize(window.innerWidth, window.innerHeight);
});