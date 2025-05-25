import * as THREE from 'three';

export function crearRectangulo(ancho = 0.45, alto = 0.69, profundidad = 0.45, color = 0x0000ff) {
  const geometry = new THREE.BoxGeometry(ancho, alto, profundidad);
  const material = new THREE.MeshBasicMaterial({ color });
  return new THREE.Mesh(geometry, material);
}
