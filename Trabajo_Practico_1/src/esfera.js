import * as THREE from 'three';

export function crearEsfera(radio = 0.35, color = 0xff0000) {
  const geometry = new THREE.SphereGeometry(radio, 32, 16);
  const material = new THREE.MeshBasicMaterial({ color });
  return new THREE.Mesh(geometry, material);
}
