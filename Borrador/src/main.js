import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { PhysicsSimulator } from './PhysicsSimulator.js';
import Stats from 'three/addons/libs/stats.module.js';

let camera, scene, renderer, stats;
let orbitControls; // Renombrado para mayor claridad
let physicsSimulator;
let chassis;
let wheels = [];

// --- Variables de estado de la cámara ---
let currentActiveCamera; // La cámara actualmente activa (para el renderizado)
let orbitCamera;         // La cámara inicial de órbita
let firstPersonCamera;   // La cámara en primera persona
let thirdPersonCamera;   // La cámara en tercera persona
let activeCameraType = 'orbit'; // 'orbit', 'firstPerson', 'thirdPerson'

async function setupThree() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xbfd1e5);

    // Cámara de órbita (la principal que usaremos al inicio)
    orbitCamera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 10000);
    orbitCamera.position.set(20, 20, 20);

    // Cámara en primera persona
    firstPersonCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    // Su posición y rotación se actualizarán con el coche

    // Cámara en tercera persona
    thirdPersonCamera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    // Su posición y rotación se actualizarán con el coche

    // Establecemos la cámara activa inicial
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
    
    // Controles de órbita asociados a la cámara de órbita
    orbitControls = new OrbitControls(orbitCamera, renderer.domElement);
    orbitControls.target.set(0, 2, 0); // Apunta a una posición inicial razonable
    orbitControls.update();

    const geometry = new THREE.PlaneGeometry(1000, 1000, 1, 1);
    geometry.rotateX(-Math.PI / 2);
    const material = new THREE.MeshPhongMaterial({ color: 0x999999 });

    const ground = new THREE.Mesh(geometry, material);

    new THREE.TextureLoader().load( 'maps/grid.png', function ( texture ) {
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set( 200, 200 );
        ground.material.map = texture;
        ground.material.needsUpdate = true;
    } );
    
    scene.add(ground);

    let axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);

    stats = new Stats();
    document.body.appendChild(stats.dom);

    // Configura el manejador de redimensionamiento
    window.addEventListener('resize', onWindowResize, false);
    onWindowResize(); // Llama una vez para establecer el tamaño inicial
}

async function initPhysics() {
    physicsSimulator = new PhysicsSimulator();
    await physicsSimulator.initSimulation();

    createCarModel();

    // cylinder obstacle
    const geometry = new THREE.CylinderGeometry(2, 2, 10, 16);
    geometry.translate(0, 5, 0);
    const material = new THREE.MeshPhongMaterial({color:'#666699'} );
    const column = new THREE.Mesh(geometry, material);
    column.position.set(-10, 0.5, 0);

    scene.add(column);
    physicsSimulator.addRigidBody(column, 0, 0.01);
    
    // ramp obstacle (should be a BoxGeometry)
    const rampGeometry = new THREE.BoxGeometry(10, 1, 20);    
    const rampMaterial = new THREE.MeshPhongMaterial({ color: 0x999999 });
    const ramp = new THREE.Mesh(rampGeometry, rampMaterial );
    ramp.position.set(0, 1, -30 );
    ramp.rotation.x = Math.PI / 12;
    scene.add(ramp);
   
    physicsSimulator.addRigidBody(ramp);

    // --- Manejador de eventos de teclado para el cambio de cámara ---
    window.addEventListener('keydown', (event) => {
        if (event.key === 'c' || event.key === 'C') { // Tecla 'c' para cambiar de cámara
            if (activeCameraType === 'orbit') {
                activeCameraType = 'firstPerson';
                currentActiveCamera = firstPersonCamera;
                if (orbitControls) orbitControls.enabled = false; // Deshabilitar controles de órbita
                console.log('Cámara: Primera Persona');
            } else if (activeCameraType === 'firstPerson') {
                activeCameraType = 'thirdPerson';
                currentActiveCamera = thirdPersonCamera;
                console.log('Cámara: Tercera Persona');
            } else if (activeCameraType === 'thirdPerson') {
                activeCameraType = 'orbit';
                currentActiveCamera = orbitCamera; // Volver a la cámara de órbita
                if (orbitControls) {
                    orbitControls.enabled = true;
                    // Opcional: Reenfocar OrbitControls en el coche al volver
                    if (chassis) {
                        orbitControls.target.copy(chassis.position);
                        orbitControls.update();
                    }
                }
                console.log('Cámara: Órbita');
            }
        }
    });
}

function createCarModel() {
    // chasis (cuerpo visual del auto)
    const geometry = new THREE.BoxGeometry(2, 1, 4);
    const material = new THREE.MeshPhongMaterial({ color: 0xff0000 });
    chassis = new THREE.Mesh(geometry, material);   
    scene.add(chassis);

    // Ejes de ayuda para el chasis
    let axesHelper = new THREE.AxesHelper(5);
    chassis.add(axesHelper);

    // Foco en la parte delantera del coche
    const spotLight = new THREE.SpotLight(0xffDD99, 100);    
    spotLight.decay = 1;
    spotLight.penumbra = 0.5;
    spotLight.position.set(0, 0, -2); // Posición relativa al chasis
    spotLight.target.position.set(0, 0, -10); // Hacia adelante
    chassis.add(spotLight.target);
    chassis.add(spotLight);  

    // Ruedas (mallas visuales)
    const wheelGeometry = new THREE.CylinderGeometry(0.6, 0.6, 0.4, 16);
    wheelGeometry.rotateZ(Math.PI * 0.5); // Rotar para que la rueda "mire" hacia afuera
    const wheelMaterial = new THREE.MeshPhongMaterial({ color: 0x000000, wireframe: true });

    // En tu PhysicsSimulator, las ruedas están en:
    // { x: -wheelSeparation / 2, y: 0, z: -axesSeparation/2 }, (front-left)
    // { x: wheelSeparation / 2, y: 0, z: -axesSeparation/2}, (front-right)
    // { x: -wheelSeparation / 2, y: 0, z: axesSeparation/2}, (rear-left)
    // { x: wheelSeparation / 2, y: 0, z: axesSeparation/2}, (rear-right)
    // Estas posiciones serán usadas para colocar las mallas visuales.
    for (let i = 0; i < 4; i++) {
        const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);                
        chassis.add(wheel); // Añadir las ruedas como hijos del chasis
        wheels.push(wheel);
    };
}

function onWindowResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    // Actualizar todas las cámaras
    orbitCamera.aspect = width / height;
    orbitCamera.updateProjectionMatrix();

    firstPersonCamera.aspect = width / height;
    firstPersonCamera.updateProjectionMatrix();

    thirdPersonCamera.aspect = width / height;
    thirdPersonCamera.updateProjectionMatrix();

    renderer.setSize(width, height);
}

function updateVehicleTransforms() {
    const vehicleTransform = physicsSimulator.getVehicleTransform();
    if (chassis && vehicleTransform) {
        const { position: physicsPosition, quaternion: physicsQuaternion } = vehicleTransform;
        
        // Actualizar la posición y rotación del chasis visual
        chassis.position.set(physicsPosition.x, physicsPosition.y, physicsPosition.z);
        chassis.quaternion.set(physicsQuaternion.x, physicsQuaternion.y, physicsQuaternion.z, physicsQuaternion.w); 
        
        // Actualizar la posición y rotación de las mallas de las ruedas
        wheels.forEach((wheelMesh, index) => {
            const wheelTransform = physicsSimulator.getWheelTransform(index);
            if (wheelTransform) {
                const { position: wheelPhysicsPos, quaternion: wheelPhysicsQuat } = wheelTransform;
                // Las posiciones de las ruedas del simulador son relativas al chasis
                // La malla de la rueda ya es hija del chasis, así que solo usamos la posición relativa directamente
                wheelMesh.position.set(wheelPhysicsPos.x, wheelPhysicsPos.y, wheelPhysicsPos.z);
                wheelMesh.quaternion.set(wheelPhysicsQuat.x, wheelPhysicsQuat.y, wheelPhysicsQuat.z, wheelPhysicsQuat.w);
            }
        });

        // --- Lógica de actualización de cámaras dinámicas ---
        const carPosition = chassis.position;
        const carQuaternion = chassis.quaternion;

        // --- Cámara en primera persona ---
        // Offset (0.1 arriba, 0.8 adelante) relativo al chasis, luego transformado por la rotación del coche
        const fpOffset = new THREE.Vector3(0, 3,2); 
        fpOffset.applyQuaternion(carQuaternion);
        firstPersonCamera.position.copy(carPosition).add(fpOffset);
        firstPersonCamera.quaternion.copy(carQuaternion); // La cámara mira en la misma dirección que el coche

        // --- Cámara en tercera persona ---
        // Offset (5 arriba, 10 atrás) relativo al chasis, luego transformado
        const tpOffset = new THREE.Vector3(0, 5, 10); // Ajusta la altura y la distancia de seguimiento
        tpOffset.applyQuaternion(carQuaternion);
        thirdPersonCamera.position.copy(carPosition).add(tpOffset);
        thirdPersonCamera.lookAt(carPosition); // La cámara siempre mira al centro del coche
    }
}

function animate() {
    physicsSimulator.update();
    updateVehicleTransforms();

    // Solo actualizamos los controles de órbita si esa es la cámara activa
    if (activeCameraType === 'orbit' && orbitControls.enabled) {
        orbitControls.update();
    }
    // Para las cámaras de primera y tercera persona, su posición y rotación se actualizan directamente en `updateVehicleTransforms`

    renderer.render(scene, currentActiveCamera); // Renderiza la escena con la cámara actualmente activa
    stats.update();
}

function start() {
    setupThree();
    initPhysics();
    renderer.setAnimationLoop(animate);
}

start();