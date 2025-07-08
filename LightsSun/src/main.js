// main.js

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GUI } from 'dat.gui';
import { createIlluminationSun } from './iluminationSun.js';

// 1. Configuración básica de la escena
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.shadowMap.autoUpdate = true;
document.body.appendChild(renderer.domElement);

// Ajustar el color de fondo del renderer para que sea más visible
renderer.setClearColor(0xaaaaaa);

// 2. Luz Ambiental
const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);

// 3. Crear el plano XZ
const planeGeometry = new THREE.PlaneGeometry(10, 10);
const planeMaterial = new THREE.MeshStandardMaterial({ color: 0x888888, side: THREE.DoubleSide });
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = Math.PI / 2;
plane.receiveShadow = true;
scene.add(plane);

// 4. Crear el cubo
const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
const cubeMaterial = new THREE.MeshStandardMaterial({ color: 0x0077ff });
const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
cube.castShadow = true;
cube.receiveShadow = true;
cube.position.y = 0.5;
scene.add(cube);

// --- Uso del nuevo módulo para el sol y la luz ---
const initialOrbitRadius = 8;
const initialOrbitSpeed = 0.5;
const targetPosition = new THREE.Vector3(0, 0.5, 0);
const { sun, spotLight, update: updateSun, params: sunParams, setOrbitAngle } = createIlluminationSun(scene, initialOrbitRadius, initialOrbitSpeed, targetPosition);
// --------------------------------------------------

// 6. Posicionar la cámara
camera.position.set(5, 5, 5);
camera.lookAt(0, 0, 0);

// 7. Controles de órbita para la cámara
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// --- Configuración de dat.GUI ---
const gui = new GUI();
const sunFolder = gui.addFolder('Control Sol');

// Parámetros para los controles del sol
sunFolder.add(sunParams, 'orbitRadius', 1, 15).name('Radio Órbita');
sunFolder.add(sunParams, 'orbitSpeed', 0.1, 6.0).name('Velocidad Órbita');

// --- NUEVOS CONTROLES PARA MOMENTOS DEL DÍA ---
// Definir ángulos para cada momento del día (en radianes)
// Considera que una órbita completa es 2 * Math.PI (aproximadamente 6.28 radianes)
// Y que el sol se mueve en el plano XY. Por ejemplo:
// - Mediodía: Sol arriba, sombra debajo (o no visible si el plano no es vertical)
// - Mañana: Sol saliendo por un lado (ej: -X o +X)
// - Tarde: Sol poniéndose por el otro lado
// - Noche: Sol detrás o completamente oscuro
// Los valores exactos dependerán de cómo quieres que se vea tu "día" en tu escena.
const timeOfDayAngles = {
    'Mañana': Math.PI * 0.05, // Ejemplo: Sol arriba-izquierda
    'Mediodía': Math.PI * 0.38, // Ejemplo: Sol directamente encima del cubo (Y positiva)
    'Tarde': Math.PI * 0.75,   // Ejemplo: Sol arriba-derecha
    'Noche': Math.PI * 1.05     // Ejemplo: Sol por debajo (no visible, o muy poca luz)
};

const timeOfDayControls = {
    moment: 'Mañana' // Valor inicial
};

// Añadir un dropdown (desplegable) a dat.GUI
sunFolder.add(timeOfDayControls, 'moment', Object.keys(timeOfDayAngles))
    .name('Momento del Día')
    .onChange((value) => {
        // Cuando el usuario selecciona una opción, establecemos el ángulo correspondiente
        setOrbitAngle(timeOfDayAngles[value]);
    });

sunFolder.open();
// ---------------------------------------------

// 8. Función de animación/renderizado
function animate() {
    requestAnimationFrame(animate);

    controls.update();
    updateSun();
    renderer.render(scene, camera);
}

// 9. Manejar el redimensionamiento de la ventana
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Iniciar la animación
animate();