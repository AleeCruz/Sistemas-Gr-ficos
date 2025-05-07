import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

/**Aqui dentro esta todo lo relacionado a la camara, escenea, el render y
 * el orbits control
 * ------------------------------------------------
*/
// Cierre del comentario multilínea (¡aquí faltaba!) */

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
camera.position.set(15, 15, 15); // Alejamos un poco la cámara para ver más objetos
camera.lookAt(0, 0, 0);

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // para un movimiento suave

const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper); // Ejes de referencia
/**------------------------------------------------------------ */

/*Aqui esta el codigo necesario para ingresar objetos en la escena
------------------------------------------------*/
// Plano
const planeGeometry = new THREE.PlaneGeometry(20, 20); // Agrandamos el plano
const planeMaterial = new THREE.MeshBasicMaterial({color: 0xf08080,side: THREE.DoubleSide,});
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -Math.PI / 2;
scene.add(plane);

// Grilla
const grid = new THREE.GridHelper(20, 20, 0xaa0000, 0x550000); // Agrandamos la grilla
scene.add(grid);





// Crear una forma 2D (por ejemplo, un rectángulo)
const shape = new THREE.Shape();
shape.moveTo(0, 0);
shape.lineTo(1, 0);
shape.lineTo(1, 1);
shape.lineTo(0, 1);
shape.lineTo(0, 0);

// Opciones de extrusión (profundidad = 4)
const extrudeSettings = {
  depth: 4,
  bevelEnabled: false
};

// Crear geometría y rotarla para que suba en Y
const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
//geometry.rotateX(Math.PI / 2); // ← esta línea es clave

// Crear malla y agregarla a la escena
const material = new THREE.MeshNormalMaterial();
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);




// Animación
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();