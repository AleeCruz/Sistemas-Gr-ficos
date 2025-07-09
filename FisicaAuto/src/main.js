import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { PhysicsSimulator } from './PhysicsSimulator.js'; // Asegúrate que esta ruta es correcta
import Stats from 'three/addons/libs/stats.module.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'; // Importa el GLTFLoader

let camera, scene, renderer, stats;
let controls;
let physicsSimulator;
let chassisMesh; // La malla 3D de tu auto (el GLB)
let wheelMeshes = []; // Las mallas 3D de las ruedas, si el GLB las incluye separadas

async function setupThree() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xbfd1e5);

    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 10000);
    camera.position.set(30, 30, 30);
    camera.lookAt(0, 0, 0); // Asegura que la cámara mire al origen

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

    const geometry = new THREE.PlaneGeometry(1000, 1000, 1, 1);
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

    let axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);

    stats = new Stats();
    document.body.appendChild(stats.dom);

    onWindowResize();
    window.addEventListener('resize', onWindowResize, false);
}

async function initPhysics() {
    // Parámetros del vehículo. Asegúrate que `initialPosition` sea consistente
    // con donde quieres que aparezca el modelo 3D.
    const vehicleParams = {
        wheelSeparation: 2.5,
        axesSeparation: 3,
        wheelRadius: 0.6,
        wheelWidth: 0.4,
        suspensionRestLength: 0.8,
        initialPosition: new THREE.Vector3(0, 3, 0), // Elevado para evitar que caiga a través del suelo
        initialYRotation: 0,
        steeringReaction: 0.1,
        maxSteeringAngle: Math.PI / 16,
        mass: 20,
        accelerateForce: { min: -15, max: 40, step: 2 },
        brakeForce: { min: 0, max: 1, step: 0.05 },
    };


    
    // Parámetros del suelo. Deben coincidir con tu plano visual.
    const groundParams = {
        width: 1000,
        height: 0.1,
        length: 1000,
    };

    physicsSimulator = new PhysicsSimulator(vehicleParams, groundParams);
    await physicsSimulator.initSimulation();

    // Ahora creamos y enlazamos el modelo de auto GLB
    await createCarModel(); // Llamamos y esperamos a que el modelo GLB se cargue

    // --- Obstáculos ---
    // Cylinder obstacle
    const cylinderGeometry = new THREE.CylinderGeometry(2, 2, 16, 16);
    cylinderGeometry.translate(0, 0, 0); // Mueve la geometría para que el pivote esté en la base
    const cylinderMaterial = new THREE.MeshPhongMaterial({ color: '#666699' });
    const column = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
    column.position.set(-10, 5, 0); // Posición final del cilindro, con y=5 para su mitad de altura
    scene.add(column);
    physicsSimulator.addRigidBody(column, 20, 0.8); // Masa 100 para que sea un obstáculo pesado

    // Ramp obstacle (BoxGeometry)
    const rampGeometry = new THREE.BoxGeometry(10, 1, 20);
    const rampMaterial = new THREE.MeshPhongMaterial({ color: 0x999999 });
    const ramp = new THREE.Mesh(rampGeometry, rampMaterial);
    ramp.position.set(0, 0.5, -30); // Posición inicial para que la base toque el suelo
    ramp.rotation.x = Math.PI / 12; // Inclinación
    scene.add(ramp);
    physicsSimulator.addRigidBody(ramp, 0); // Masa 0 para que sea estática
}

async function createCarModel() {
    const loader = new GLTFLoader();

    try {
        const gltf = await loader.loadAsync('/modelos/car_model.glb');

        // 🔍 Creamos un contenedor para controlar posición y rotación fácilmente
        const root = new THREE.Group();

        // 📦 Este es el modelo completo del GLB
        const model = gltf.scene;

        // ✅ Escalamos el modelo (ajustalo si es muy chico/grande)
        model.scale.set(0.005, 0.005, 0.005);

        // 🔁 Rotamos si es necesario (180° en Y para mirar hacia -Z)
        model.rotation.y = Math.PI;

        // 🧠 Activamos sombras (opcional, pero recomendado si usás luces reales)
        model.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;

                // 🪟 Arreglamos materiales de ventanas si son transparentes
                if (child.material && child.material.opacity < 1) {
                    child.material.transparent = true;
                    child.material.depthWrite = false;
                    child.material.opacity = Math.max(child.material.opacity, 0.5);
                }
            }
        });

        // 🎯 Añadimos el modelo al contenedor
        root.add(model);

        // 📌 Ajustamos el offset si el modelo se ve flotando o hundido
        root.position.y = -0.5; // Este valor puede variar según tu GLB

        // 🧭 Helper para ver la orientación del auto
        const axes = new THREE.AxesHelper(2);
        root.add(axes);

        // ➕ Añadimos el modelo a la escena
        scene.add(root);

        // 💾 Guardamos referencia para sincronizar con la física
        chassisMesh = root;

        // 🛞 OPCIONAL: Si querés luego controlar las ruedas, buscás los objetos así:
        /*
        wheelMeshes[0] = model.getObjectByName('WheelFL'); // delantero izquierdo
        wheelMeshes[1] = model.getObjectByName('WheelFR'); // delantero derecho
        wheelMeshes[2] = model.getObjectByName('WheelRL'); // trasero izquierdo
        wheelMeshes[3] = model.getObjectByName('WheelRR'); // trasero derecho
        */

        console.log("Modelo cargado correctamente");

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
    // Sincroniza la posición y rotación del modelo GLB con el cuerpo físico del chasis
    const vehicleTransform = physicsSimulator.getVehicleTransform();
    if (chassisMesh && vehicleTransform) {
        // Aplica la posición y rotación del cuerpo físico al chasis visual
        // ¡Importante! Aquí debes añadir el offset visual si lo usaste en createCarModel
        chassisMesh.position.set(vehicleTransform.position.x, vehicleTransform.position.y, vehicleTransform.position.z);
        chassisMesh.quaternion.set(vehicleTransform.quaternion.x, vehicleTransform.quaternion.y, vehicleTransform.quaternion.z, vehicleTransform.quaternion.w);

        // Después de aplicar la posición y rotación del chasis,
        // ajusta de nuevo el offset si tu modelo GLB lo necesita.
        // Esto es necesario porque el `position` de Three.js es absoluto para el objeto,
        // pero tu offset es relativo al "chasis" interno de Rapier.
        chassisMesh.position.y += -0.5; // Ajusta este offset según lo que uses en createCarModel

        // Actualiza las posiciones y rotaciones de las mallas de las ruedas (si las tienes separadas)
        wheelMeshes.forEach((wheel, index) => {
            const wheelTransform = physicsSimulator.getWheelTransform(index);
            if (wheelTransform) {
                // Las posiciones de las ruedas en RapierPhysics son relativas al chasis
                // Si wheel es hijo de chassisMesh, esto es correcto
                wheel.position.set(wheelTransform.position.x, wheelTransform.position.y, wheelTransform.position.z);
                wheel.quaternion.set(wheelTransform.quaternion.x, wheelTransform.quaternion.y, wheelTransform.quaternion.z, wheelTransform.quaternion.w);
            }
        });
    }
}

function animate() {
    // Obtiene el tiempo delta para una simulación de física consistente
    const deltaTime = 1 / 60; // Asumimos un paso fijo de 60 FPS, puedes usar THREE.Clock para precisión

    physicsSimulator.update(deltaTime); // Actualiza el mundo de la física con el tiempo delta
    updateVehicleTransforms(); // Sincroniza las mallas visuales con la física

    if (controls) controls.update(); // Actualiza los controles de órbita

    renderer.render(scene, camera);
    stats.update(); // Actualiza los Stats (FPS)
}

function start() {
    setupThree().then(() => { // Asegura que setupThree se complete antes de initPhysics
        initPhysics().then(() => {
            // Una vez que Three.js y la física están listas, inicia el bucle de animación
            renderer.setAnimationLoop(animate); // Usa setAnimationLoop para el bucle
        }).catch(error => {
            console.error("Error al inicializar la física:", error);
        });
    }).catch(error => {
        console.error("Error al configurar Three.js:", error);
    });
}

start();