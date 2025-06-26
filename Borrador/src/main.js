import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { PhysicsSimulator } from './PhysicsSimulator.js';
import Stats from 'three/addons/libs/stats.module.js';

let scene, renderer, stats;
let orbitControls;
let physicsSimulator;
let chassis;
let currentActiveCamera;
let orbitCamera, firstPersonCamera, thirdPersonCamera;
let activeCameraType = 'orbit';

async function setupThree() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xbfd1e5);

    orbitCamera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 10000);
    orbitCamera.position.set(20, 20, 20);

    firstPersonCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    thirdPersonCamera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);

    currentActiveCamera = orbitCamera;

    const ambient = new THREE.HemisphereLight(0x555555, 0xffffff, 2);
    scene.add(ambient);

    const light = new THREE.DirectionalLight(0xffffff, 2);
    light.position.set(0, 12.5, 12.5);
    scene.add(light);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    orbitControls = new OrbitControls(orbitCamera, renderer.domElement);
    orbitControls.target.set(0, 2, 0);
    orbitControls.update();

    const groundGeo = new THREE.PlaneGeometry(1000, 1000);
    groundGeo.rotateX(-Math.PI / 2);
    const groundMat = new THREE.MeshPhongMaterial({ color: 0x999999 });

    const ground = new THREE.Mesh(groundGeo, groundMat);
    new THREE.TextureLoader().load('maps/grid.png', (texture) => {
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

    window.addEventListener('resize', onWindowResize, false);
    onWindowResize();
}

function cargarModeloGLB(url) {
    return new Promise((resolve, reject) => {
        const loader = new GLTFLoader();
        loader.load(url, (gltf) => resolve(gltf.scene), undefined, reject);
    });
}

async function initPhysics() {
    await setupThree();

const modelo = await cargarModeloGLB('/modelos/car_model.glb');
    modelo.scale.set(0.01, 0.01, 0.01);
    modelo.position.set(0, 0, 0);
    
    modelo.traverse((child) => {
    if (child.isMesh) {
       
        child.rotation.y = Math.PI;
      
    }
    }); 
    // Ajustar la rotación si es necesario
    scene.add(modelo);

    // Pasamos el modelo cargado como chasis al simulador físico
    physicsSimulator = new PhysicsSimulator({}, {}, modelo);
    await physicsSimulator.initSimulation();

    chassis = modelo;

    // Obstáculos de ejemplo
    const geometry = new THREE.CylinderGeometry(2, 2, 10, 16);
    geometry.translate(0, 5, 0);
    const material = new THREE.MeshPhongMaterial({ color: '#666699' });
    const column = new THREE.Mesh(geometry, material);
    column.position.set(-10, 0.5, 0);
    scene.add(column);
    physicsSimulator.addRigidBody(column, 0, 0.01);

    const rampGeometry = new THREE.BoxGeometry(10, 1, 20);
    const rampMaterial = new THREE.MeshPhongMaterial({ color: 0x999999 });
    const ramp = new THREE.Mesh(rampGeometry, rampMaterial);
    ramp.position.set(0, 1, -30);
    ramp.rotation.x = Math.PI / 12;
    scene.add(ramp);
    physicsSimulator.addRigidBody(ramp);

    // Cambiar cámara con tecla 'c'
    window.addEventListener('keydown', (event) => {
        if (event.key.toLowerCase() === 'c') {
            if (activeCameraType === 'orbit') {
                activeCameraType = 'firstPerson';
                currentActiveCamera = firstPersonCamera;
                orbitControls.enabled = false;
                console.log('Cámara: Primera Persona');
            } else if (activeCameraType === 'firstPerson') {
                activeCameraType = 'thirdPerson';
                currentActiveCamera = thirdPersonCamera;
                console.log('Cámara: Tercera Persona');
            } else {
                activeCameraType = 'orbit';
                currentActiveCamera = orbitCamera;
                orbitControls.enabled = true;
                if (chassis) {
                    orbitControls.target.copy(chassis.position);
                    orbitControls.update();
                }
                console.log('Cámara: Órbita');
            }
        }
    });
}

function onWindowResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    orbitCamera.aspect = width / height;
    orbitCamera.updateProjectionMatrix();

    firstPersonCamera.aspect = width / height;
    firstPersonCamera.updateProjectionMatrix();

    thirdPersonCamera.aspect = width / height;
    thirdPersonCamera.updateProjectionMatrix();

    renderer.setSize(width, height);
}

function updateVehicleTransforms() {
    if (!physicsSimulator) return;

    const vehicleTransform = physicsSimulator.getVehicleTransform();
    if (chassis && vehicleTransform) {
        const { position: physicsPosition, quaternion: physicsQuaternion } = vehicleTransform;

        chassis.position.set(physicsPosition.x, physicsPosition.y, physicsPosition.z);
        chassis.quaternion.set(physicsQuaternion.x, physicsQuaternion.y, physicsQuaternion.z, physicsQuaternion.w);

        const carPosition = chassis.position;
        const carQuaternion = chassis.quaternion;

        const fpOffset = new THREE.Vector3(0, 3, 2);
        fpOffset.applyQuaternion(carQuaternion);
        firstPersonCamera.position.copy(carPosition).add(fpOffset);
        firstPersonCamera.quaternion.copy(carQuaternion);

        const tpOffset = new THREE.Vector3(0, 5, 10);
        tpOffset.applyQuaternion(carQuaternion);
        thirdPersonCamera.position.copy(carPosition).add(tpOffset);
        thirdPersonCamera.lookAt(carPosition);
    }
}

function animate() {
    if (!physicsSimulator) return;

    physicsSimulator.update();
    updateVehicleTransforms();

    if (activeCameraType === 'orbit' && orbitControls.enabled) {
        orbitControls.update();
    }

    renderer.render(scene, currentActiveCamera);
    stats.update();
}

async function start() {
    await initPhysics();
    renderer.setAnimationLoop(animate);
}

start();
