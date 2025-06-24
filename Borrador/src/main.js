import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { PhysicsSimulator } from './simulador_fisico.js';
import Stats from 'three/addons/libs/stats.module.js';

// 🔁 Elegí el modelo que quieras usar:
import { crearCubo } from './modelos/cubo.js';
import { crearAutoPequeño } from './modelos/crearAutoPequeño.js';

// import { crearMoto } from './modelos/moto.js';
// import { crearFerrari } from './modelos/ferrari.js';

let camera, scene, renderer, stats;
let controls;
let physicsSimulator;
let chassis;
let wheels = [];

let createVehicleVisual = crearCubo;

async function setupThree() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xbfd1e5);

    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 10000);
    camera.position.set(30, 30, 30);

    const ambient = new THREE.HemisphereLight(0x555555, 0xffffff, 2);
    scene.add(ambient);

    const light = new THREE.DirectionalLight(0xffffff, 2);
    light.position.set(0, 12.5, 12.5);
    scene.add(light);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.target = new THREE.Vector3(0, 2, 0);
    controls.update();

    // Suelo con textura
    const geometry = new THREE.PlaneGeometry(20, 20, 1, 1);
    geometry.rotateX(-Math.PI / 2);
    const material = new THREE.MeshPhongMaterial({ color: 0x999999 });

    const ground = new THREE.Mesh(geometry, material);
    new THREE.TextureLoader().load('maps/grid.png', function (texture) {
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(200, 200);
        ground.material.map = texture;
        ground.material.needsUpdate = true;
    });

    scene.add(ground);

    scene.add(new THREE.AxesHelper(5));

    stats = new Stats();
    document.body.appendChild(stats.dom);

    onWindowResize();
    window.addEventListener('resize', onWindowResize, false);
}

async function initPhysics() {
    physicsSimulator = new PhysicsSimulator();
    await physicsSimulator.initSimulation();
    createCarModel();

    // Obstáculo cilíndrico
    const columnaGeo = new THREE.CylinderGeometry(2, 2, 10, 16).translate(0, 5, 0);
    const columna = new THREE.Mesh(columnaGeo, new THREE.MeshPhongMaterial({ color: '#666699' }));
    columna.position.set(-10, 0.5, 0);
    scene.add(columna);
    physicsSimulator.addRigidBody(columna, 0, 0.01);

    // Rampa
    const rampaGeo = new THREE.BoxGeometry(10, 1, 20);
    const rampa = new THREE.Mesh(rampaGeo, new THREE.MeshPhongMaterial({ color: 0x999999 }));
    rampa.position.set(0, 1, -30);
    rampa.rotation.x = Math.PI / 12;
    scene.add(rampa);
    physicsSimulator.addRigidBody(rampa);
}

function createCarModel() {
    // Crear chasis desde el archivo modular (como cubo.js)
    chassis = createVehicleVisual(scene);

    const axesHelper = new THREE.AxesHelper(5);
    chassis.add(axesHelper);

    // Faro delantero
    const luz = new THREE.SpotLight(0xffdd99, 100);
    luz.decay = 1;
    luz.penumbra = 0.5;
    luz.position.set(0, 0, -2);
    luz.target.position.set(0, 0, -10);
    chassis.add(luz.target);
    chassis.add(luz);

    // Crear ruedas
    const ruedaGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.1, 16).rotateZ(Math.PI * 0.5);
    const ruedaMat = new THREE.MeshPhongMaterial({ color: 0x000000, wireframe: true });

    for (let i = 0; i < 4; i++) {
        const rueda = new THREE.Mesh(ruedaGeo, ruedaMat);
        chassis.add(rueda);
        rueda.position.set(10 * i, 2, 20 * i); // Posición temporal
        wheels.push(rueda);
    }
}

function updateVehicleTransforms() {
    const vt = physicsSimulator.getVehicleTransform();
    if (chassis && vt) {
        chassis.position.set(vt.position.x, vt.position.y, vt.position.z);
        chassis.quaternion.set(vt.quaternion.x, vt.quaternion.y, vt.quaternion.z, vt.quaternion.w);

        wheels.forEach((rueda, i) => {
            const wt = physicsSimulator.getWheelTransform(i);
            if (wt) {
                rueda.position.set(wt.position.x, wt.position.y, wt.position.z);
                rueda.quaternion.set(wt.quaternion.x, wt.quaternion.y, wt.quaternion.z, wt.quaternion.w);
            }
        });
    }
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    physicsSimulator.update();
    updateVehicleTransforms();

    if (controls) controls.update();

    renderer.render(scene, camera);
    stats.update();
}

function start() {
    setupThree();
    initPhysics();
    renderer.setAnimationLoop(animate);
}

start();
