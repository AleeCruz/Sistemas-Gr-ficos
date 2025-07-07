import * as THREE from 'three';
import { ParametricGeometry } from 'three/examples/jsm/geometries/ParametricGeometry.js';

export function crearElipse_Parametric(
  radiusX = 0.28,
  radiusY = 0.45,
  altura = 1.6,
  segmentsU = 64,
  segmentsV = 30,
  color = 0xDAA520,
  texturaURL = 'textures/ventana2.png',
  repeticionesY = 2.6
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
 // Crear material para las tapas (color plano)
const materialTapa = new THREE.MeshStandardMaterial({
  color: 0x333333, // Puedes cambiarlo por otro si querés
  side: THREE.DoubleSide,
  metalness: 0.3,
  roughness: 0.6
});

// Reemplazamos crearTapa con esta versión corregida (sin textura)
const crearTapa = (y, invertida = false) => {
  const vertices = [];
  const indices = [];

  const center = new THREE.Vector3(0, y, 0);
  vertices.push(center.x, center.y, center.z);

  for (let i = 0; i <= segmentsU; i++) {
    const theta = (i / segmentsU) * 2 * Math.PI;
    const x = radiusX * Math.cos(theta);
    const z = radiusY * Math.sin(theta);
    vertices.push(x, y, z);
  }

  for (let i = 1; i <= segmentsU; i++) {
    const a = 0;
    const b = i;
    const c = i + 1;
    if (i === segmentsU) {
      indices.push(a, b, 1); // Cierra el último triángulo
    } else {
      if (invertida) {
        indices.push(a, c, b);
      } else {
        indices.push(a, b, c);
      }
    }
  }

  const geom = new THREE.BufferGeometry();
  geom.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geom.setIndex(indices);
  geom.computeVertexNormals();

  return new THREE.Mesh(geom, materialTapa);
};

// Crear tapas
const meshBottom = crearTapa(-0.35, false);
const meshTop = crearTapa(altura, true);

  // --- Grupo final ---
  const group = new THREE.Group();
  group.add(mesh, meshBottom, meshTop);

  return group;
}
