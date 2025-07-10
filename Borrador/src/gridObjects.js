import * as THREE from 'three';
import { scene } from './scene.js'; // Asegúrate de que 'scene' se exporte desde scene.js
import {crearCilindroVertical_1} from "./ObjectsCity/cilindroParametric.js";
import {crearCilindroVertical} from './ObjectsCity/cilindro.js';
import {crearCuadradoBarridoGirando} from "./ObjectsCity/cuadradoRotativo.js";
import {crearCuadradoBarridoGirandoParametrico} from "./ObjectsCity/cuadradoRotParam.js";
import {crearElipse_1} from "./ObjectsCity/elipse_1.js";
import {crearElipse_Parametric} from "./ObjectsCity/elipse_1_1.js"
import {crearElipse_2} from "./ObjectsCity/elipse_2.js";
import {crearElipse_Parametric_2} from "./ObjectsCity/elipse_2_2.js"
import {crearRectanguloBarridoGirando} from "./ObjectsCity/RectanguloRotativo.js";
import {crearRectanguloBarridoGirandoParametrico} from "./ObjectsCity/rectanguloRotParam.js"
import {crearHexagonoEscaladoBarrido } from './ObjectsCity/hexagonoEscalado.js'; 
import {crearHexagonoEscaladoBarridoParametrico} from './ObjectsCity/hexagonoParametrico.js';
import {crearElipseBarridoGirandoParametrico} from "./ObjectsCity/elipseRotParam.js"
import {crearVacio} from "./ObjectsCity/vacio.js"

export function isInsideStreetArea(x, z, curve, streetWidth, samples = 100) {
  let minDistanceSq = Infinity;
  const testPoint = new THREE.Vector3(x, 0, z);

  for (let i = 0; i <= samples; i++) {
    const pointOnCurve = curve.getPointAt(i / samples);
    const distanceSq = testPoint.distanceToSquared(pointOnCurve);
    if (distanceSq < minDistanceSq) {
      minDistanceSq = distanceSq;
    }
  }

  const distance = Math.sqrt(minDistanceSq);
  return distance < 0.8;
}


const tiposDeObjetos = {
  cilindro_1: crearCilindroVertical_1,
  cuadrado_1: crearCuadradoBarridoGirandoParametrico,
  elipse_1_1: crearElipse_Parametric,
  elipse_2_2: crearElipse_Parametric_2,
  rectangulo_1: crearRectanguloBarridoGirandoParametrico,
  hexagono_1: crearHexagonoEscaladoBarridoParametrico,
  elipseRotParm: crearElipseBarridoGirandoParametrico,
  vacio: crearVacio,
};

// --- Plantillas de objetos para clonar ---
// Vamos a almacenar aquí una instancia de cada tipo de objeto.
const plantillasDeObjetos = {};

// Inicializamos las plantillas una vez cuando este módulo se carga.
// Esto asume que estas funciones de creación de objetos no tienen efectos secundarios
// que impidan su llamada única al inicio.
for (const tipo in tiposDeObjetos) {
  if (tiposDeObjetos.hasOwnProperty(tipo)) {
    plantillasDeObjetos[tipo] = tiposDeObjetos[tipo]();
    // Opcional: Si los objetos tienen geometrías o materiales muy grandes,
    // puedes liberarlos aquí si no quieres que la plantilla "real" persista en la memoria
    // después de clonarla, pero generalmente no es necesario.
    // Ej: plantilla.geometry.dispose() - ¡No hagas esto si necesitas la plantilla viva!
  }
}


export function generarObjetosSinSuperposicion({
  curve,
  streetWidth = 0.5,
  gridSize = 10,
  gridDivision = 10,
}) {
  const step = gridSize / gridDivision;
  const offset = gridSize / 2 - step / 2;

  // 1. Guardamos todas las posiciones válidas (fuera de la calle)
  const posicionesValidas = [];

  for (let i = 0; i < gridDivision; i++) {
    for (let j = 0; j < gridDivision; j++) {
      const x = -offset + i * step;
      const z = -offset + j * step;

      if (!isInsideStreetArea(x, z, curve, streetWidth)) {
        posicionesValidas.push({ x, z });
      }
    }
  }

  // 2. Tipos de objetos para colocar, en secuencia o aleatorio
  const tipos = Object.keys(tiposDeObjetos);
  let tipoIndex = 0;

  // 3. Agregar objetos a la escena sin superponer
  posicionesValidas.forEach(pos => {
    const tipo = tipos[tipoIndex];
    const plantillaObjeto = plantillasDeObjetos[tipo]; // Obtenemos la plantilla del tipo actual

    // --- ¡Aquí usamos clone()! ---
    const objetoClonado = plantillaObjeto.clone();

    // Ahora, si el objeto original tenía geometrías o materiales únicos por instancia,
    // necesitarías clonarlos explícitamente si `crearObjeto()` los creara nuevos.
    // Pero si `crearObjeto()` siempre devuelve un Mesh con la misma geometría y material,
    // `clone()` ya comparte esas referencias por defecto, lo cual es eficiente.
    // Si tus funciones `crearX` devuelven un `Group` o `Object3D` con múltiples Meshes anidados,
    // `clone()` también manejará eso recursivamente, clonando todos los Meshes y sus propiedades.

    objetoClonado.position.set(pos.x, 0.35, pos.z);
    scene.add(objetoClonado);

    tipoIndex++;
    if (tipoIndex >= tipos.length) tipoIndex = 0; // reinicia la secuencia
  });
}