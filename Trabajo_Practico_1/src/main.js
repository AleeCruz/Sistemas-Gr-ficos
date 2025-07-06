import * as THREE from 'three';
import { scene, camera, renderer, controls } from './scene.js';
import { catmullRomCurve } from './caminoCurva.js';
import { generarObjetosSinSuperposicion } from './gridObjects.js';
import { crearAuto } from './auto.js';
import { moverCuboSobreCurva } from './movimientoSobreCurva.js';
import { crearCurva } from "./curva.js";
import { CameraManager } from './cameraManager.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { crearLamparaCalle } from './crearLamparaCalle.js';

// Generamos objetos

generarObjetosSinSuperposicion({
    curve: catmullRomCurve,
    streetWidth: 0.5,
    gridSize: 15,
    gridDivision: 15,
});

let auto, curva, clock;
let cameraManager;

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

// --- CURVA ---
curva = crearCurva();
const puntosCurva = curva.getPoints(50);
const curvaGeometry = new THREE.BufferGeometry().setFromPoints(puntosCurva);
scene.add(new THREE.Line(curvaGeometry, new THREE.LineBasicMaterial({ color: 0xff0000 })));

// --- AUTO (GLB) ---
const loader = new GLTFLoader();
loader.load('/modelos/car_model.glb', (gltf) => {
    auto = gltf.scene;
    auto.scale.set(0.001, 0.001, 0.001);
    scene.add(auto);

    auto.userData.ruedas = [];
    auto.traverse((child) => {
        child.rotation.y = Math.PI / 2;
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

// --- LÁMPARAS A LO LARGO DE LA CURVA (alternando lados) ---
const puntosLamparas = curva.getSpacedPoints(7);

puntosLamparas.forEach((pos, i) => {
    const lampara = crearLamparaCalle();
    lampara.scale.set(0.3, 0.3, 0.3); // Escalar más pequeñas

    lampara.position.copy(pos);

    const tangente = curva.getTangent(i / puntosLamparas.length);
    const normal = new THREE.Vector3(-tangente.z, 0, tangente.x).normalize();

    // Alternar lados izquierda/derecha
    const lado = i % 2 === 0 ? 1 : -1;
    lampara.position.add(normal.multiplyScalar(0.5 * lado));

    // Mirar hacia el centro del camino
    lampara.lookAt(pos);

    scene.add(lampara);
});

// --- ANIMACIÓN ---
function animate() {
    requestAnimationFrame(animate);
    const tiempo = clock.getElapsedTime();

    if (auto && curva) {
        moverCuboSobreCurva(auto, curva, tiempo);
        auto.userData.ruedas.forEach(rueda => {
            rueda.rotation.y += 0.5;
        });

        if (cameraManager.getActiveCameraType() === 'primeraPersona') {
            cameraManager.updatePrimeraPersonaCamera(auto.position);
        }
    }

    cameraManager.updateControls();
    renderer.render(scene, cameraManager.getActiveCamera());
}
animate();

// --- RESIZE ---
window.addEventListener('resize', () => {
    cameraManager.onWindowResize(window.innerWidth, window.innerHeight);
    renderer.setSize(window.innerWidth, window.innerHeight);
});