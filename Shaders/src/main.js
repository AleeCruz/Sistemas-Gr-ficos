import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Escena, cámara y renderizador
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 1.5, 4);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Controles
const controls = new OrbitControls(camera, renderer.domElement);

// Uniforme de tiempo
const uniforms = {
  uTime: { value: 0.0 }
};

// Vertex shader (onda en Y)
const vertexShader = `
  uniform float uTime;
  varying vec2 vUv;

  void main() {
    vUv = uv;
    vec3 pos = position;
    pos.y += 0.2 * sin(5.0 * pos.x + uTime);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

// Fragment shader (color simple)
const fragmentShader = `
  varying vec2 vUv;

  void main() {
    gl_FragColor = vec4(vUv, 1.0, 1.0); // usa coordenadas UV como color
  }
`;

// Geometría y material
const geometry = new THREE.PlaneGeometry(3, 3, 100, 100);
const material = new THREE.ShaderMaterial({
  vertexShader,
  fragmentShader,
  uniforms,
  side: THREE.DoubleSide,
  wireframe: true
});

const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

// Animación
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  uniforms.uTime.value = clock.getElapsedTime();
  renderer.render(scene, camera);
  controls.update();
}
animate();
