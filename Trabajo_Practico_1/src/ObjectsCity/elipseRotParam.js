import * as THREE from 'three';
import { ParametricGeometry } from 'three/examples/jsm/geometries/ParametricGeometry.js';

export function crearElipseBarridoGirandoParametrico(
  radioX = 0.28,
  radioZ = 0.45,
  altura = 2.35,
  pasosAltura = 50,
  pasosPerfil = 30,
  rotacionTotalRad = Math.PI + Math.PI / 2,
  texturaURL = "textures/ventana6.png",
  wireframe = false,
  repetirUV_X = 3,
  repetirUV_Y = 4
) {
  const puntosInferior = [];
  const puntosSuperior = [];

  const textura = new THREE.TextureLoader().load(texturaURL);
  textura.wrapS = THREE.RepeatWrapping;
  textura.wrapT = THREE.RepeatWrapping;
  textura.repeat.set(repetirUV_X, repetirUV_Y); // Escalado de la textura

  // Función paramétrica (u: altura, v: perfil de elipse)
  const superficieParametrica = (u, v, target) => {
    const y = u * altura - 0.35;
    const angle = u * rotacionTotalRad;
    const profileAngle = v * Math.PI * 2;

    let x = radioX * Math.cos(profileAngle);
    let z = radioZ * Math.sin(profileAngle);

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
    wireframe: wireframe,
  });

  const lateralMesh = new THREE.Mesh(geometry, material);

  // Crear tapas trianguladas
  const crearTapa = (puntos, reverse = false) => {
    const center = new THREE.Vector3(0, puntos[0].y, 0);
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
