import * as THREE from 'three';

export function crearCubo(tamaño = 0.6, color = 0x8A2BE2) {
  const geometry = new THREE.BoxGeometry(tamaño, tamaño, tamaño);
  const material = new THREE.MeshBasicMaterial({ color });
  return new THREE.Mesh(geometry, material);
}
