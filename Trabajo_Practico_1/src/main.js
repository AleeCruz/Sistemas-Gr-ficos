// main.js
import * as THREE from 'three';
import { scene, camera, renderer, controls } from './scene.js'; // Importa elementos de tu scene.js
import { catmullRomCurve } from './caminoCurva.js';
import { generarObjetosSinSuperposicion } from './gridObjects.js';
import { crearAuto } from './auto.js'; // (No usado actualmente, pero mantenido)
import { moverCuboSobreCurva } from './movimientoSobreCurva.js';
import { crearCurva } from "./curva.js";
import { CameraManager } from './cameraManager.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// Importa los nuevos módulos para el sol y el GUI
import { setupLights, updateLightHelper } from './lightManager.js';
import { setupGUI } from './guiManager.js';
import { animateSun, getSunSettings } from './sunAnimation.js'; // Renombrado para claridad

// --- Inicialización de variables globales ---
let auto, curvaPrincipal, clock;
let cameraManager;
let spotLight, ambientLight; // Variables para las luces controladas por los nuevos módulos

// --- Generar objetos del grid ---
generarObjetosSinSuperposicion({
    curve: catmullRomCurve,
    streetWidth: 0.5,
    gridSize: 15,
    gridDivision: 15,
});

// --- CURVA PRINCIPAL ---
curvaPrincipal = crearCurva(); // Asumo que esta es la curva de tu carretera
const puntosCurva = curvaPrincipal.getPoints(200);
const curvaGeometry = new THREE.BufferGeometry().setFromPoints(puntosCurva);
scene.add(new THREE.Line(curvaGeometry, new THREE.LineBasicMaterial({ color: 0xff0000 })));

// --- AUTO (GLB) ---
const loader = new GLTFLoader();
loader.load('/modelos/car_model.glb', (gltf) => {
    auto = gltf.scene;
    auto.scale.set(0.001, 0.001, 0.001);
    scene.add(auto);

    auto.userData.ruedas = []; // Asumo que las ruedas se añaden aquí, aunque no veo la lógica de añadir hijos específicos.
    auto.traverse((child) => {
        // Tu lógica existente para las ruedas o rotación.
        // Asegúrate de que esta lógica maneje correctamente los Mesh específicos si son ruedas.
        if (child.isMesh && child.name.includes('wheel')) { // Ejemplo: si el nombre de las ruedas contiene 'wheel'
            auto.userData.ruedas.push(child);
        }
        child.rotation.y = Math.PI / 2; // Esto rotaría todo el auto al cargarlo. Podrías necesitar ajustarlo.
    });

}, undefined, (error) => {
    console.error("Error al cargar el modelo GLB:", error);
});

clock = new THREE.Clock();

// --- CAMERA MANAGER ---
cameraManager = new CameraManager(renderer.domElement, camera);

window.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'c') {
        cameraManager.toggleCamera();
    }
});

// --- Configuración de Luces del Sol y Ambiente (usando el nuevo módulo) ---
// Obtén las instancias de las luces del lightManager
const lights = setupLights(scene);
spotLight = lights.spotLight;
ambientLight = lights.ambientLight;

// --- Configuración del GUI (usando el nuevo módulo) ---
// Pasamos las luces y la escena al GUI, junto con el objeto de configuración del sol
setupGUI(spotLight, ambientLight, scene, getSunSettings());

// --- ANIMACIÓN ---
function animate() {
    requestAnimationFrame(animate);
    const deltaTime = clock.getDelta(); // Usar deltaTime para movimientos más suaves

    // Actualiza los controles de la cámara
    controls.update();

    // Mueve el auto sobre la curva
    if (auto && curvaPrincipal) {
        // Usar deltaTime para mover el auto en función del tiempo transcurrido, no el tiempo total
        moverCuboSobreCurva(auto, curvaPrincipal, clock.getElapsedTime()); // Usar getElapsedTime si moverCuboSobreCurva depende del tiempo total
        auto.userData.ruedas.forEach(rueda => {
            rueda.rotation.y += 0.5 * deltaTime * 60; // Ajusta la velocidad de rotación con deltaTime
        });

        if (cameraManager.getActiveCameraType() === 'primeraPersona') {
            cameraManager.updatePrimeraPersonaCamera(auto.position, auto.quaternion); // Pasar también la rotación del auto
        }
    }

    // Animar el sol y actualizar su helper
    animateSun(spotLight, getSunSettings());
    updateLightHelper(spotLight); // updateLightHelper necesita el spotLight directamente

    // Renderizar la escena con la cámara activa
    renderer.render(scene, cameraManager.getActiveCamera());
}
animate();

// --- RESIZE ---
window.addEventListener('resize', () => {
    cameraManager.onWindowResize(window.innerWidth, window.innerHeight);
    renderer.setSize(window.innerWidth, window.innerHeight);
});