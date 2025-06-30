import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

//acabamoms de crear una escena y una camara  para su uso posterior
//Ademas vamos crear una actualizacion de la camara para movernos en la escena 
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75,
     window.innerWidth / window.innerHeight, 0.1, 1000 );
const controls = new OrbitControls(camera,document.body);

//Acabamos de crear el renderer para un uso posterior en la funcion animate 
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setAnimationLoop(animate);
document.body.appendChild(renderer.domElement);

//Se crea y agrega una ayuda visual  de coordenada XYZ
const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

//Se realiza un cambio de posicion de la camra y su enfoque hacia la posicion 0,0,0
camera.position.set(15,15,15);
camera.lookAt(0,0,0);
camera.updateProjectionMatrix();
//Aca estamos creando una geometria de cubo y un material basico para el mismo
//Luego se crea un mesh(malla) que combina la geometria y el material, y se agrega
// a la escena para que sea visible
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);


//Vamos a agregar una nueva geometria que nos permita crear un plano
const planeGeometry = new THREE.PlaneGeometry(20,20);
const planeMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
const plane = new THREE.Mesh(planeGeometry,planeMaterial);
scene.add(plane ); 
plane.rotation.x = -Math.PI / 2; // Rotar el plano para que esté horizontal

const gridHelper = new THREE.GridHelper(20);
scene.add(gridHelper);


// Esta función se llama en cada frame para actualizar la escena
// En este caso, simplemente rota el cubo y renderiza la escena
function animate() {
    cube.rotation.y += 0.01;
    plane.rotation.z += 0.01;
    gridHelper.rotation.y += 0.01;
    

    // Render the scene from the perspective of the camera
    renderer.render(scene, camera);
}
