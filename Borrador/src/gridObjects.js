import * as THREE from 'three';
import { scene } from './scene.js';
import {crearCilindroVertical_1} from "./cilindroParametric.js";
import {crearCilindroVertical} from './cilindro.js';
import {crearCuadradoBarridoGirando} from "./cuadradoRotativo.js";
import {crearCuadradoBarridoGirandoParametrico} from "./cuadradoRotParam.js";
import {crearElipse_1} from "./elipse_1.js";
import {crearElipse_Parametric} from "./elipse_1_1.js"
import {crearElipse_2} from "./elipse_2.js";
import {crearElipse_Parametric_2} from "./elipse_2_2.js"
import {crearRectanguloBarridoGirando} from "./RectanguloRotativo.js";
import {crearRectanguloBarridoGirandoParametrico} from "./rectanguloRotParam.js"
import {crearHexagonoEscaladoBarrido } from './hexagonoEscalado.js'; 
import {crearHexagonoEscaladoBarridoParametrico} from './hexagonoParametrico.js';
import {crearElipseBarridoGirandoParametrico} from "./elipseRotParam.js"
import {crearVacio} from "./vacio.js"



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
  return distance < 0.7;
}


const tiposDeObjetos = {
  cilindro: crearCilindroVertical,
  cilindro_1: crearCilindroVertical_1,
  cuadrado: crearCuadradoBarridoGirando,
  cuadrado_1: crearCuadradoBarridoGirandoParametrico,
  elipse1: crearElipse_1,
  elipse_1_1: crearElipse_Parametric,
  elipse2: crearElipse_2,
  elipse_2_2: crearElipse_Parametric_2,
  rectangulo: crearRectanguloBarridoGirando,
  rectangulo_1: crearRectanguloBarridoGirandoParametrico,
  hexagono: crearHexagonoEscaladoBarrido,
  hexagono_1: crearHexagonoEscaladoBarridoParametrico,
  elipseRotParm: crearElipseBarridoGirandoParametrico,
  vacio: crearVacio,
};

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
    const crearObjeto = tiposDeObjetos[tipo];

    const objeto = crearObjeto();
    objeto.position.set(pos.x, 0.35, pos.z);
    scene.add(objeto);

    tipoIndex++;
    if (tipoIndex >= tipos.length) tipoIndex = 0; // reinicia la secuencia
  });
}
