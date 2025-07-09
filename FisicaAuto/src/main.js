import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { PhysicsSimulator } from './PhysicsSimulator.js';
import Stats from 'three/addons/libs/stats.module.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

let camera, scene, renderer, stats;
let controls;
let physicsSimulator;
let chassisMesh; // El grupo que contiene el modelo GLB del auto
let wheelMeshes = []; // Array para las mallas 3D de las ruedas
let groundMesh; // Referencia a la malla del suelo visual

// Offset visual para el modelo del coche, si su pivote no coincide con el chasis físico
// Ajusta este valor según la geometría de tu modelo GLB y el chasis de Rapier
const CAR_MODEL_Y_OFFSET = -0.5; // Ejemplo: si el modelo necesita moverse 0.5 unidades hacia abajo

async function setupThree() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xbfd1e5);

    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 10000);
    camera.position.set(30, 30, 30);
    camera.lookAt(0, 2, 0); // Ajusta para mirar al centro del auto

    const ambient = new THREE.HemisphereLight(0x555555, 0xffffff, 2);
    scene.add(ambient);

    const light = new THREE.DirectionalLight(0xffffff, 2);
    light.position.set(0, 12.5, 12.5);
    light.castShadow = true; // Activa las sombras para esta luz
    light.shadow.mapSize.width = 1024; // Resolución del mapa de sombras
    light.shadow.mapSize.height = 1024;
    light.shadow.camera.near = 0.5;
    light.shadow.camera.far = 50;
    scene.add(light);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true; // Habilita los mapas de sombras en el renderizador
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Tipo de mapa de sombras

    document.body.appendChild(renderer.domElement);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.target = new THREE.Vector3(0, 2, 0); // Centro de atención de la cámara
    controls.update();

    // Crear el suelo visual, usando los parámetros de PhysicsSimulator
    // Esto asegura que el suelo visual coincida con el suelo físico
    const groundGeometry = new THREE.PlaneGeometry(1000, 1000, 1, 1); // Ancho y largo del suelo
    groundGeometry.rotateX(-Math.PI / 2);
    const groundMaterial = new THREE.MeshPhongMaterial({ color: 0x999999 });

    groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
    groundMesh.receiveShadow = true; // El suelo puede recibir sombras
    scene.add(groundMesh);

    new THREE.TextureLoader().load('maps/grid.png', function (texture) {
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(200, 200); // Ajusta la repetición de la textura
        groundMesh.material.map = texture;
        groundMesh.material.needsUpdate = true;
    });

    let axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);

    stats = new Stats();
    document.body.appendChild(stats.dom);

    onWindowResize();
    window.addEventListener('resize', onWindowResize, false);
}

async function initPhysics() {
    const vehicleParams = {
        wheelSeparation: 2.5,
        axesSeparation: 3,
        wheelRadius: 0.6,
        wheelWidth: 0.4,
        suspensionRestLength: 0.8,
        initialPosition: new THREE.Vector3(0, 4, 0), // Posición de inicio del chasis físico
        initialYRotation: 0,
        steeringReaction: 0.1,
        maxSteeringAngle: Math.PI / 16,
        mass: 20,
        accelerateForce: { min: -15, max: 40, step: 2 },
        brakeForce: { min: 0, max: 1, step: 0.05 },
    };

    const groundParams = {
        width: 1000,
        height: 0.1, // Altura del cuerpo físico (puede ser pequeña si el suelo visual ya está en Y=0)
        length: 1000,
    };

    physicsSimulator = new PhysicsSimulator(vehicleParams, groundParams);
    await physicsSimulator.initSimulation();

    await createCarModel();

    // --- Obstáculos ---
    // Cilindro
    const cylinderRadius = 2;
    const cylinderHeight = 16;
    const cylinderGeometry = new THREE.CylinderGeometry(cylinderRadius, cylinderRadius, cylinderHeight, 16);
    // Traslada la geometría para que su base esté en Y=0 (su centro estará en Y=height/2)
    cylinderGeometry.translate(0, cylinderHeight / 2, 0);
    const cylinderMaterial = new THREE.MeshPhongMaterial({ color: '#666699' });
    const column = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
    column.position.set(-10, 0, 0); // La base del cilindro estará en Y=0
    column.castShadow = true;
    column.receiveShadow = true;
    scene.add(column);
    physicsSimulator.addRigidBody(column, 200, 0.5); // Masa y restitución

    // Rampa (BoxGeometry)
    const rampWidth = 10;
    const rampHeight = 1;
    const rampLength = 20;
    const rampGeometry = new THREE.BoxGeometry(rampWidth, rampHeight, rampLength);
    // Traslada la geometría para que su base esté en Y=0 (su centro estará en Y=height/2)
    rampGeometry.translate(0, rampHeight / 2, 0);
    const rampMaterial = new THREE.MeshPhongMaterial({ color: 0x999999 });
    const ramp = new THREE.Mesh(rampGeometry, rampMaterial);
    ramp.position.set(0, 0, -30); // La base de la rampa estará en Y=0
    ramp.rotation.x = Math.PI / 12; // Inclinación
    ramp.castShadow = true;
    ramp.receiveShadow = true;
    scene.add(ramp);
    physicsSimulator.addRigidBody(ramp, 0, 0.5); // Masa 0 para que sea estática
}

async function createCarModel() {
    const loader = new GLTFLoader();
    try {
        const gltf = await loader.loadAsync('/modelos/car_model.glb');

        const model = gltf.scene;

        // Escalamos el modelo (ajustalo si es muy chico/grande)
        // La escala debe coincidir con el tamaño de tu chasis físico (2x0.1x4)
        model.scale.set(0.005, 0.005, 0.005); // Ajusta esto para que el modelo se vea bien con el chasis de Rapier

        // Rotamos si es necesario (180° en Y para que el frente del auto mire hacia -Z)
        model.rotation.y = Math.PI;

        // Habilita sombras para todas las mallas del modelo
        model.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;

                // Ajustes para materiales transparentes (ej. ventanas)
                if (child.material && child.material.opacity < 1) {
                    child.material.transparent = true;
                    child.material.depthWrite = false; // Importante para transparencias
                    child.material.opacity = Math.max(child.material.opacity, 0.5); // Evita que sean demasiado invisibles
                }
            }
        });

        // Creamos un grupo (THREE.Group) que contendrá el modelo GLB
        // Este grupo será el que sincronicemos con el chasis físico
        // y le aplicaremos el offset visual si es necesario.
        chassisMesh = new THREE.Group();
        chassisMesh.add(model);
        chassisMesh.position.y = CAR_MODEL_Y_OFFSET; // Aplica el offset visual una sola vez

        // Helper para ver la orientación del auto (opcional)
        const axes = new THREE.AxesHelper(2);
        chassisMesh.add(axes);

        scene.add(chassisMesh);

        // Opcional: Buscar los meshes de las ruedas dentro del modelo GLB
        // Si tu modelo tiene las ruedas como objetos separados y quieres sincronizarlas individualmente
        // Asegúrate que los nombres 'Wheel_FL', etc. coincidan con los nombres reales en tu GLB
        /*
        wheelMeshes[0] = model.getObjectByName('Wheel_RL'); // Trasera izquierda
        wheelMeshes[1] = model.getObjectByName('Wheel_RR'); // Trasera derecha
        wheelMeshes[2] = model.getObjectByName('Wheel_FL'); // Delantera izquierda
        wheelMeshes[3] = model.getObjectByName('Wheel_FR'); // Delantera derecha

        if (wheelMeshes.some(mesh => !mesh)) {
            console.warn("No se encontraron todas las mallas de las ruedas en el modelo GLB. Sincronización visual de ruedas limitada.");
            // Si no encuentras las mallas de las ruedas, puedes crear cilindros placeholders aquí
            // o simplemente omitir la actualización de ruedas individuales.
        }
        */

        console.log("Modelo de coche GLB cargado y listo.");

    } catch (error) {
        console.error('Error al cargar el modelo GLB:', error);
    }
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function updateVehicleTransforms() {
    // Sincroniza la posición y rotación del grupo del modelo GLB con el cuerpo físico del chasis
    const vehicleTransform = physicsSimulator.getVehicleTransform();
    if (chassisMesh && vehicleTransform) {
        // Aplica directamente la posición y rotación del cuerpo físico al grupo (chassisMesh)
        chassisMesh.position.copy(vehicleTransform.position);
        chassisMesh.quaternion.copy(vehicleTransform.quaternion);

        // Nota: El CAR_MODEL_Y_OFFSET ya se aplicó una sola vez al `chassisMesh` al crearlo.
        // NO lo apliques de nuevo aquí, ya que la posición del chasis físico ya está calculada.
    }

    // Actualiza las posiciones y rotaciones de las mallas de las ruedas (si las tienes separadas)
    // Las posiciones de las ruedas en Rapier son relativas al chasis.
    // Si tus mallas de ruedas son *hijos* del chassisMesh (el grupo que contiene el GLB),
    // entonces simplemente aplica sus transformaciones relativas directamente.
    wheelMeshes.forEach((wheel, index) => {
        const wheelTransform = physicsSimulator.getWheelTransform(index);
        if (wheel && wheelTransform) {
            wheel.position.copy(wheelTransform.position);
            wheel.quaternion.copy(wheelTransform.quaternion);

            // Si tus mallas de ruedas no están orientadas correctamente (ej. cilindros mirando al lado),
            // podrías necesitar una rotación adicional aquí.
            // Ejemplo para un cilindro que es una rueda:
            // wheel.rotation.z += Math.PI / 2;
        }
    });
}

function animate() {
    // Calcula el tiempo transcurrido desde el último frame para una simulación precisa
    const deltaTime = 1 / 60; // Puedes usar THREE.Clock() para un deltaTime más preciso

    if (physicsSimulator && physicsSimulator.initComplete) {
        physicsSimulator.update(deltaTime); // Actualiza el mundo de la física
        updateVehicleTransforms(); // Sincroniza las mallas visuales con la física
    }

    controls.update(); // Actualiza los controles de órbita
    renderer.render(scene, camera);
    stats.update(); // Actualiza el contador de FPS
}

// Inicia todo
start();

async function start() {
    try {
        await setupThree();
        await initPhysics();
        // Una vez que Three.js y la física están listas, inicia el bucle de animación
        renderer.setAnimationLoop(animate);
    } catch (error) {
        console.error("Error fatal al iniciar la aplicación:", error);
    }
}