import * as THREE from 'three';
import { ParametricGeometry } from 'three/examples/jsm/geometries/ParametricGeometry.js';

/**
 * Crea una elipse que se barre hacia arriba rotando, usando geometría paramétrica.
 * Incluye tapas superior e inferior trianguladas.
 */
export function crearElipseBarridoGirandoParametrico(
  radioX = 0.28, // Nuevo: radio a lo largo del eje X
  radioZ = 0.45, // Nuevo: radio a lo largo del eje Z
  altura = 2.35,
  pasosAltura = 50,
  pasosPerfil = 30, // Representa el número de segmentos alrededor de la elipse
  rotacionTotalRad = ( Math.PI) + Math.PI/2,
  color = 0x1a2b3c,
  wireframe = false
) {
  const puntosInferior = [];
  const puntosSuperior = [];

  // 🧠 Función paramétrica (u: altura, v: ángulo de la elipse)
  const superficieParametrica = (u, v, target) => {
    const y = u * altura - 0.35;
    const angle = u * rotacionTotalRad; // Rotación total aplicada a la altura
    const profileAngle = v * Math.PI * 2; // Ángulo para el contorno de la elipse (0 a 2*PI)

    // Coordenadas x, z de la elipse base
    let x = radioX * Math.cos(profileAngle);
    let z = radioZ * Math.sin(profileAngle);

    // Aplicar la rotación del barrido
    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);
    const xr = cosA * x - sinA * z;
    const zr = sinA * x + cosA * z;

    if (u === 0) puntosInferior.push(new THREE.Vector3(xr, y, zr));
    if (u === 1) puntosSuperior.push(new THREE.Vector3(xr, y, zr));

    target.set(xr, y, zr);
  };

  // Geometría lateral de la elipse
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
    // El centro de la elipse en el plano y es (0,y,0) después de la rotación para un barrido simétrico
    const center = new THREE.Vector3(0, puntos[0].y, 0); 
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