import * as THREE from 'three';

export function crearCubo(scene) {
  const geometry = new THREE.BoxGeometry(1, 0.5, 2);
  const material = new THREE.MeshPhongMaterial({ color: 0x00ffcc });
  const cubo = new THREE.Mesh(geometry, material);
  scene.add(cubo);
  return cubo;
}
