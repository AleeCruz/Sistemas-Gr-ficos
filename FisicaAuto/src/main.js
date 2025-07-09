import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { PhysicsSimulator } from './PhysicsSimulator.js';
import Stats from 'three/addons/libs/stats.module.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RapierHelper } from 'three/addons/helpers/RapierHelper.js';

let camera, scene, renderer, stats;
let controls;
let physicsSimulator;
let chassisMesh;
let wheelMeshes = [];
let groundMesh;
let physicsHelper;

const CAR_MODEL_Y_OFFSET = 0;

async function setupThree() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xbfd1e5);

    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 10000);
    camera.position.set(30, 30, 30);
    camera.lookAt(0, 2, 0);

    const ambient = new THREE.HemisphereLight(0x555555, 0xffffff, 2);
    scene.add(ambient);

    const light = new THREE.DirectionalLight(0xffffff, 2);
    light.position.set(0, 12.5, 12.5);
    light.castShadow = true;
    scene.add(light);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    document.body.appendChild(renderer.domElement);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 2, 0);
    controls.update();

    const groundGeometry = new THREE.PlaneGeometry(20, 20, 1, 1);
    groundGeometry.rotateX(-Math.PI / 2);
    const groundMaterial = new THREE.MeshPhongMaterial({ color: 0x999999 });

    groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
    groundMesh.receiveShadow = true;
    scene.add(groundMesh);

    new THREE.TextureLoader().load('maps/grid.png', function (texture) {
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(200, 200);
        groundMesh.material.map = texture;
        groundMesh.material.needsUpdate = true;
    });

    scene.add(new THREE.AxesHelper(5));

    stats = new Stats();
    document.body.appendChild(stats.dom);

    window.addEventListener('resize', onWindowResize, false);
    onWindowResize();
}

async function initPhysics() {
    const vehicleParams = {
        wheelSeparation: 2.0,
        axesSeparation: 3,
        wheelRadius: 0.6,
        wheelWidth: 0.4,
        suspensionRestLength: 0.8,
        initialPosition: new THREE.Vector3(0, 2, 0),
        initialYRotation: 0,
        steeringReaction: 0.1,
        maxSteeringAngle: Math.PI / 16,
        mass: 20,
        accelerateForce: { min: -15, max: 40, step: 2 },
        brakeForce: { min: 0, max: 1, step: 0.05 },
    };

    const groundParams = {
        width: 1000,
        height: 0.1,
        length: 1000,
    };

    physicsSimulator = new PhysicsSimulator(vehicleParams, groundParams);
    await physicsSimulator.initSimulation();

    // Crear helper para visualizar colisionadores físicos
    physicsHelper = new RapierHelper(scene, physicsSimulator.physics.world);
    scene.add(physicsHelper);

    await createCarModel();

    const cylinder = new THREE.Mesh(
        new THREE.CylinderGeometry(2, 2, 16, 16).translate(0, 0, 0),
        new THREE.MeshPhongMaterial({ color: '#666699' })
    );
    cylinder.position.set(-10, 0, 0);
    scene.add(cylinder);
    physicsSimulator.addRigidBody(cylinder, 200, 0.5);

    const ramp = new THREE.Mesh(
        new THREE.BoxGeometry(10, 1, 20).translate(0, 0.5, 0),
        new THREE.MeshPhongMaterial({ color: 0x999999 })
    );
    ramp.position.set(0, 0, -30);
    ramp.rotation.x = Math.PI / 12;
    scene.add(ramp);
    physicsSimulator.addRigidBody(ramp, 0, 0.5);
}

async function createCarModel() {
    const loader = new GLTFLoader();
    try {
        const gltf = await loader.loadAsync('/modelos/car_model.glb');
        const model = gltf.scene;

        model.scale.set(0.005, 0.005, 0.005);
        model.rotation.y = Math.PI;

        model.traverse(child => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                if (child.material && child.material.opacity < 1) {
                    child.material.transparent = true;
                    child.material.depthWrite = false;
                    child.material.opacity = Math.max(child.material.opacity, 0.5);
                }
            }
        });

        chassisMesh = new THREE.Group();
        model.position.y = CAR_MODEL_Y_OFFSET;
        chassisMesh.add(model);
        chassisMesh.add(new THREE.AxesHelper(2));
        scene.add(chassisMesh);

        console.log("Modelo de coche GLB cargado.");
    } catch (error) {
        console.error("Error al cargar el modelo GLB:", error);
    }
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function updateVehicleTransforms() {
    const vehicleTransform = physicsSimulator.getVehicleTransform();
    if (chassisMesh && vehicleTransform) {
        chassisMesh.position.copy(vehicleTransform.position);
        chassisMesh.quaternion.copy(vehicleTransform.quaternion);
    }

    wheelMeshes.forEach((wheel, index) => {
        const wheelTransform = physicsSimulator.getWheelTransform(index);
        if (wheel && wheelTransform) {
            wheel.position.copy(wheelTransform.position);
            wheel.quaternion.copy(wheelTransform.quaternion);
        }
    });
}

function animate() {
    const deltaTime = 1 / 60;
    if (physicsSimulator && physicsSimulator.initComplete) {
        physicsSimulator.update(deltaTime);
        updateVehicleTransforms();
    }

    //if (physicsHelper) physicsHelper.update();
    controls.update();
    renderer.render(scene, camera);
    stats.update();
}

async function start() {
    try {
        await setupThree();
        await initPhysics();
        renderer.setAnimationLoop(animate);
    } catch (error) {
        console.error("Error fatal al iniciar la aplicación:", error);
    }
}

start();
