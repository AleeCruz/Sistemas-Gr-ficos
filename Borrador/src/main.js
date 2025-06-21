// main.js
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x202020);

// Cámara
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 5, 10);

// Renderizador
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Controles
const controls = new OrbitControls(camera, renderer.domElement);

// Luz
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 10, 7);
scene.add(light);

// Puntos para la curva cerrada
const points = [
  new THREE.Vector3(0, 0, 0),
  new THREE.Vector3(5, 0, 5),
  new THREE.Vector3(10, 0, 0),
  new THREE.Vector3(5, 0, -5),
];
const curve = new THREE.CatmullRomCurve3(points, true); // true = curva cerrada

// Geometría de la curva
const curveGeometry = new THREE.BufferGeometry().setFromPoints(curve.getPoints(100));
const curveMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 });
const curveLine = new THREE.Line(curveGeometry, curveMaterial);
scene.add(curveLine);

// Cubo que caminará por la curva
const cubeGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
const cubeMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
scene.add(cube);

// Animación
let t = 0;
function animate() {
  requestAnimationFrame(animate);

  // Avanza por la curva
  t += 0.001;
  if (t > 1) t = 0;

  const position = curve.getPointAt(t);
  cube.position.copy(position);

  // Apunta en la dirección de la curva
  const tangent = curve.getTangentAt(t).normalize();
  const axis = new THREE.Vector3(0, 1, 0);
  const quaternion = new THREE.Quaternion().setFromUnitVectors(axis, tangent.clone().normalize());
  cube.quaternion.slerp(quaternion, 0.1);

  renderer.render(scene, camera);
}

animate();

// Responsividad
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
