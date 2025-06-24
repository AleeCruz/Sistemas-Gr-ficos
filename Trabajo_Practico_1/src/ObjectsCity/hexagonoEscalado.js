import * as THREE from 'three';

/**
 * Crea un hexágono que asciende en Y y cambia de escala durante el recorrido,
 * pero vuelve a su tamaño original al final.
 * Incluye tapas superior e inferior.
 */
export function crearHexagonoEscaladoBarrido(
  radio = 0.35,
  altura = 2.35,
  pasos = 60,
  escalaMaxima = 0.68,
  color = 0xff0000
) {
  const geometry = new THREE.BufferGeometry();
  const posiciones = [];
  const indices = [];

  const baseHex = [];
  const anguloPaso = (2 * Math.PI) / 6;

  // Crear hexágono base en plano XZ
  for (let i = 0; i < 6; i++) {
    const ang = i * anguloPaso;
    baseHex.push(new THREE.Vector3(Math.cos(ang) * radio, 0, Math.sin(ang) * radio));
  }

  const bottomVerts = [];
  const topVerts = [];

  for (let i = 0; i < pasos; i++) {
    const t = i / (pasos - 1);
    const y = t * altura-0.35;

    // Escalado en forma de campana: 1 → escalaMax → 1
    const scale = 1 - (1 - escalaMaxima) * Math.sin(Math.PI * t);

    for (let v = 0; v < 6; v++) {
      const p = baseHex[v].clone().multiplyScalar(scale);
      p.y = y;
      posiciones.push(p.x, p.y, p.z);

      if (i === 0) bottomVerts.push(p.clone());
      if (i === pasos - 1) topVerts.push(p.clone());
    }

    if (i < pasos - 1) {
      const base = i * 6;
      for (let j = 0; j < 6; j++) {
        const a = base + j;
        const b = base + ((j + 1) % 6);
        const c = a + 6;
        const d = b + 6;
        indices.push(a, b, d);
        indices.push(a, d, c);
      }
    }
  }

  // Tapa inferior
  const centerBottom = new THREE.Vector3();
  bottomVerts.forEach(v => centerBottom.add(v));
  centerBottom.multiplyScalar(1 / 6);
  const indexCentroInferior = posiciones.length / 3;
  posiciones.push(centerBottom.x, centerBottom.y, centerBottom.z);
  for (let i = 0; i < 6; i++) {
    indices.push(indexCentroInferior, i, (i + 1) % 6);
  }

  // Tapa superior
  const centerTop = new THREE.Vector3();
  topVerts.forEach(v => centerTop.add(v));
  centerTop.multiplyScalar(1 / 6);
  const indexCentroSuperior = posiciones.length / 3;
  posiciones.push(centerTop.x, centerTop.y, centerTop.z);
  const startTop = (pasos - 1) * 6;
  for (let i = 0; i < 6; i++) {
    indices.push(indexCentroSuperior, startTop + i, startTop + (i + 1) % 6);
  }

  geometry.setAttribute('position', new THREE.Float32BufferAttribute(posiciones, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  const material = new THREE.MeshStandardMaterial({
    color: color,
    metalness: 0.4,
    roughness: 0.5,
    side: THREE.DoubleSide,
    flatShading: true,
  });

  return new THREE.Mesh(geometry, material);
}
