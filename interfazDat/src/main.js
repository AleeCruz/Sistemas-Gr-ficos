import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GUI } from "dat.gui"; // Importa GUI directamente

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

camera.position.set(3,3,3);
camera.lookAt(0,0,0);
const controls = new OrbitControls(camera,document.body);

const renderer = new THREE.WebGLRenderer({ antialias: true }); // Agregado antialiasing
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setAnimationLoop( animate );
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Mejora la calidad de las sombras
document.body.appendChild( renderer.domElement );


// --- Objetos en la escena ---
const boxGeometry = new THREE.BoxGeometry(2,2,2);
const boxMaterial = new THREE.MeshStandardMaterial({color: 0xff0000});
const boxMesh = new THREE.Mesh(boxGeometry,boxMaterial);
boxMesh.castShadow = true ;
boxMesh.receiveShadow = true ; // Asegúrate de que reciba sombras
scene.add(boxMesh);

// Agregamos un suelo para que las sombras sean visibles
const floorGeometry = new THREE.PlaneGeometry(10, 10);
const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x808080, side: THREE.DoubleSide });
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = Math.PI / 2; // Rotar para que sea horizontal
floor.position.y = -1; // Colocar debajo del cubo
floor.receiveShadow = true; // El suelo recibe sombras
scene.add(floor);


// --- Luces ---
const ambientLight = new THREE.AmbientLight(0xffffff,1);
scene.add(ambientLight);

// --- SpotLight (Foco) con color rojo inicial ---
const spotLight = new THREE.SpotLight(0xff0000, 5, 20, Math.PI / 6, 0.5, 2); // Color inicial rojo (0xff0000)
spotLight.position.set(5,10,5);
spotLight.castShadow = true;

// Configuración de las sombras para el SpotLight
spotLight.shadow.mapSize.width = 1024;
spotLight.shadow.mapSize.height = 1024;
spotLight.shadow.camera.near = 0.5;
spotLight.shadow.camera.far = 50;
spotLight.shadow.focus = 1; // Un valor entre 0 y 1 para enfocar el cono de sombra.

scene.add(spotLight);

// Opcional: Ayudante para ver la posición y dirección del SpotLight
const spotLightHelper = new THREE.SpotLightHelper(spotLight);
scene.add(spotLightHelper);


// --- Configuración de dat.GUI ---
const gui = new GUI();

// Objeto para almacenar los parámetros controlables
// Usamos un objeto separado para que dat.GUI pueda modificar sus propiedades directamente
const spotLightParams = {
    color: spotLight.color.getHex(), // Obtener el color actual en formato hexadecimal
    intensity: spotLight.intensity,
    distance: spotLight.distance,
    angle: spotLight.angle,
    penumbra: spotLight.penumbra,
    decay: spotLight.decay,
    x: spotLight.position.x,
    y: spotLight.position.y,
    z: spotLight.position.z,
    targetX: spotLight.target.position.x, // Posición del target
    targetY: spotLight.target.position.y,
    targetZ: spotLight.target.position.z,
    castShadow: spotLight.castShadow,
    shadowMapSizeWidth: spotLight.shadow.mapSize.width,
    shadowMapSizeHeight: spotLight.shadow.mapSize.height,
    shadowCameraNear: spotLight.shadow.camera.near,
    shadowCameraFar: spotLight.shadow.camera.far,
    shadowFocus: spotLight.shadow.focus
};

// Carpeta para los parámetros del SpotLight
const lightFolder = gui.addFolder('SpotLight Parameters');

lightFolder.addColor(spotLightParams, 'color').onChange(value => {
    spotLight.color.setHex(value);
});

lightFolder.add(spotLightParams, 'intensity', 0, 20).onChange(value => {
    spotLight.intensity = value;
});

lightFolder.add(spotLightParams, 'distance', 0, 100).onChange(value => {
    spotLight.distance = value;
});

lightFolder.add(spotLightParams, 'angle', 0, Math.PI / 2).onChange(value => {
    spotLight.angle = value;
    spotLightHelper.update(); // Actualizar el ayudante cuando cambia el ángulo
});

lightFolder.add(spotLightParams, 'penumbra', 0, 1).onChange(value => {
    spotLight.penumbra = value;
});

lightFolder.add(spotLightParams, 'decay', 0, 2).onChange(value => {
    spotLight.decay = value;
});

// Posición de la luz
const positionFolder = lightFolder.addFolder('Position');
positionFolder.add(spotLightParams, 'x', -20, 20).onChange(value => { spotLight.position.x = value; spotLightHelper.update(); });
positionFolder.add(spotLightParams, 'y', 0, 20).onChange(value => { spotLight.position.y = value; spotLightHelper.update(); });
positionFolder.add(spotLightParams, 'z', -20, 20).onChange(value => { spotLight.position.z = value; spotLightHelper.update(); });

// Target de la luz (hacia donde apunta)
// Es crucial añadir spotLight.target a la escena para que sus cambios de posición se reflejen.
// También se necesita updateMatrixWorld() para que Three.js recalcule su posición.
scene.add(spotLight.target);
const targetFolder = lightFolder.addFolder('Target');
targetFolder.add(spotLightParams, 'targetX', -10, 10).onChange(value => { spotLight.target.position.x = value; spotLight.target.updateMatrixWorld(); spotLightHelper.update(); });
targetFolder.add(spotLightParams, 'targetY', -10, 10).onChange(value => { spotLight.target.position.y = value; spotLight.target.updateMatrixWorld(); spotLightHelper.update(); });
targetFolder.add(spotLightParams, 'targetZ', -10, 10).onChange(value => { spotLight.target.position.z = value; spotLight.target.updateMatrixWorld(); spotLightHelper.update(); });


// Parámetros de sombra
const shadowFolder = lightFolder.addFolder('Shadows');
shadowFolder.add(spotLightParams, 'castShadow').onChange(value => {
    spotLight.castShadow = value;
});
shadowFolder.add(spotLightParams, 'shadowMapSizeWidth', [256, 512, 1024, 2048]).name('Map Size Width').onChange(value => {
    spotLight.shadow.mapSize.width = value;
    spotLight.shadow.map.dispose(); // Liberar memoria del mapa anterior
    spotLight.shadow.map = null; // Forzar recreación del mapa
});
shadowFolder.add(spotLightParams, 'shadowMapSizeHeight', [256, 512, 1024, 2048]).name('Map Size Height').onChange(value => {
    spotLight.shadow.mapSize.height = value;
    spotLight.shadow.map.dispose();
    spotLight.shadow.map = null;
});
shadowFolder.add(spotLightParams, 'shadowCameraNear', 0.1, 10).onChange(value => {
    spotLight.shadow.camera.near = value;
    spotLight.shadow.camera.updateProjectionMatrix();
});
shadowFolder.add(spotLightParams, 'shadowCameraFar', 10, 100).onChange(value => {
    spotLight.shadow.camera.far = value;
    spotLight.shadow.camera.updateProjectionMatrix();
});
shadowFolder.add(spotLightParams, 'shadowFocus', 0, 1).onChange(value => {
    spotLight.shadow.focus = value;
});

lightFolder.open(); // Abrir la carpeta de la luz por defecto
positionFolder.open();
targetFolder.open();
shadowFolder.open();


const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

// --- Bucle de animación ---
function animate() {
    controls.update(); // Actualizar los controles de órbita
    renderer.render( scene, camera );
}

// --- Manejo de redimensionamiento de ventana ---
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});