import * as THREE from 'three';
import { scene } from './scene.js';
import { ParametricGeometry } from 'three/examples/jsm/geometries/ParametricGeometry.js';


function crearCalleConParametricGeometry() {
  const pathPoints = [
    new THREE.Vector3(4.5, 0, 0),
    new THREE.Vector3(3, 0, 3),
    new THREE.Vector3(0, 0, 3.5),
    new THREE.Vector3(-3, 0, 4),
    new THREE.Vector3(-3.5, 0, 0),
    new THREE.Vector3(-4, 0, -3),
    new THREE.Vector3(0, 0, -3),
    new THREE.Vector3(1, 0, -1),
    new THREE.Vector3(3, 0, -2),
  ];

  const curva = new THREE.CatmullRomCurve3(pathPoints, true, 'catmullrom', 1);

  const ancho = 0.7;
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
