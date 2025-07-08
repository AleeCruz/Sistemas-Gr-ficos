import * as THREE from 'three';
import { ParametricGeometry } from 'three/examples/jsm/geometries/ParametricGeometry.js';

export function crearElipse_Parametric_2(
  radiusX = 0.45,
  radiusY = 0.28,
  altura = 2,
  segmentsU = 60,
  segmentsV = 30,
  color = 0x7FFFD4,
  texturaURL = "textures/ventana3.png", // ¡Ahora puedes pasar una URL de textura!
  repetirU = 3,      // Repeticiones en dirección horizontal (alrededor de la elipse)
  repetirV = 4       // Repeticiones en dirección vertical (a lo largo de la altura)
) {
  // --- Función paramétrica para el cuerpo ---
  const parametricFunction = (u, v, target) => {
    const theta = u * 2 * Math.PI;
    const y = -0.35 + v * (altura + 0.35); // La coordenada Y va desde -0.35 hasta 'altura'
    const x = radiusX * Math.cos(theta);
    const z = radiusY * Math.sin(theta);
    target.set(x, y, z);
  };

  // --- Crear geometría del cuerpo ---
  const geometry = new ParametricGeometry(parametricFunction, segmentsU, segmentsV);
  geometry.computeVertexNormals(); // Asegurarse de que las normales estén calculadas para la iluminación

  // --- Mapeo UV para el cuerpo ---
  const uvsBody = [];
  // `segmentsU + 1` y `segmentsV + 1` son el número de vértices en cada dirección
  // porque una geometría con N segmentos tiene N+1 vértices.
  for (let iv = 0; iv <= segmentsV; iv++) {
    for (let iu = 0; iu <= segmentsU; iu++) {
      const u = iu / segmentsU; // Normaliza u de 0 a 1
      const v = iv / segmentsV; // Normaliza v de 0 a 1
      uvsBody.push(u * repetirU, v * repetirV); // Aplica las repeticiones aquí
    }
  }
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvsBody, 2));

  // --- Cargar textura y configurar material ---
  let material;
  if (texturaURL) {
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load(texturaURL,
      () => { /* Callback de carga exitosa */ },
      undefined, // Callback de progreso
      (err) => { console.error('Error al cargar la textura:', err); } // Callback de error
    );
    texture.wrapS = THREE.RepeatWrapping; // Repetir horizontalmente
    texture.wrapT = THREE.RepeatWrapping; // Repetir verticalmente
    // Las repeticiones ya se aplicaron en el cálculo UV,
    // pero si quisieras usar `texture.repeat.set()`, lo harías aquí:
    // texture.repeat.set(repetirU, repetirV);
    // Y en ese caso, en los UVs harías: uvsBody.push(u, v);

    material = new THREE.MeshStandardMaterial({
      map: texture,
      side: THREE.DoubleSide // Para que la textura se vea en ambos lados de la superficie
    });
  } else {
    // Si no se proporciona URL de textura, usar solo color
    material = new THREE.MeshStandardMaterial({
      color: color,
      side: THREE.DoubleSide,
      wireframe: false
    });
  }

  // --- Malla del cuerpo ---
  const mesh = new THREE.Mesh(geometry, material);

  // --- Creación de las tapas (con mapeo UV radial) ---
  const crearTapa = (yPos, rotX) => {
    const circleGeometry = new THREE.CircleGeometry(1, segmentsU); // Radio 1
    // Escalar la geometría del círculo para que coincida con la elipse
    circleGeometry.scale(radiusX, radiusY, 1);

    const positions = circleGeometry.attributes.position.array;
    const uvsTapa = [];

    // Mapeo UV radial para la tapa (proyecta la textura desde el centro)
    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i];   // Coordenada X del vértice de la tapa (ya escalada)
      const z = positions[i+2]; // Coordenada Z del vértice de la tapa (ya escalada)

      // Normaliza x y z al rango [-1, 1] respecto a los radios de la elipse
      const nx = x / radiusX;
      const nz = z / radiusY;

      // Mapea a coordenadas UV [0, 1]
      // 0.5 + nx * 0.5 lleva [-1, 1] a [0, 1]
      uvsTapa.push(0.5 + nx * 0.5, 0.5 + nz * 0.5);
    }
    circleGeometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvsTapa, 2));

    const tapaMesh = new THREE.Mesh(circleGeometry, material);
    tapaMesh.rotation.x = rotX;
    tapaMesh.position.y = yPos;
    return tapaMesh;
  };

  // Crear y añadir tapas
  const meshBottom = crearTapa(-0.35, -Math.PI / 2); // Tapa inferior en y = -0.35
  const meshTop = crearTapa(altura, Math.PI / 2);     // Tapa superior en y = altura

  // --- Grupo para unir cuerpo + tapas ---
  const group = new THREE.Group();
  group.add(mesh);
  group.add(meshBottom);
  group.add(meshTop);

  return group;
}