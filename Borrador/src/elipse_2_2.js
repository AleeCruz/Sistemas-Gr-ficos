import * as THREE from 'three';
import { ParametricGeometry } from 'three/examples/jsm/geometries/ParametricGeometry.js';

export function crearElipse_Parametric_2(
  radiusX = 0.45,
  radiusY = 0.28,
  altura = 2,
  segmentsU = 60,
  segmentsV = 30,
  color = 0x7FFFD4
) {
  const parametricFunction = (u, v, target) => {
    const theta = u * 2 * Math.PI;
    const y = -0.35 + v * (altura + 0.35);

    const x = radiusX * Math.cos(theta);
    const z = radiusY * Math.sin(theta);

    target.set(x, y, z);
  };

  const geometry = new ParametricGeometry(parametricFunction, segmentsU, segmentsV);
  geometry.computeVertexNormals();

  const material = new THREE.MeshStandardMaterial({
    color: color,
    side: THREE.DoubleSide,
    wireframe: false
  });

  // Malla de la superficie paramétrica (el "cuerpo")
  const mesh = new THREE.Mesh(geometry, material);

  // --- TAPAS ---

  // Tapa inferior (círculo en y = -0.35)
  const geometryBottom = new THREE.CircleGeometry(1, segmentsU); // radio 1, luego lo escalamos
  // Escalamos la tapa para que coincida con la elipse (radioX, radioY)
  geometryBottom.scale(radiusX, radiusY, 1);
  const meshBottom = new THREE.Mesh(geometryBottom, material);
  meshBottom.rotation.x = -Math.PI / 2; // girar para que quede plana en horizontal
  meshBottom.position.y = -0.35;        // colocar en la base

  // Tapa superior (círculo en y = altura)
  const geometryTop = new THREE.CircleGeometry(1, segmentsU);
  geometryTop.scale(radiusX, radiusY, 1);
  const meshTop = new THREE.Mesh(geometryTop, material);
  meshTop.rotation.x = Math.PI / 2;     // girar para que quede plana y mirando hacia abajo
  meshTop.position.y = altura;

  // Grupo para unir cuerpo + tapas
  const group = new THREE.Group();
  group.add(mesh);
  group.add(meshBottom);
  group.add(meshTop);

  return group;
}
