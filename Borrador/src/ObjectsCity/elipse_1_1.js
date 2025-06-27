import * as THREE from 'three';
import { ParametricGeometry } from 'three/examples/jsm/geometries/ParametricGeometry.js';

export function crearElipse_Parametric(
  radiusX = 0.28,
  radiusY = 0.45,
  altura = 1.6,
  segmentsU = 64,
  segmentsV = 30,
  color = 0xDAA520,
  texturaURL = 'textures/ventana1.png',
  repeticionesY = 2
) {
  // --- Función paramétrica para el cuerpo ---
  const parametricFunction = (u, v, target) => {
    const theta = u * 2 * Math.PI;
    const y = -0.35 + v * (altura + 0.35);
    const x = radiusX * Math.cos(theta);
    const z = radiusY * Math.sin(theta);
    target.set(x, y, z);
  };

  // --- Crear geometría ---
  const geometry = new ParametricGeometry(parametricFunction, segmentsU, segmentsV);
  geometry.computeVertexNormals();

  // --- Mapear UVs por índice de vértices (corregido) ---
  const vertexCount = (segmentsU + 1) * (segmentsV + 1);
  const uvs = [];

  for (let i = 0; i < vertexCount; i++) {
    const ix = i % (segmentsU + 1);               // horizontal
    const iy = Math.floor(i / (segmentsU + 1));   // vertical

    const u = ix / segmentsU;                     // ángulo
    const v = iy / segmentsV;                     // altura normalizada
    uvs.push(u, v * repeticionesY);               // solo repetir verticalmente
  }

  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));

  // --- Cargar textura ---
  const texture = new THREE.TextureLoader().load(texturaURL);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, repeticionesY);

  // --- Crear material con textura ---
  const material = new THREE.MeshStandardMaterial({
    map: texture,
    side: THREE.DoubleSide
  });

  // --- Crear cuerpo principal ---
  const mesh = new THREE.Mesh(geometry, material);

  // --- Crear tapas ---
  const crearTapa = (y, rotX) => {
    const circleGeo = new THREE.CircleGeometry(1, segmentsU);
    circleGeo.scale(radiusX, radiusY, 1);

    const pos = circleGeo.attributes.position.array;
    const uvsTapa = [];
    for (let i = 0; i < pos.length; i += 3) {
      const x = pos[i] / radiusX;
      const z = pos[i + 2] / radiusY;
      uvsTapa.push(0.5 + x * 0.5, 0.5 + z * 0.5); // mapeo radial
    }
    circleGeo.setAttribute('uv', new THREE.Float32BufferAttribute(uvsTapa, 2));

    const tapa = new THREE.Mesh(circleGeo, material);
    tapa.rotation.x = rotX;
    tapa.position.y = y;
    return tapa;
  };

  const meshBottom = crearTapa(-0.35, -Math.PI / 2);
  const meshTop = crearTapa(altura, Math.PI / 2);

  // --- Grupo final ---
  const group = new THREE.Group();
  group.add(mesh, meshBottom, meshTop);

  return group;
}
