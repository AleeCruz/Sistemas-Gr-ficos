import * as THREE from 'three';

export function crearFerrari(scene) {
  const geometry = new THREE.BoxGeometry(2.4, 1.2, 4.5);
  const material = new THREE.MeshPhongMaterial({ color: 0xff0000 });
  const ferrari = new THREE.Mesh(geometry, material);
  scene.add(ferrari);
  return ferrari;
}
