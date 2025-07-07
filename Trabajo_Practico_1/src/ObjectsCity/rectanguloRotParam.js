import * as THREE from 'three';
import { ParametricGeometry } from 'three/examples/jsm/geometries/ParametricGeometry.js';

export function crearRectanguloBarridoGirandoParametrico(
  ladoX = 0.4,
  ladoZ = 0.8,
  altura = 2.35,
  pasosAltura = 60,
  pasosPerfil = 30,
  rotacionTotalRad = (3 * Math.PI) / 4,
  texturaURL = 'textures/ventana5.png',
  wireframe = false,
  repetirUV_X = 3,
  repetirUV_Y = 5
) {
  const halfX = ladoX / 2;
  const halfZ = ladoZ / 2;
  const puntosInferior = [];
  const puntosSuperior = [];

  const textureLoader = new THREE.TextureLoader();
  const textura = textureLoader.load(texturaURL);
  textura.wrapS = textura.wrapT = THREE.RepeatWrapping;
  textura.repeat.set(repetirUV_X, repetirUV_Y); // ← Aquí se aplica la repetición

  const superficieParametrica = (u, v, target) => {
    const y = u * altura - 0.35;
    const angle = u * rotacionTotalRad;

    let x = 0, z = 0;
    const p = v * 2 * (ladoX + ladoZ); // recorre el perímetro

    if (p < ladoX) {
      x = -halfX + p;
      z = -halfZ;
    } else if (p < ladoX + ladoZ) {
      x = halfX;
      z = -halfZ + (p - ladoX);
    } else if (p < 2 * ladoX + ladoZ) {
      x = halfX - (p - (ladoX + ladoZ));
      z = halfZ;
    } else {
      x = -halfX;
      z = halfZ - (p - (2 * ladoX + ladoZ));
    }

    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);
    const xr = cosA * x - sinA * z;
    const zr = sinA * x + cosA * z;

    if (u === 0) puntosInferior.push(new THREE.Vector3(xr, y, zr));
    if (u === 1) puntosSuperior.push(new THREE.Vector3(xr, y, zr));

    target.set(xr, y, zr);
  };

  const geometry = new ParametricGeometry(superficieParametrica, pasosPerfil, pasosAltura);
  geometry.computeVertexNormals();

  const material = new THREE.MeshStandardMaterial({
    map: textura,
    side: THREE.DoubleSide,
    flatShading: false,
    wireframe: wireframe
  });

  const lateralMesh = new THREE.Mesh(geometry, material);

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
      } else {
        vertices.push(p0.x, p0.y, p0.z, p2.x, p2.y, p2.z, p1.x, p1.y, p1.z);
      }

      const base = i * 3;
      indices.push(base, base + 1, base + 2);
    }

    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geom.setIndex(indices);
    geom.computeVertexNormals();

    return new THREE.Mesh(geom, material);
  };

  const tapaInferior = crearTapa(puntosInferior, false);
  const tapaSuperior = crearTapa(puntosSuperior, true);

  const grupo = new THREE.Group();
  grupo.add(lateralMesh);
  grupo.add(tapaInferior);
  grupo.add(tapaSuperior);

  return grupo;
}
