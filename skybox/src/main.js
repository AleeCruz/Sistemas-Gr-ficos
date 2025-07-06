// main.js

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
// ¡Importa TGALoader!
import { TGALoader } from 'three/addons/loaders/TGALoader.js'; 

// 1. Configuración de la escena, cámara y renderizador
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 2. Añadir OrbitControls (para mover la cámara con el ratón)
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.25;


const ambientLight = new THREE.AmbientLight(0x404040, 1); // Luz ambiental suave
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff,1);
directionalLight.position.set(10,10,10);
scene.add(directionalLight);

// Posicionar la cámara
camera.position.set(30,30,30);


//------Concepto de skybox -------
let materialArray = [];
// Usa TGALoader para tus texturas .tga
const tgaLoader = new TGALoader();

let texture_ft = tgaLoader.load("assets/skybox/stormydays_ft.tga");
let texture_bk = tgaLoader.load("assets/skybox/stormydays_bk.tga");
let texture_up = tgaLoader.load("assets/skybox/stormydays_up.tga");
let texture_dn = tgaLoader.load("assets/skybox/stormydays_dn.tga");
let texture_rt = tgaLoader.load("assets/skybox/stormydays_rt.tga");
let texture_lf = tgaLoader.load("assets/skybox/stormydays_lf.tga");


// Es crucial que el orden de los materiales en el array para el BoxGeometry sea:
// +X (derecha), -X (izquierda), +Y (arriba), -Y (abajo), +Z (adelante), -Z (atrás)
// Parece que tienes: ft, bk, up, dn, rt, lf.
// Necesitas mapearlos al orden correcto de Three.js: rt, lf, up, dn, ft, bk
// Basado en tu nombramiento (ft = front, bk = back, rt = right, lf = left, up = up, dn = down):
// Three.js orden: +X, -X, +Y, -Y, +Z, -Z
// Tu orden:      rt, lf, up, dn, ft, bk

materialArray.push(new THREE.MeshBasicMaterial({ map: texture_ft })); // +Z
materialArray.push(new THREE.MeshBasicMaterial({ map: texture_bk })); // -Z
materialArray.push(new THREE.MeshBasicMaterial({ map: texture_up })); // +Y
materialArray.push(new THREE.MeshBasicMaterial({ map: texture_dn })); // -Y
materialArray.push(new THREE.MeshBasicMaterial({ 
    map: texture_rt
   ///transparent: true, // Necesario para que opacity funcione
    //opacity: 0.3
      })); // +X
materialArray.push(new THREE.MeshBasicMaterial({ map: texture_lf })); // -X

// Asegúrate de que las caras del material no muestren el "reverso" del cubo
// Esto es importante para que el skybox se vea correctamente desde adentro
for (let i = 0; i < 6; i++) {
    materialArray[i].side = THREE.BackSide;
}


// Tamaño del skybox: hazlo GRANDE.
// Si tu ciudad es de 20x20, el skybox debe ser mucho más grande para que parezca el horizonte.
// Un tamaño de 1000 es un buen punto de partida.
let skyboxSize= 50;
let skyboxGeo = new THREE.BoxGeometry(skyboxSize,skyboxSize,skyboxSize); 
let skybox = new THREE.Mesh(skyboxGeo, materialArray);
skybox.position.set(0, skyboxSize/3, 0); // Centra el skybox en la escena
scene.add(skybox);

// Si en el futuro usas scene.background, el mesh del skybox no sería necesario.
// Pero si insistes en el mesh, recuerda que la cámara debe estar DENTRO del cubo
// y el material debe renderizarse desde el "backside".


// Opcional: añade tu plano de ciudad y edificios aquí
// Un simple plano como piso de la ciudad
const floorGeometry = new THREE.PlaneGeometry(50, 50); // 20x20 en el plano XZ
const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x808080, side: THREE.DoubleSide });
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = Math.PI / 2; // Rota el plano para que el XZ sea el piso
scene.add(floor);

// Opcional: Algunos cubos para simular edificios
for (let i = 0; i < 20; i++) { // Reduje a 20 para hacer menos pesado
    const boxGeometry = new THREE.BoxGeometry(1 + Math.random() * 2, 0.5 + Math.random() * 5, 1 + Math.random() * 2);
    const boxMaterial = new THREE.MeshStandardMaterial({ color: Math.random() * 0xffffff }); // Material Standard para reflejos con luces
    const box = new THREE.Mesh(boxGeometry, boxMaterial);
    box.position.x = Math.random() * 18 - 9; // Posiciones aleatorias dentro del área de la ciudad
    box.position.z = Math.random() * 18 - 9;
    box.position.y = box.geometry.parameters.height / 2; // Para que el cubo esté sobre el piso
    scene.add(box);
}


const axesHelper = new THREE.AxesHelper(50); // Añadir un helper de ejes para referencia visual
scene.add(axesHelper);

// 4. Bucle de animación (render loop)
function animate() {
    requestAnimationFrame(animate);

    controls.update(); // Actualiza los controles de órbita

    renderer.render(scene, camera);
}

// 5. Manejar el redimensionamiento de la ventana
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Inicia el bucle de animación
animate();