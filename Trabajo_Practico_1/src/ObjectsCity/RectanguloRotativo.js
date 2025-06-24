import * as THREE from 'three';

/**
 * Crea una figura rectangular que asciende en Y mientras rota sobre su eje.
 * Se genera una superficie de barrido (sweep surface) con tapas inferior y superior.
 */
export function crearRectanguloBarridoGirando(
  ladoX = 0.4,         // lado en X (ancho)
  ladoZ = 0.8,         // lado en Z (profundidad)
  altura = 2.35,
  pasos = 76,
  rotacionTotalRad =  (Math.PI) / 2,
  color = 0xADFF2F
) {
  const geometry = new THREE.BufferGeometry();
  const halfX = ladoX / 2;
  const halfZ = ladoZ / 2;

  // Rectángulo base centrado en (0, 0, 0), en plano XZ
  const rectangle = [
    new THREE.Vector3(-halfX, -0.35, -halfZ),
    new THREE.Vector3(halfX, -0.35, -halfZ),
    new THREE.Vector3(halfX, -0.35, halfZ),
    new THREE.Vector3(-halfX, -0.35, halfZ),
  ];

  const positions = [];
  const indices = [];

  const bottomVerts = [];
  const topVerts = [];

  for (let i = 0; i < pasos; i++) {
    const t = i / (pasos - 1);
    const y = t * altura;
    const angle = t * rotacionTotalRad;

    const rotation = new THREE.Matrix4().makeRotationY(angle);
    const translation = new THREE.Matrix4().makeTranslation(0, y, 0);
    const transform = new THREE.Matrix4().multiplyMatrices(translation, rotation);

    for (let v = 0; v < 4; v++) {
      const p = rectangle[v].clone().applyMatrix4(transform);
      positions.push(p.x, p.y, p.z);
      if (i === 0) bottomVerts.push(p.clone());
      if (i === pasos - 1) topVerts.push(p.clone());
    }

    if (i < pasos - 1) {
      const base = i * 4;
      indices.push(
        base, base + 1, base + 5,
        base, base + 5, base + 4,

        base + 1, base + 2, base + 6,
        base + 1, base + 6, base + 5,

        base + 2, base + 3, base + 7,
        base + 2, base + 7, base + 6,

        base + 3, base + 0, base + 4,
        base + 3, base + 4, base + 7
      );
    }
  }

  // Tapa inferior
  const centerBottom = new THREE.Vector3();
  bottomVerts.forEach(v => centerBottom.add(v));
  centerBottom.multiplyScalar(1 / 4);
  const bottomCenterIndex = positions.length / 3;
  positions.push(centerBottom.x, centerBottom.y, centerBottom.z);
  for (let i = 0; i < 4; i++) {
    indices.push(bottomCenterIndex, i, (i + 1) % 4);
  }

  // Tapa superior
  const centerTop = new THREE.Vector3();
  topVerts.forEach(v => centerTop.add(v));
  centerTop.multiplyScalar(1 / 4);
  const topCenterIndex = positions.length / 3;
  positions.push(centerTop.x, centerTop.y, centerTop.z);
  const topStart = (pasos - 1) * 4;
  for (let i = 0; i < 4; i++) {
    indices.push(topCenterIndex, topStart + i, topStart + (i + 1) % 4);
  }

  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  const material = new THREE.MeshStandardMaterial({
    color: color,
    side: THREE.DoubleSide,
    flatShading: true,
    wireframe: false
  });

  return new THREE.Mesh(geometry, material);
}
