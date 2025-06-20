import * as THREE from 'three';
import { ParametricGeometry } from 'three/examples/jsm/geometries/ParametricGeometry.js';

/**
 * Crea un cuadrado que se barre hacia arriba rotando, usando geometría paramétrica.
 * Incluye tapas superior e inferior trianguladas.
 */
export function crearCuadradoBarridoGirandoParametrico(
  lado = 0.6,
  altura = 2.35,
  pasosAltura = 79,
  pasosPerfil = 30,
  rotacionTotalRad = (3 * Math.PI) / 4,
  color = 0xffffff,
  wireframe = false
) {
  const half = lado / 2;
  const puntosInferior = [];
  const puntosSuperior = [];

  // 🧠 Función paramétrica (u: altura, v: contorno del cuadrado)
  const superficieParametrica = (u, v, target) => {
    const y = u * altura - 0.35;
    const angle = u * rotacionTotalRad;

    let x = 0, z = 0;
    const p = v * 4;
    if (p < 1) {
      x = -half + p * lado;
      z = -half;
    } else if (p < 2) {
      x = half;
      z = -half + (p - 1) * lado;
    } else if (p < 3) {
      x = half - (p - 2) * lado;
      z = half;
    } else {
      x = -half;
      z = half - (p - 3) * lado;
    }

    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);
    const xr = cosA * x - sinA * z;
    const zr = sinA * x + cosA * z;

    if (u === 0) puntosInferior.push(new THREE.Vector3(xr, y, zr));
    if (u === 1) puntosSuperior.push(new THREE.Vector3(xr, y, zr));

    target.set(xr, y, zr);
  };

  // Geometría lateral
  const geometry = new ParametricGeometry(superficieParametrica, pasosPerfil, pasosAltura);

  // Material
  const material = new THREE.MeshStandardMaterial({
    color: color,
    side: THREE.DoubleSide,
    flatShading: true,
    wireframe: wireframe
  });

  const lateralMesh = new THREE.Mesh(geometry, material);

  // Función auxiliar para crear una tapa triangulada
  const crearTapa = (puntos, reverse = false) => {
    const center = puntos.reduce((acc, p) => acc.add(p.clone()), new THREE.Vector3()).multiplyScalar(1 / puntos.length);
    const vertices = [];
    const indices = [];

    for (let i = 0; i < puntos.length; i++) {
      const p0 = center;
      const p1 = puntos[i];
      const p2 = puntos[(i + 1) % puntos.length];

      if (!reverse) {
        vertices.push(p0.x, p0.y, p0.z, p1.x, p1.y, p1.z, p2.x, p2.y, p2.z);
        const base = i * 3;
        indices.push(base, base + 1, base + 2);
      } else {
        vertices.push(p0.x, p0.y, p0.z, p2.x, p2.y, p2.z, p1.x, p1.y, p1.z);
        const base = i * 3;
        indices.push(base, base + 1, base + 2);
      }
    }

    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geom.setIndex(indices);
    geom.computeVertexNormals();

    return new THREE.Mesh(geom, material);
  };

  // Crear tapas
  const tapaInferior = crearTapa(puntosInferior, false);
  const tapaSuperior = crearTapa(puntosSuperior, true);

  // Devolver un grupo con todo
  const grupo = new THREE.Group();
  grupo.add(lateralMesh);
  grupo.add(tapaInferior);
  grupo.add(tapaSuperior);

  return grupo;
}
