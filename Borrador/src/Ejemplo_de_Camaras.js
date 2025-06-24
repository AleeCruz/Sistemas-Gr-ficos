import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';

let scene, renderer, clock;
let objeto, curva;
let cameraPersp, cameraOrtho, cameraPrimera, activeCamera;
let orbitControls, pointerControls;
let camaraActual = 0;

init();
animate();

function init() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const aspect = width / height;

  // Escena y render
  scene = new THREE.Scene();
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(width, height);
  document.body.appendChild(renderer.domElement);

  // Cámaras
  cameraPersp = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
  cameraPersp.position.set(10, 10, 10);

  cameraOrtho = new THREE.OrthographicCamera(
    (aspect * 10) / -2,
    (aspect * 10) / 2,
    10 / 2,
    -10 / 2,
    0.1,
    1000
  );
  cameraOrtho.position.set(10, 10, 10);

  cameraPrimera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
  cameraPrimera.position.set(0, 1.5, 0);

  // Controles
  orbitControls = new OrbitControls(cameraPersp, renderer.domElement);
  pointerControls = new PointerLockControls(cameraPrimera, renderer.domElement);

  // Activar vista en primera persona al hacer click
  document.body.addEventListener('click', () => {
    if (activeCamera === cameraPrimera) {
      pointerControls.lock();
    }
  });

  // Cámara activa inicial
  activeCamera = cameraPersp;

  // Luz
  scene.add(new THREE.AmbientLight(0x404040));
  const dirLight = new THREE.DirectionalLight(0xffffff, 1);
  dirLight.position.set(10, 20, 10);
  scene.add(dirLight);

  // Cubo que circula
  const geo = new THREE.BoxGeometry(1, 1, 1);
  const mat = new THREE.MeshStandardMaterial({ color: 0x00ffcc });
  objeto = new THREE.Mesh(geo, mat);
  scene.add(objeto);

  // Curva Catmull-Rom cerrada
  const puntos = [
    new THREE.Vector3(-8, 0, -8),
    new THREE.Vector3(8, 0, -8),
    new THREE.Vector3(8, 0, 8),
    new THREE.Vector3(-8, 0, 8),
  ];
  curva = new THREE.CatmullRomCurve3(puntos, true);

  const puntosCurva = curva.getPoints(300);
  const curvaGeom = new THREE.BufferGeometry().setFromPoints(puntosCurva);
  const linea = new THREE.Line(curvaGeom, new THREE.LineBasicMaterial({ color: 0xff0000 }));
  scene.add(linea);

  // Suelo
  scene.add(new THREE.GridHelper(20, 20));

  // Cambiar cámara con tecla C
  window.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'c') {
      camaraActual = (camaraActual + 1) % 3;
      activeCamera = [cameraPersp, cameraOrtho, cameraPrimera][camaraActual];

      orbitControls.enabled = (activeCamera === cameraPersp || activeCamera === cameraOrtho);
      orbitControls.object = activeCamera;

      if (activeCamera === cameraPrimera) {
        pointerControls.connect();
      } else {
        pointerControls.disconnect();
      }
    }
  });

  // Reloj
  clock = new THREE.Clock();
}

function animate() {
  requestAnimationFrame(animate);

  const tiempo = clock.getElapsedTime();
  const velocidad = 0.05;
  const t = (tiempo * velocidad) % 1;

  // Movimiento del objeto
  const posicion = curva.getPointAt(t);
  const tangente = curva.getTangentAt(t).normalize();
  objeto.position.copy(posicion);

  // Rotación suave del objeto (opcional)
  const ejeY = new THREE.Vector3(0, 1, 0);
  const angulo = -Math.atan2(tangente.z, tangente.x);
  const qObjetivo = new THREE.Quaternion().setFromAxisAngle(ejeY, angulo);
  objeto.quaternion.slerp(qObjetivo, 0.1);

  // Si estamos en primera persona, mover la cámara a la posición del objeto
  if (activeCamera === cameraPrimera) {
    const offsetAltura = new THREE.Vector3(0, 1.5, 0);
    cameraPrimera.position.copy(objeto.position.clone().add(offsetAltura));
  }

  if (orbitControls.enabled) {
    orbitControls.update();
  }

  renderer.render(scene, activeCamera);
}
