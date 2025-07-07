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

// --- LUCES ---


const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(-5, 5, 5);
scene.add(directionalLight);

const directionalLightHelper = new THREE.DirectionalLightHelper(
    directionalLight,
    1
);
scene.add(directionalLightHelper);


// --- EJES, PLANO, GRILLA ---
const axesHelper = new THREE.AxesHelper(7);
scene.add(axesHelper);

const gridSize = 17;
const gridDivision = 17;
const planeGeometry = new THREE.PlaneGeometry(gridSize, gridDivision);
const planeMaterial = new THREE.MeshBasicMaterial({
    color: 0xf08080,
    side: THREE.DoubleSide,
});
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -Math.PI / 2;
scene.add(plane);


const grid = new THREE.GridHelper(gridSize, gridDivision, 0xaa0000, 0x550000);
scene.add(grid);


export {
    scene,camera,renderer,controls,
    axesHelper,planeGeometry,planeMaterial,
    plane,grid,gridSize,gridDivision};