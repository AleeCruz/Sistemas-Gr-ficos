import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
const renderer = new THREE.WebGLRenderer();
const controls = new OrbitControls(camera, renderer.domElement);
const axisHelper = new THREE.AxesHelper( 5 );
scene.add( axisHelper );
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

// Cambiar el color de fondo
renderer.setClearColor(0x87CEEB, 1); // Color de fondo azul claro

const ambientLight = new THREE.AmbientLight(0xffffff, 1.7); // luz suave
scene.add(ambientLight);
// Luz direccional
const directionalLight = new THREE.DirectionalLight(0xffffff, 5.8); // luz principal
directionalLight.position.set(10, 10, 10);
scene.add(directionalLight);


// Crear el lago usando dos circunferencias
function crearLago(x, z) {
        // Círculo exterior (agua más clara)
        const lagoExteriorGeometry = new THREE.CircleGeometry(3, 64); // radio, segmentos
        const lagoExteriorMaterial = new THREE.MeshPhongMaterial({ color: 0x87CEFA, side: THREE.DoubleSide });
        const lagoExterior = new THREE.Mesh(lagoExteriorGeometry, lagoExteriorMaterial);
        lagoExterior.rotation.x = -Math.PI / 2;
        lagoExterior.position.set(x, 0.01, z); // un poco por encima del suelo
        scene.add(lagoExterior);
    
        // Círculo interior (agua más oscura)
        const lagoInteriorGeometry = new THREE.CircleGeometry(2, 64);
        const lagoInteriorMaterial = new THREE.MeshPhongMaterial({ color: 0x4682B4, side: THREE.DoubleSide });
        const lagoInterior = new THREE.Mesh(lagoInteriorGeometry, lagoInteriorMaterial);
        lagoInterior.rotation.x = -Math.PI / 2;
        lagoInterior.position.set(x, 0.02, z); // ligeramente encima del primero
        scene.add(lagoInterior);
    }
    
    // Llamar a la función para crear el lago en una posición específica
    crearLago(0, 9);
    


function crearArbol(x, z) {
        // Tronco más pequeño
        const troncoGeometry = new THREE.CylinderGeometry(0.15, 0.15, 1.2, 16);
        const troncoMaterial = new THREE.MeshPhongMaterial({ color: 0x8B4513 });
        const tronco = new THREE.Mesh(troncoGeometry, troncoMaterial);
        tronco.position.set(x, 0.6, z);
        scene.add(tronco);
    
        // Material para hojas
        const hojaMaterial = new THREE.MeshPhongMaterial({ color: 0x228B22 });
    
        // Esfera central más pequeña
        const esfera1 = new THREE.Mesh(new THREE.SphereGeometry(0.7, 16, 16), hojaMaterial);
        esfera1.position.set(x, 1.5, z);
        scene.add(esfera1);
    
        // Esfera izquierda más pequeña
        const esfera2 = new THREE.Mesh(new THREE.SphereGeometry(0.55, 16, 16), hojaMaterial);
        esfera2.position.set(x - 0.4, 1.7, z + 0.3);
        scene.add(esfera2);
    
        // Esfera derecha más pequeña
        const esfera3 = new THREE.Mesh(new THREE.SphereGeometry(0.5, 16, 16), hojaMaterial);
        esfera3.position.set(x + 0.4, 1.7, z - 0.3);
        scene.add(esfera3);
    }

    

// Crear árboles en posiciones aleatorias, evitando el castillo y sus torres
// Crear árboles en posiciones aleatorias, evitando el castillo y sus torres
for (let i = 0; i < 5; i++) {
        let x, z;
        do {
            x = (Math.random() - 0.5) * 18; // Rango del plano (-9 a 9)
            z = (Math.random() - 0.5) * 18;
        } while (Math.hypot(x, z) < 6); // Evita zona del castillo (centro)
    
        crearArbol(x, z);
    }
    

// FUNCION PARA CREAR UNA TORRE (cilindro + cono)
function crearTorre(x, z) {
        const torreBase = new THREE.CylinderGeometry(1, 1, 3, 32);
        const materialBase = new THREE.MeshPhongMaterial({ color: 0x888888 });
        const cilindro = new THREE.Mesh(torreBase, materialBase);
        cilindro.position.set(x, 1.5, z); // mitad de la altura
    
        const torreTecho = new THREE.ConeGeometry(1.2, 2, 32);
        const materialTecho = new THREE.MeshPhongMaterial({ color: 0x1E3A5F, shininess: 100 });
        const cono = new THREE.Mesh(torreTecho, materialTecho);
        cono.position.set(x, 3 + 1, z); // sobre el cilindro
    
        scene.add(cilindro);
        scene.add(cono);
    }

    // Posiciones de las 4 esquinas del cubo
const posicionesTorres = [
        [2.5, 2.5],
        [-2.5, 2.5],
        [-2.5, -2.5],
        [2.5, -2.5],
];

// Crear las 4 torres
for (let i = 0; i < posicionesTorres.length; i++) {
        const [x, z] = posicionesTorres[i];
        crearTorre(x, z);
}

//Crear cubo 
const geometry = new THREE.BoxGeometry( 5, 2, 5 );
const material = new THREE.MeshPhongMaterial( { color: 0x888888 } );
const cube = new THREE.Mesh( geometry, material );
scene.add( cube );
cube.position.set(0, 1, 0); // Y = altura/2 para que toque el suelo



const doorGeometry = new THREE.BoxGeometry(1, 1.5, 0.1); // ancho, alto, profundidad
const doorMaterial = new THREE.MeshPhongMaterial({ color: 0x8B4513 }); // marrón
const door = new THREE.Mesh(doorGeometry, doorMaterial);

// Ubicamos la puerta al frente del cubo
door.position.set(0, 0.75, 2.55); // Y = altura/2, Z = frente del cubo + mitad del grosor de la puerta

scene.add(door);


//crear el plano 
const planeGeometry = new THREE.PlaneGeometry(50, 50);
const planeMaterial = new THREE.MeshPhongMaterial({ color: 0x006400, side: THREE.DoubleSide });
const floor = new THREE.Mesh(planeGeometry, planeMaterial);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);


camera.position.set(5,5,5 );
camera.lookAt(cube.position);


function animate() {
    controls.update();
    renderer.render( scene, camera );
  }
  renderer.setAnimationLoop( animate );

