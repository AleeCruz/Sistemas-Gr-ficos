import * as THREE from 'three';
import { scene } from './scene.js';
import { crearCubo } from './cubo.js';
import { crearEsfera } from './esfera.js';
import { createStar } from './estrella.js';
import { crearRectangulo } from './rectangulo.js';


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
  return distance < 0.55;
}

const tiposDeObjetos = {
  cubo: crearCubo,
  esfera: crearEsfera,
  triangulo: createStar,
  rectangulo: crearRectangulo
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
