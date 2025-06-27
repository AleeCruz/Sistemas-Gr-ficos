import * as THREE from 'three';

export function crearCuadradoBarridoGirando(
  lado = 0.6,
  altura = 2.35,
  pasos = 76,
  rotacionTotalRad = 3 * Math.PI / 4,
  texturaURL = 'textures/ventana4.jpg',
  repeticionesY = 2
) {
  const geometry = new THREE.BufferGeometry();
  const half = lado / 2;

  const square = [
    new THREE.Vector3(-half, -0.35, -half),
    new THREE.Vector3(half, -0.35, -half),
    new THREE.Vector3(half, -0.35, half),
    new THREE.Vector3(-half, -0.35, half),
  ];

  const positions = [];
  const uvs = [];
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
      const p = square[v].clone().applyMatrix4(transform);
      positions.push(p.x, p.y, p.z);

      // UVs: u = cara (0 a 1), v = altura (repetida)
      const u = v / 4; // 4 caras, espaciadas de 0.0 a 1.0
      const vCoord = t * repeticionesY;
      uvs.push(u, vCoord);

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

  // --- Tapas ---
  const centerBottom = bottomVerts.reduce((a, b) => a.add(b), new THREE.Vector3()).multiplyScalar(1 / 4);
  const bottomCenterIndex = positions.length / 3;
  positions.push(centerBottom.x, centerBottom.y, centerBottom.z);
  uvs.push(0.5, 0.5);
  for (let i = 0; i < 4; i++) {
    indices.push(bottomCenterIndex, i, (i + 1) % 4);
  }

  const centerTop = topVerts.reduce((a, b) => a.add(b), new THREE.Vector3()).multiplyScalar(1 / 4);
  const topCenterIndex = positions.length / 3;
  positions.push(centerTop.x, centerTop.y, centerTop.z);
  uvs.push(0.5, 0.5);
  const topStart = (pasos - 1) * 4;
  for (let i = 0; i < 4; i++) {
    indices.push(topCenterIndex, topStart + i, topStart + (i + 1) % 4);
  }

  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  // --- Material con textura ---
  const texture = new THREE.TextureLoader().load(texturaURL);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3, repeticionesY);

  const material = new THREE.MeshStandardMaterial({
    map: texture,
    side: THREE.DoubleSide,
  });

  return new THREE.Mesh(geometry, material);
}
