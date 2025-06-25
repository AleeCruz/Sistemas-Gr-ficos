import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { crearCurva } from './curva.js';

import { moverCuboSobreCurva } from './movimientoSobreCurva.js';
import { crearAuto } from './auto.js';
import { cargarAuto } from './cargarAuto.js';




//Vamos a importar un auto de "Ignition Labs"

let scene, camera, renderer, curva, cubo, clock, auto;

init();
animate();

function init() {
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 20, 30);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  new OrbitControls(camera, renderer.domElement);

  const luz = new THREE.DirectionalLight(0xffffff, 1);
  luz.position.set(10, 20, 10);
  scene.add(luz, new THREE.AmbientLight(0x404040));

  curva = crearCurva();

  const puntos = curva.getPoints(200);
  const curvaGeometry = new THREE.BufferGeometry().setFromPoints(puntos);
  const curvaLine = new THREE.Line(curvaGeometry, new THREE.LineBasicMaterial({ color: 0xff0000 }));
  scene.add(curvaLine);


/*
  // Cargar modelo GLB desde Ignition Labs
    cargarAuto('/modelos/car_model.glb', (modelo) => {
    auto = modelo; // Guardamos el modelo para moverlo en animate()
    scene.add(auto);
    auto.position.set(0, 0, 0);
    
    });
*/


  auto = crearAuto();
  scene.add(auto);

  scene.add(new THREE.GridHelper(20, 20));

  clock = new THREE.Clock();
}


function animate() {
  requestAnimationFrame(animate);

  const tiempo = clock.getElapsedTime();

 if (auto && curva) {
  moverCuboSobreCurva(auto, curva, tiempo);
}


  renderer.render(scene, camera);
}
