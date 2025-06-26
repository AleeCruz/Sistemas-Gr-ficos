import * as THREE from 'three';
import { scene } from './scene.js';
import { ParametricGeometry } from 'three/examples/jsm/geometries/ParametricGeometry.js';
import { crearCurva } from './curva.js'; // Importa la función crearCurva desde curva.js


function crearCalleConParametricGeometry() {
  

  const curva = crearCurva();

  const ancho = 0.8;
  const superficieParametrica = (u, v, target) => {
    const p = curva.getPointAt(u);
    const tangente = curva.getTangentAt(u);
    const normal = new THREE.Vector3(0, 1, 0);
    const binormal = new THREE.Vector3();
    binormal.crossVectors(normal, tangente).normalize();

    const desplazamiento = binormal.multiplyScalar((v - 0.5) * ancho);
    const puntoFinal = new THREE.Vector3().copy(p).add(desplazamiento);

    target.set(puntoFinal.x, puntoFinal.y + 0.02, puntoFinal.z);
  };

  const pasosU = 200;
  const pasosV = 4;

  const geometry = new ParametricGeometry(superficieParametrica, pasosU, pasosV);
  const material = new THREE.MeshStandardMaterial({
    color: 0x696969,
    side: THREE.DoubleSide,
    flatShading: true,
    wireframe: false
  });

  const malla = new THREE.Mesh(geometry, material);
  scene.add(malla);

  return { malla, curva };
}

const { malla, curva: catmullRomCurve } = crearCalleConParametricGeometry();

export {
  catmullRomCurve,
  malla as mallaSuperficie,
};
