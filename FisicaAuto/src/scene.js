// src/graphics/scene.js
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { crearCurva } from './curva.js';
import { createTunnel } from './tunel.js';
import { crearPuenteAutopista } from './puente.js';
import { crearLamparaCalle } from './crearLamparaCalle.js';
import { TGALoader } from 'three/addons/loaders/TGALoader.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB);
scene.fog = new THREE.Fog(0x87CEEB, 60, 120);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 10, 10);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

const axesHelper = new THREE.AxesHelper(7);
scene.add(axesHelper);

const gridSize = 30;
const gridDivision = 30;
const planeGeometry = new THREE.PlaneGeometry(gridSize, gridDivision);
const textureLoader = new THREE.TextureLoader();
const planeTexture = textureLoader.load('textures/asfalto3.png');

const planeMaterial = new THREE.MeshStandardMaterial({
    map: planeTexture,
    color: 0xcccccc,
    side: THREE.DoubleSide,
    roughness: 0.8,
    metalness: 0.1
});

const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -Math.PI / 2;
scene.add(plane);

const grid = new THREE.GridHelper(gridSize, gridDivision, 0x333333, 0x333333);

const curva = crearCurva();

const tunel = createTunnel();
const tTunel = 0.90;
const puntoTunel = curva.getPointAt(tTunel);
const tangenteTunel = curva.getTangentAt(tTunel);
tunel.position.copy(puntoTunel);
tunel.lookAt(puntoTunel.clone().add(tangenteTunel));
tunel.scale.set(0.1, 0.1, -0.09);
scene.add(tunel);

const puenteBase = crearPuenteAutopista();
puenteBase.scale.set(0.007, 0.02, 0.01);
const posicionesPuente = [0.6, 0.7, 0.8];

posicionesPuente.forEach(tPos => {
    const punto = curva.getPointAt(tPos);
    const tangente = curva.getTangentAt(tPos);
    const puenteClone = puenteBase.clone();
    puenteClone.position.copy(punto);
    puenteClone.lookAt(punto.clone().add(tangente));
    scene.add(puenteClone);
});

const lamparaBase = crearLamparaCalle();
const cantidadLamparas = 4;
const distanciaAlCostado = 0.6;

for (let i = 0; i < cantidadLamparas; i++) {
    const t = i / cantidadLamparas;
    const pos = curva.getPointAt(t);
    const tangente = curva.getTangentAt(t);
    const normal = tangente.clone().cross(new THREE.Vector3(0, 1, 0)).normalize();

    const lamparaDerecha = lamparaBase.clone();
    lamparaDerecha.position.copy(pos.clone().add(normal.clone().multiplyScalar(distanciaAlCostado)));
    lamparaDerecha.scale.set(0.3, 0.3, 0.3);
    scene.add(lamparaDerecha);

    const lamparaIzquierda = lamparaBase.clone();
    lamparaIzquierda.position.copy(pos.clone().add(normal.clone().multiplyScalar(-distanciaAlCostado)));
    lamparaIzquierda.scale.set(0.3, 0.3, 0.3);
    scene.add(lamparaIzquierda);
}

let materialArray = [];
const tgaLoader = new TGALoader();
let texture_ft = tgaLoader.load("assets/skybox/stormydays_ft.tga");
let texture_bk = tgaLoader.load("assets/skybox/stormydays_bk.tga");
let texture_up = tgaLoader.load("assets/skybox/stormydays_up.tga");
let texture_dn = tgaLoader.load("assets/skybox/stormydays_dn.tga");
let texture_rt = tgaLoader.load("assets/skybox/stormydays_rt.tga");
let texture_lf = tgaLoader.load("assets/skybox/stormydays_lf.tga");

materialArray.push(new THREE.MeshBasicMaterial({ map: texture_ft }));
materialArray.push(new THREE.MeshBasicMaterial({ map: texture_bk }));
materialArray.push(new THREE.MeshBasicMaterial({ map: texture_up }));
materialArray.push(new THREE.MeshBasicMaterial({ map: texture_dn }));
materialArray.push(new THREE.MeshBasicMaterial({ map: texture_rt }));
materialArray.push(new THREE.MeshBasicMaterial({ map: texture_lf }));

for (let i = 0; i < 6; i++) {
    materialArray[i].side = THREE.BackSide;
}

let skyboxSize = 30;
let skyboxGeo = new THREE.BoxGeometry(skyboxSize, skyboxSize, skyboxSize);
let skybox = new THREE.Mesh(skyboxGeo, materialArray);
skybox.position.set(0, 0, 0);
scene.add(skybox);

export {
    scene, camera, renderer, controls,
    axesHelper, planeGeometry, planeMaterial,
    plane, grid, gridSize, gridDivision
};
