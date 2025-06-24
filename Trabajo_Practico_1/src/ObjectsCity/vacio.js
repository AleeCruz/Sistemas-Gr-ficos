// vacio.js
import * as THREE from 'three';

/**
 * Esta función no crea ni devuelve ningún objeto 3D visible.
 * Su propósito es servir como un "placeholder" en el grid para dejar un espacio vacío.
 * Devuelve un THREE.Group vacío para mantener la consistencia con las otras funciones
 * que devuelven un objeto THREE.Object3D, aunque no añadirá nada a la escena.
 */
export function crearVacio() {
  // Puedes devolver un grupo vacío si necesitas que la función devuelva algo
  // para que Three.js no arroje errores al intentar añadir "undefined" a la escena.
  // Sin embargo, si tu lógica de añadir objetos ya maneja un posible "null"
  // o "undefined", podrías simplemente no devolver nada.
  return new THREE.Group();
}