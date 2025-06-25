// curva.js
import * as THREE from 'three';

export function crearCurva() {
  const puntos = [
    new THREE.Vector3(-8, 0, 0),
    new THREE.Vector3(-4, 0, 3),
    new THREE.Vector3(-8, 0, 6),
    new THREE.Vector3(0, 0, 8),
    new THREE.Vector3(4, 0, 6),
    new THREE.Vector3(8, 0, 3),
    new THREE.Vector3(8, 0, 0),
    new THREE.Vector3(4, 0, -3),
    new THREE.Vector3(0, 0, -6),
  
  ];

  return new THREE.CatmullRomCurve3(puntos, true);
}
