// curva.js
import * as THREE from 'three';

export function crearCurva() {
  const puntos = [
    new THREE.Vector3(6.8, 0, 0),     // Centro de la grilla
    new THREE.Vector3(5, 0, 5.5), // Curva suave
    new THREE.Vector3(-2, 0, 6),    // Llega al borde X positivo
    new THREE.Vector3(4, 0, 1),   // Gira hacia el Z negativo
    new THREE.Vector3(2, 0, -3),  // Sigue la curva
    new THREE.Vector3(0, 0, 3), // Curva suave
    new THREE.Vector3(-6, 0, 3),   // Llega al borde X negativo
    new THREE.Vector3(-5, 0, -5),  // Gira hacia el Z positivo
    new THREE.Vector3(0,0,-6.8),
    new THREE.Vector3(5,0,-5),
  
  
  ];

  return new THREE.CatmullRomCurve3(puntos, true,"catmullrom",1);
}
