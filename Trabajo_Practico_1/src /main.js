import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

/**Aqui dentro esta todo lo relacionado a la camara, escenea, el render y 
 * el orbits control
 * ------------------------------------------------
*/
// Escena y cámara
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x330000); // Fondo rojo oscuro
scene.fog = new THREE.Fog(0x330000, 10, 50); // (Opcional) niebla apocalíptica

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0,10, 0);
camera.lookAt(0, 0, 0);

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // para un movimiento suave
/**------------------------------------------------------------ */



/*Aqui esta el codigo necesario para ingresar objetos en la escena 
------------------------------------------------*/

//Ejes coordenados 
const axesHelper = new THREE.AxesHelper(5); // el número define el largo de los ejes
scene.add(axesHelper);

// Plano
const planeGeometry = new THREE.PlaneGeometry(10, 10);
const planeMaterial = new THREE.MeshBasicMaterial({color: 0xf08080,side: THREE.DoubleSide,});
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -Math.PI / 2;
scene.add(plane);

// Grilla
const grid = new THREE.GridHelper(10, 10, 0xaa0000, 0x550000); 
scene.add(grid);

function buildCurveCatmullRoom() {
	const points = [
		new THREE.Vector3(4, 0, 0),
		new THREE.Vector3(4, 0, 3),
    new THREE.Vector3(0, 0, 3),
    new THREE.Vector3(-3, 0, 4),
		new THREE.Vector3(-2, 0, 0),
    new THREE.Vector3(-4, 0, -4),
		new THREE.Vector3(0, 0, -4),
    new THREE.Vector3(2, 0, -2),
    new THREE.Vector3(4, 0, -2),
	];

	const curve = new THREE.CatmullRomCurve3(points, true , 'catmullrom', 0.5);
	const curvePoints = curve.getPoints(50); // más puntos = curva más suave

	const geometry = new THREE.BufferGeometry().setFromPoints(curvePoints);
	const material = new THREE.LineBasicMaterial({ color: 0x0000ff });

	const curveObject = new THREE.Line(geometry, material);
	scene.add(curveObject);
}




// Animación
function animate() {
  requestAnimationFrame(animate);
  controls.update(); // Necesario si enableDamping = true
  renderer.render(scene, camera);
}

buildCurveCatmullRoom();
animate();







/* Responsivo
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
*/