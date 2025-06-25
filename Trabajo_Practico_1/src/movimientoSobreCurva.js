import * as THREE from 'three';

export function moverCuboSobreCurva(cubo, curva, tiempoTotal) {
  const velocidad = 0.01;
  const t = (tiempoTotal * velocidad) % 1;

  const posicion = curva.getPointAt(t);
  const tangente = curva.getTangentAt(t);

  cubo.position.copy(posicion);

  // Orientación
 // Orientación suave
const ejeY = new THREE.Vector3(0,1,0);
const direccion = tangente.clone().normalize();
const angulo = -Math.atan2(direccion.z, direccion.x);

// Quaternion objetivo para la nueva orientación
const quaternionObjetivo = new THREE.Quaternion().setFromAxisAngle(ejeY, angulo);

// Interpolamos entre la rotación actual y la nueva para suavizar el giro
const suavizado = 0.1; // Puedes cambiar este valor entre 0 y 1, donde 0 es sin cambio y 1 cambio inmediato
cubo.quaternion.slerp(quaternionObjetivo, suavizado);

}
