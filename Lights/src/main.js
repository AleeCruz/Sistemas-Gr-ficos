import * as THREE from 'three';
import { GUI } from 'dat.gui';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'; // Importa OrbitControls

// 1. Configuración básica de THREE.js
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true }); // antialias para bordes más suaves
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true; // Habilitar sombras
document.body.appendChild(renderer.domElement);

// 2. Añadir OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // Para un movimiento más suave
controls.dampingFactor = 0.25;
controls.screenSpacePanning = false; // Evita que la cámara se mueva en el plano de la pantalla

// 3. Añadir Ejes Cartesianos
const axesHelper = new THREE.AxesHelper(5); // El argumento es el tamaño de los ejes
scene.add(axesHelper);

// --- Crear el plano XZ ---
const planeGeometry = new THREE.PlaneGeometry(20, 20); // Tamaño del plano
const planeMaterial = new THREE.MeshStandardMaterial({ color: 0x808080 }); // Un gris para el plano
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -Math.PI / 2; // Rota el plano para que quede horizontal (en el plano XZ)
plane.position.y = 0; // Asegúrate de que está en el "suelo"
plane.receiveShadow = true; // El plano recibe sombras
scene.add(plane);


//---creacion de lop 3 cubos

const cubeRGeometry = new THREE.BoxGeometry(1, 1, 1); // Geometría de cubo
const cubeRMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 }); // Material rojo para el cubo 
const redCube = new THREE.Mesh(cubeRGeometry, cubeRMaterial);
redCube.receiveShadow = true ;
redCube.castShadow = true; // Permitir que el cubo proyecte sombras
redCube.position.set(-2,1, 0); // Posición del cubo rojo
scene.add(redCube);


const cubeBGeometry = new THREE.BoxGeometry(1, 1, 1); // Geometría de cubo
const cubeBMaterial = new THREE.MeshStandardMaterial({ color: 0x0000ff }); // Material rojo para el cubo 
const blueCube = new THREE.Mesh(cubeBGeometry, cubeBMaterial);
blueCube.receiveShadow = true ;
blueCube.castShadow = true; // Permitir que el cubo proyecte sombras
blueCube.position.set(0,1, 0); // Posición del cubo rojo
scene.add(blueCube);


const cubeGGeometry = new THREE.BoxGeometry(1, 1, 1); // Geometría de cubo
const cubeGMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 }); // Material rojo para el cubo 
const greenCube = new THREE.Mesh(cubeGGeometry, cubeGMaterial);
greenCube.receiveShadow = true ;
greenCube.castShadow = true; // Permitir que el cubo proyecte sombras
greenCube.position.set(2,1, 0); // Posición del cubo rojo
scene.add(greenCube);


//--------Luces---------
// ----Vamos a configurar un par de cosas para que funcionen las luces ambientales 

const ambientLight = new THREE.AmbientLight(0xffffff,1);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
scene.add(directionalLight);
directionalLight.castShadow = true; // Permitir que la luz direccional proyecte sombras
directionalLight.position.set(5,5,5);
const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight, 1); // Ayuda visual para la luz direccional
scene.add(directionalLightHelper);


const spotLight =new THREE.SpotLight(0xff0000, 5, 20, Math.PI / 6, 0.5, 2); // Color inicial rojo (0xff0000)
spotLight.position.set(-4,5,0);
spotLight.castShadow = true;
scene.add(spotLight);
const spotLightHelper = new THREE.SpotLightHelper(spotLight); // Ayudante para ver la posición y dirección del SpotLight
scene.add(spotLightHelper);


const pointLight = new THREE.PointLight(0x00ff00, 2, 10,0.8); // Luz puntual verde
pointLight.position.set(0, 5, 0); // Posición de la luz puntual
scene.add(pointLight);
const pointLightHelper = new THREE.PointLightHelper(pointLight, 0.5); // Ayudante para ver la posición de la luz puntual
scene.add(pointLightHelper);

//--------Aca vamos a configurar sobre los parametros de dat gui

const gui = new GUI();

const params = {
    intensity : ambientLight.intensity,
    ambientColor: ambientLight.color.getHex(), // Color de la luz ambiental

    directionalLightColor: directionalLight.color.getHex(),
    directionalIntensity: directionalLight.intensity,

    spotLightColor: spotLight.color.getHex(),
    spotLightIntensity: spotLight.intensity,
    spotLightDistance: spotLight.distance,
    spotLightAngle: spotLight.angle,
    spotLightPenumbra: spotLight.penumbra,
    spotLightDecay: spotLight.decay,


    pointLightColor: pointLight.color.getHex(),
    pointLightIntensity: pointLight.intensity,
    pointLightDistance: pointLight.distance,
    pointLightDecay: pointLight.decay,


}

//-----// Agregamos una carpeta para las luces ambientales
const ambientalLightFolder = gui.addFolder('Luces ambientales');
ambientalLightFolder.add(ambientLight,"visible");
ambientalLightFolder.add(params, 'intensity', 0, 2)
                    .onChange(value => ambientLight.intensity = value);
ambientalLightFolder.addColor(params,"ambientColor",0,2)
                    .onChange(value =>ambientLight.color.setHex(value))
ambientalLightFolder.open(); // Abrir la carpeta por defecto

//-----// Agregamos una carpeta para las luces direccionales
const directionalLightFolder = gui.addFolder('Luz DIreccional');
directionalLightFolder.add(directionalLight,"visible");
directionalLightFolder.addColor(params, 'directionalLightColor', 0, 2)
                      .onChange(value => directionalLight.color.setHex(value));
directionalLightFolder.add(params,"directionalIntensity",0,5)
                      .onChange(value => directionalLight.intensity = value);
directionalLightFolder.open();

const spotLightFolder = gui.addFolder("Luz Focal");
spotLightFolder.add(spotLight,"visible");
spotLightFolder.addColor(params, 'spotLightColor', 0, 2)
               .onChange(value => spotLight.color.setHex(value));
spotLightFolder.add(params, 'spotLightIntensity', 0, 20)
               .onChange(value => spotLight.intensity = value);
spotLightFolder.add(params, 'spotLightDistance', 0, 50)
               .onChange(value => spotLight.distance = value);
spotLightFolder.add(params, 'spotLightAngle', 0, Math.PI / 2)
               .onChange(value => spotLight.angle = value);
spotLightFolder.add(params, 'spotLightPenumbra', 0, 1)
               .onChange(value => spotLight.penumbra = value);
spotLightFolder.add(params, 'spotLightDecay', 0, 2)
               .onChange(value => spotLight.decay = value);
spotLightFolder.add(spotLight, 'castShadow')
               .onChange(value => spotLight.castShadow = value);
spotLightFolder.open();


const pointLightFolder = gui.addFolder("Luz Puntual");
pointLightFolder.add(pointLight,"visible");
pointLightFolder.addColor(params, 'pointLightColor', 0, 2)
                .onChange(value => pointLight.color.setHex(value));
pointLightFolder.add(params, 'pointLightIntensity', 0, 20)
                .onChange(value => pointLight.intensity = value);
pointLightFolder.add(params, 'pointLightDistance', 0, 50)
                .onChange(value => pointLight.distance = value);
pointLightFolder.add(params, 'pointLightDecay', 0, 2)
                .onChange(value => pointLight.decay = value);   
pointLightFolder.add(pointLight, 'castShadow');

pointLightFolder.open();


/*
const lucesFolder = gui.addFolder('Luces ambientales');
lucesFolder.add(ambientLightControls,"intensity",0,2)
           .onChange(value => ambientLight.intensity = value);
lucesFolder.open();
*/




// Posición inicial de la cámara para ver los cubos
camera.position.set(3, 4, 6);
camera.lookAt(0,0,0); // Asegura que la cámara mire hacia los cubos


/*
// Ejemplo de cómo agregar un control para un cubo específico
// Si quieres controlar cada cubo con dat.GUI, tendrías que repetir esto para cada uno
const redCubeGuiControls = {
    posX: redCube.position.x,
    // ... otras propiedades
};
const redCubeFolder = gui.addFolder('Cubo Rojo');
redCubeFolder.add(redCubeGuiControls, 'posX', -5, 5).onChange(value => redCube.position.x = value);
// ... y así sucesivamente para cada cubo y propiedad
*/

// 8. Función de animación
function animate() {
    requestAnimationFrame(animate);

    controls.update(); // Necesario si enableDamping está en true

    renderer.render(scene, camera);
}

animate();

// 9. Manejar el redimensionamiento de la ventana
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});