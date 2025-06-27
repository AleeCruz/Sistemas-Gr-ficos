import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// --- ESCENA, CÁMARA Y RENDERER ---
//---------------------
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB);
scene.fog = new THREE.Fog(0x330000, 10, 50);

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
const planeTexture = textureLoader.load('textures/piso.jpg'); // Asegúrate de que 'piso.png' esté en la ruta correcta

// *** CAMBIO CLAVE AQUÍ: Ajustamos el 'color' del material ***
const planeMaterial = new THREE.MeshStandardMaterial({
    map: planeTexture,      // La textura sigue siendo el mapa principal.
    color: 0xcccccc,        // ¡Aquí cambiamos el color a un gris claro! (hexadecimal)
    side: THREE.DoubleSide,
    roughness: 0.8,
    metalness: 0.1
});

const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -Math.PI / 2;
scene.add(plane);


const grid = new THREE.GridHelper(gridSize, gridDivision, 0xaa0000, 0x550000);
//scene.add(grid);

// --- AGREGAR ILUMINACIÓN A LA ESCENA ---
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, 5);
scene.add(directionalLight);

export {
    scene,camera,renderer,controls,
    axesHelper,planeGeometry,planeMaterial,
    plane,grid,gridSize,gridDivision
};