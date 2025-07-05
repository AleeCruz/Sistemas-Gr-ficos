import * as THREE from 'three';
import { GUI } from 'dat.gui';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'; // Importa OrbitControls

// 1. Configuración básica de THREE.js
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true }); // antialias para bordes más suaves
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true; // Habilitar sombras
document.body.appendChild(renderer.domElement);

// 2. Añadir OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // Para un movimiento más suave
controls.dampingFactor = 0.25;
controls.screenSpacePanning = false; // Evita que la cámara se mueva en el plano de la pantalla

// 3. Añadir Ejes Cartesianos
const axesHelper = new THREE.AxesHelper(5); // El argumento es el tamaño de los ejes
scene.add(axesHelper);

const ambientLight = new THREE.AmbientLight(0x404040, 1); // Luz ambiental
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1); // Luz direccional
directionalLight.position.set(5, 5, 0).normalize();
directionalLight.castShadow = true; // Permitir que la luz direccional proyecte sombras
scene.add(directionalLight);


// 4. Crear un cubo
const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshStandardMaterial({ color: 0xff0000, wireframe: false }); // wireframe para ver la geometría
const cube = new THREE.Mesh(geometry, material);
cube.castShadow = true; // Permitir que el cubo proyecte sombras
cube.receiveShadow = true; // Permitir que el cubo reciba sombras
scene.add(cube);

camera.position.set(3,3,3);

// 5. Inicializar dat.GUI
const gui = new GUI();

// 6. Definir un objeto de control para dat.GUI
const cubeControls = {
    positionX: cube.position.x,
    positionY: cube.position.y,
    positionZ: cube.position.z,
    rotationX: cube.rotation.x,
    rotationY: cube.rotation.y,
    rotationZ: cube.rotation.z,
    scaleX: cube.scale.x, // Nuevo control de escalado
    scaleY: cube.scale.y,
    scaleZ: cube.scale.z,
    color: material.color.getHex(),
    wireframe: material.wireframe, // Control para wireframe
    
};

// 7. Agregar controles a dat.GUI
const positionFolder = gui.addFolder('Posición del Cubo');
positionFolder.add(cubeControls, 'positionX', -5, 5).onChange(value => cube.position.x = value);
positionFolder.add(cubeControls, 'positionY', -5, 5).onChange(value => cube.position.y = value);
positionFolder.add(cubeControls, 'positionZ', -5, 5).onChange(value => cube.position.z = value);
positionFolder.open();

const rotationFolder = gui.addFolder('Rotación del Cubo');
rotationFolder.add(cubeControls, 'rotationX', 0, Math.PI * 2).onChange(value => cube.rotation.x = value);
rotationFolder.add(cubeControls, 'rotationY', 0, Math.PI * 2).onChange(value => cube.rotation.y = value);
rotationFolder.add(cubeControls, 'rotationZ', 0, Math.PI * 2).onChange(value => cube.rotation.z = value);
rotationFolder.open();

const scaleFolder = gui.addFolder('Escalado del Cubo'); // Nueva carpeta para escalado
scaleFolder.add(cubeControls, 'scaleX', 0.1, 5).onChange(value => cube.scale.x = value);
scaleFolder.add(cubeControls, 'scaleY', 0.1, 5).onChange(value => cube.scale.y = value);
scaleFolder.add(cubeControls, 'scaleZ', 0.1, 5).onChange(value => cube.scale.z = value);
scaleFolder.open();

// Control de color
gui.addColor(cubeControls, 'color').onChange(value => material.color.set(value));

// Control de wireframe
gui.add(cubeControls, 'wireframe').onChange(value => material.wireframe = value);



// 8. Función de animación
function animate() {
    requestAnimationFrame(animate);


    controls.update(); // Necesario si enableDamping está en true

    renderer.render(scene, camera);
}

animate();

// 9. Manejar el redimensionamiento de la ventana
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});