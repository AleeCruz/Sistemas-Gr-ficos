// scene.js
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// --- ESCENA, CÁMARA Y RENDERIZADOR ---
// El fondo de la escena y la niebla ahora son gestionados por DayNightManager,
// por lo que sus configuraciones iniciales se eliminan aquí.
const scene = new THREE.Scene();
// scene.background = new THREE.Color(0x87CEEB); // ELIMINADO: Gestionado por DayNightManager
// scene.fog = new THREE.Fog(0x330000, 10, 50); // ELIMINADO: Gestionado por DayNightManager

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.set(0, 10, 10);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;


// --- EJES, PLANO, GRILLA ---
const axesHelper = new THREE.AxesHelper(7);
scene.add(axesHelper);

const gridSize = 15;
const gridDivision = 15;
const planeGeometry = new THREE.PlaneGeometry(gridSize, gridDivision);

// --- Cargar la textura ---
const textureLoader = new THREE.TextureLoader();
// Asegúrate de que 'textures/piso.jpg' esté correctamente ubicado en la carpeta 'textures' de tu proyecto.
const planeTexture = textureLoader.load('textures/piso.jpg');

const planeMaterial = new THREE.MeshStandardMaterial({
    map: planeTexture,      // La textura proporciona el detalle visual base
    color: 0xcccccc,        // Este color de tinte será afectado por la iluminación de la escena
    side: THREE.DoubleSide, // Asegura que el plano sea visible desde ambos lados
    roughness: 0.8,         // Controla cuán rugosa parece la superficie (menos reflectante)
    metalness: 0.1          // Controla cuán metálica parece la superficie (ligeramente metálica)
});

const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -Math.PI / 2; // Rotar para que quede plano en el plano XZ
scene.add(plane);

// El ayudante de cuadrícula estaba comentado en tu código original; lo mantengo comentado.
const grid = new THREE.GridHelper(gridSize, gridDivision, 0xaa0000, 0x550000);
// scene.add(grid);

// Las luces globales ahora se definen y gestionan en main.js
// para que puedan pasarse al DayNightManager.
// const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // ELIMINADO
// scene.add(ambientLight); // ELIMINADO

// const directionalLight = new THREE.DirectionalLight(0xffffff, 1); // ELIMINADO
// directionalLight.position.set(5, 10, 5); // ELIMINADO
// scene.add(directionalLight); // ELIMINADO

// Exportar componentes de la escena para su uso en otros módulos
export {
    scene, camera, renderer, controls,
    axesHelper, planeGeometry, planeMaterial,
    plane, grid, gridSize, gridDivision
};
