// scene.js
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import { crearCurva } from './curva.js';
import { createTunnel } from './tunel.js';
import { crearPuenteAutopista } from './puente.js';
import { crearLamparaCalle } from './crearLamparaCalle.js';

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

// Curva y tubo que representa la carretera
const curva = crearCurva();


// Túnel en posición de la curva
const tunel = createTunnel();
const tTunel = 0.93;
const puntoTunel = curva.getPointAt(tTunel);
const tangenteTunel = curva.getTangentAt(tTunel);
tunel.position.copy(puntoTunel);
tunel.lookAt(puntoTunel.clone().add(tangenteTunel));
tunel.scale.set(0.1,0.1,0.09); // Escalar túnel
scene.add(tunel);

// Puente en otra posición
// Crear un puente base una sola vez
const puenteBase = crearPuenteAutopista();
puenteBase.scale.set(0.007, 0.02, 0.01); // Escala inicial para el base
// Opcional: agregar base si querés verlo también (o no)

// Clonar puentes en posiciones diferentes
const posicionesPuente = [0.6, 0.7,0.8]; // Parámetros t sobre la curva para los puentes

posicionesPuente.forEach(tPos => {
  const punto = curva.getPointAt(tPos);
  const tangente = curva.getTangentAt(tPos);

  const puenteClone = puenteBase.clone();
  puenteClone.position.copy(punto);
  puenteClone.lookAt(punto.clone().add(tangente));
  // Si querés escala diferente para los clones, podés cambiar acá:
  // puenteClone.scale.set(0.007, 0.02, 0.01);
  scene.add(puenteClone);
});

// Lámparas distribuidas a lo largo de la curva
// Crear una lámpara base una sola vez
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


export {
    scene, camera, renderer, controls,
    axesHelper, planeGeometry, planeMaterial,
    plane, grid, gridSize, gridDivision
};
