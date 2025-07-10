// main.js
import * as THREE from 'three';
import { scene, camera, renderer, controls } from './scene.js';
import { catmullRomCurve } from './caminoCurva.js';
import { generarObjetosSinSuperposicion } from './gridObjects.js';
import { moverCuboSobreCurva } from './movimientoSobreCurva.js';
import { crearCurva } from "./curva.js";
import { CameraManager } from './cameraManager.js';
import { VehicleController } from './vehicleController.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

import { setupLights, updateLightHelper } from './lightManager.js';
import { setupGUI } from './guiManager.js';
import { animateSun, getSunSettings } from './sunAnimation.js';

let auto, curvaPrincipal, clock;
let cameraManager, vehicleController;
let spotLight, ambientLight;

// --- Generar objetos en el grid ---
generarObjetosSinSuperposicion({
    curve: catmullRomCurve,
    streetWidth: 0.5,
    gridSize: 15,
    gridDivision: 15,
});

// --- Crear curva principal y mostrarla ---
curvaPrincipal = crearCurva();
const puntosCurva = curvaPrincipal.getPoints(200);
const curvaGeometry = new THREE.BufferGeometry().setFromPoints(puntosCurva);
scene.add(new THREE.Line(curvaGeometry, new THREE.LineBasicMaterial({ color: 0xff0000 })));

// --- Cargar modelo del auto ---
const loader = new GLTFLoader();
loader.load('/modelos/car_model.glb', (gltf) => {
    const model = gltf.scene;
    model.scale.set(0.001, 0.001, 0.001);

    // Crear contenedor lógico del auto
    auto = new THREE.Group();
    auto.add(model);
    scene.add(auto);

    // Guardar el modelo visual
    auto.userData.model = model;

    // Detectar ruedas
    model.userData.ruedas = [];
    model.traverse((child) => {
        if (child.isMesh && child.name.toLowerCase().includes('wheel')) {
            model.userData.ruedas.push(child);
        }
    });

    auto.userData.ruedas = model.userData.ruedas;

    // Crear controlador del vehículo
    vehicleController = new VehicleController(auto);
});

// --- Inicializar sistema ---
clock = new THREE.Clock();
cameraManager = new CameraManager(renderer.domElement, camera);

// --- Manejo de teclas de cámara ---
window.addEventListener('keydown', (e) => {
    switch (e.key) {
        case '1':
            cameraManager.setCameraByType('orbit');
            break;
        case '2':
            cameraManager.setCameraByType('freeWalk');
            break;
        case '3':
            cameraManager.setCameraByType('terceraPersona');
            break;
        case '4':
    cameraManager.setCameraByType('vehicle');

    if (auto && curvaPrincipal) {
        // Obtener el parámetro t actual del auto en la curva, o aproximarlo
        // Si no tenés un parámetro 't' guardado, podés calcular el punto más cercano (aproximado)

        // Suponiendo que usás elapsedTime para mover el auto sobre la curva:
        const tiempo = clock.getElapsedTime() % 1; // o el método que uses para normalizar t en [0,1]

        // Obtener tangente y posición de la curva en ese t
        const posCurva = curvaPrincipal.getPointAt(tiempo);
        const tangenteCurva = curvaPrincipal.getTangentAt(tiempo);

        // Forzar posición del auto al punto de la curva
        auto.position.copy(posCurva);

        // Calcular la rotación para que el frente del auto apunte en la dirección de la tangente
        const angle = Math.atan2(tangenteCurva.x, tangenteCurva.z);
        auto.rotation.set(0, angle, 0);
    }
    break;

    }
});

// --- Luces y GUI ---
const lights = setupLights(scene);
spotLight = lights.spotLight;
ambientLight = lights.ambientLight;
setupGUI(spotLight, ambientLight, scene, getSunSettings());

// --- Animación ---
function animate() {
    requestAnimationFrame(animate);
    const deltaTime = clock.getDelta();
    const camType = cameraManager.getActiveCameraType();

    // Movimiento automático del auto (solo si no es modo vehículo)
    if (auto && curvaPrincipal && camType !== 'vehicle') {
        moverCuboSobreCurva(auto, curvaPrincipal, clock.getElapsedTime());
    }

    // 🔄 Rotar visualmente el modelo del auto según la cámara
    if (auto?.userData?.model) {
        const model = auto.userData.model;
        if (camType === 'orbit' || camType === 'freeWalk' || camType === 'terceraPersona') {
            model.rotation.y = Math.PI / 2;
        } else {
            model.rotation.y = 0; // En modo vehículo
        }
    }

    // Actualizar cámara y vehículo
    cameraManager.update(deltaTime, vehicleController, auto);

    // Sol y GUI
    updateLightHelper(spotLight);
    animateSun(spotLight, getSunSettings());

    renderer.render(scene, cameraManager.getActiveCamera());
}
animate();

// --- Resize dinámico ---
window.addEventListener('resize', () => {
    cameraManager.onWindowResize(window.innerWidth, window.innerHeight);
    renderer.setSize(window.innerWidth, window.innerHeight);
});
