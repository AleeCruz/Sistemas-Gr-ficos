// caminoCurva.js

import * as THREE from 'three';
import { scene } from './scene.js'; // Asegúrate de que esta ruta sea correcta
import { ParametricGeometry } from 'three/examples/jsm/geometries/ParametricGeometry.js';
import { crearCurva } from './curva.js'; // Importa la función crearCurva desde curva.js


/**
 * Crea una geometría paramétrica que forma un "camino" o "calle" siguiendo una curva.
 * @returns {{malla: THREE.Mesh, curva: THREE.CatmullRomCurve3}} Un objeto que contiene la malla del camino y la curva utilizada.
 */
function crearCalleConParametricGeometry() {
  // Ahora obtenemos la curva desde el módulo curva.js
  const curva = crearCurva();

  const ancho = 0.7; // Ancho de la "calle"
  const superficieParametrica = (u, v, target) => {
    // 'u' va de 0 a 1 a lo largo de la curva.
    // 'v' va de 0 a 1 a través del ancho del camino.
    const p = curva.getPointAt(u); // Punto en la curva para el valor 'u'
    const tangente = curva.getTangentAt(u); // Tangente a la curva en 'u'

    // Creamos un vector "normal" que apunta hacia arriba (eje Y).
    // Esto se usa para calcular el vector binormal que nos dará la dirección perpendicular al camino para el ancho.
    const normal = new THREE.Vector3(0, 1, 0);
    const binormal = new THREE.Vector3();
    binormal.crossVectors(normal, tangente).normalize(); // Calcula la binormal

    // Desplazamos el punto 'p' perpendicularmente a la curva para crear el ancho del camino.
    // (v - 0.5) centra el desplazamiento alrededor de la curva (de -0.5*ancho a +0.5*ancho).
    const desplazamiento = binormal.multiplyScalar((v - 0.5) * ancho);
    const puntoFinal = new THREE.Vector3().copy(p).add(desplazamiento);

    // Asignamos las coordenadas al 'target' (el vector que ParametricGeometry espera).
    // Sumamos 0.02 a la 'y' para que la calle esté ligeramente por encima del "suelo" si tienes un plano en y=0.
    target.set(puntoFinal.x, puntoFinal.y + 0.02, puntoFinal.z);
  };

  const pasosU = 200; // Número de segmentos a lo largo de la curva (mayor = más suave)
  const pasosV = 4;   // Número de segmentos a lo ancho del camino (define la resolución del ancho)

  const geometry = new ParametricGeometry(superficieParametrica, pasosU, pasosV);
  const material = new THREE.MeshStandardMaterial({
    color: 0x696969, // Color gris para la calle
    side: THREE.DoubleSide, // Renderiza ambos lados del plano
    flatShading: true,      // Aspecto más facetado
    wireframe: false        // No muestra el esqueleto de la malla
  });

  const malla = new THREE.Mesh(geometry, material);
  scene.add(malla); // Agrega la malla a la escena global importada

  return { malla, curva }; // Retorna la malla y la curva por si se necesitan en otro lugar
}

// Llama a la función para crear la calle y desestructura los resultados.
const { malla, curva: catmullRomCurve } = crearCalleConParametricGeometry();

// Exporta la curva y la malla para que puedan ser usadas en otros módulos.
export {
  catmullRomCurve,
  malla as mallaSuperficie, // Exporta la malla con un alias más descriptivo
};