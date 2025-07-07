// scene.js
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { crearCurva } from './curva.js';
import { createTunnel } from './tunel.js';
import { crearPuenteAutopista } from './puente.js';
import { crearLamparaCalle } from './crearLamparaCalle.js';
import { TGALoader } from 'three/addons/loaders/TGALoader.js';

// --- ESCENA, CÁMARA Y RENDERER ---
//---------------------
const scene = new THREE.Scene();
// Usar valores por defecto que luego el GUI y lightManager podrán cambiar
scene.background = new THREE.Color(0x87CEEB); // Color de día claro por defecto
scene.fog = new THREE.Fog(0x87CEEB, 60, 120); // Fog con color de cielo por defecto y rangos amplios

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
renderer.shadowMap.enabled = true; // Habilita las sombras aquí para que el SpotLight las use
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Tipo de mapa de sombras
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// --- LUCES (QUITADAS DE AQUÍ, AHORA EN lightManager.js) ---
// const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
// directionalLight.position.set(-5, 5, 5);
// scene.add(directionalLight);

// const directionalLightHelper = new THREE.DirectionalLightHelper(
//     directionalLight,
//     1
// );
// scene.add(directionalLightHelper);


// --- EJES, PLANO, GRILLA ---
// --- EJES, PLANO, GRILLA ---
const axesHelper = new THREE.AxesHelper(7);
scene.add(axesHelper);

const gridSize = 30;
const gridDivision = 30;
const planeGeometry = new THREE.PlaneGeometry(gridSize, gridDivision);

// --- Cargar la textura ---
const textureLoader = new THREE.TextureLoader();
// Asegúrate de que 'textures/piso.jpg' esté correctamente ubicado en la carpeta 'textures' de tu proyecto.
const planeTexture = textureLoader.load('textures/asfalto3.png');

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
const grid = new THREE.GridHelper(gridSize, gridDivision, 0x333333, 0x333333);
// scene.add(grid);

// Curva y tubo que representa la carretera
const curva = crearCurva();


// Túnel en posición de la curva
const tunel = createTunnel();
const tTunel = 0.90;
const puntoTunel = curva.getPointAt(tTunel);
const tangenteTunel = curva.getTangentAt(tTunel);
tunel.position.copy(puntoTunel);
tunel.lookAt(puntoTunel.clone().add(tangenteTunel));
tunel.scale.set(0.1,0.1,-0.09); // Escalar túnel
scene.add(tunel);

// Puente en otra posición
const puenteBase = crearPuenteAutopista();
puenteBase.scale.set(0.007, 0.02, 0.01);

const posicionesPuente = [0.6, 0.7,0.8]; // Parámetros t sobre la curva para los puentes

posicionesPuente.forEach(tPos => {
  const punto = curva.getPointAt(tPos);
  const tangente = curva.getTangentAt(tPos);

  const puenteClone = puenteBase.clone();
  puenteClone.position.copy(punto);
  puenteClone.lookAt(punto.clone().add(tangente));
  scene.add(puenteClone);
});

// Lámparas distribuidas a lo largo de la curva
const lamparaBase = crearLamparaCalle();
const cantidadLamparas = 4;
const distanciaAlCostado = 0.6;

for (let i = 0; i < cantidadLamparas; i++) {
  const t = i / cantidadLamparas;
  const pos = curva.getPointAt(t);
  const tangente = curva.getTangentAt(t);
  const normal = tangente.clone().cross(new THREE.Vector3(0, 1, 0)).normalize();

  // Lámpara derecha (offset positivo)
  const lamparaDerecha = lamparaBase.clone();
  lamparaDerecha.position.copy(pos.clone().add(normal.clone().multiplyScalar(distanciaAlCostado)));
  lamparaDerecha.scale.set(0.5, 0.5, 0.5);
  scene.add(lamparaDerecha);

  // Lámpara izquierda (offset negativo)
  const lamparaIzquierda = lamparaBase.clone();
  lamparaIzquierda.position.copy(pos.clone().add(normal.clone().multiplyScalar(-distanciaAlCostado)));
  lamparaIzquierda.scale.set(0.5, 0.5, 0.5);
  scene.add(lamparaIzquierda);
}


//------Concepto de skybox -------
let materialArray = [];
const tgaLoader = new TGALoader();

let texture_ft = tgaLoader.load("assets/skybox/stormydays_ft.tga");
let texture_bk = tgaLoader.load("assets/skybox/stormydays_bk.tga");
let texture_up = tgaLoader.load("assets/skybox/stormydays_up.tga");
let texture_dn = tgaLoader.load("assets/skybox/stormydays_dn.tga");
let texture_rt = tgaLoader.load("assets/skybox/stormydays_rt.tga");
let texture_lf = tgaLoader.load("assets/skybox/stormydays_lf.tga");


materialArray.push(new THREE.MeshBasicMaterial({ map: texture_ft })); // +Z
materialArray.push(new THREE.MeshBasicMaterial({ map: texture_bk })); // -Z
materialArray.push(new THREE.MeshBasicMaterial({ map: texture_up })); // +Y
materialArray.push(new THREE.MeshBasicMaterial({ map: texture_dn })); // -Y
materialArray.push(new THREE.MeshBasicMaterial({
    map: texture_rt
})); // +X
materialArray.push(new THREE.MeshBasicMaterial({ map: texture_lf })); // -X

for (let i = 0; i < 6; i++) {
    materialArray[i].side = THREE.BackSide;
}

let skyboxSize= 30; // Un skybox debería ser muy grande para cubrir la escena
let skyboxGeo = new THREE.BoxGeometry(skyboxSize,skyboxSize,skyboxSize);
let skybox = new THREE.Mesh(skyboxGeo, materialArray);
skybox.position.set(0, 0, 0); // El skybox generalmente se centra en el origen o en la cámara
scene.add(skybox);


export {
    scene,camera,renderer,controls, // Exporta los elementos principales para main.js
    axesHelper,planeGeometry,planeMaterial,
    plane,grid,gridSize,gridDivision};