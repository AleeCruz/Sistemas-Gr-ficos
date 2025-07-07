import * as THREE from 'three';
import { ParametricGeometry } from 'three/examples/jsm/geometries/ParametricGeometry.js';

/**
 * Crea un hexágono que asciende en Y y cambia de escala durante el recorrido,
 * usando geometría paramétrica. Incluye tapas superior e inferior con soporte para texturas.
 */
export function crearHexagonoEscaladoBarridoParametrico(
  radio = 0.35,
  altura = 2.55,
  pasosAltura = 40,
  pasosContorno = 10,
  escalaMaxima = 0.68,
  color = 0xff4500,
  wireframe = false,
  texturaURL = "textures/ventana4.png",   // <-- NUEVO: URL de la textura
  repetirUV_X = 2,     // <-- NUEVO: Repeticiones en U (alrededor del perímetro)
  repetirUV_Y = 2.5      // <-- NUEVO: Repeticiones en V (a lo largo de la altura)
) {
  const lados = 6;
  const anguloPaso = (2 * Math.PI) / lados;

  // Función paramétrica: u (0 a 1 en altura), v (0 a 1 en contorno)
  const superficieParametrica = (v_contorno, u_altura, target) => {
    const t = u_altura; // 't' representa la proporción de la altura recorrida (0 a 1)
    const y = t * altura - 0.35; // Tu ajuste de la base

    // La escala varía a lo largo de la altura, usando una función seno para una curva suave
    const scale = 1 - (1 - escalaMaxima) * Math.sin(Math.PI * t);

    const ang = v_contorno * 2 * Math.PI; // Ángulo completo alrededor del hexágono (0 a 2*PI)
    const sector = Math.floor(ang / anguloPaso);
    const local = (ang % anguloPaso) / anguloPaso;

    const a1 = sector * anguloPaso;
    const a2 = (sector + 1) * anguloPaso;

    // Puntos de los vértices del hexágono para el sector actual, aplicamos la escala
    const x1 = Math.cos(a1) * radio * scale;
    const z1 = Math.sin(a1) * radio * scale;
    const x2 = Math.cos(a2) * radio * scale;
    const z2 = Math.sin(a2) * radio * scale;

    // Interpolación lineal entre los vértices para suavizar el perfil del hexágono
    const x = (1 - local) * x1 + local * x2;
    const z = (1 - local) * z1 + local * z2;

    target.set(x, y, z);
  };

  // --- Geometría del cuerpo lateral ---
  const cuerpo = new ParametricGeometry(superficieParametrica, pasosContorno, pasosAltura);
  cuerpo.computeVertexNormals();

  // --- Material ---
  let material;
  if (texturaURL) {
    const texture = new THREE.TextureLoader().load(texturaURL);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(repetirUV_X, repetirUV_Y);

    material = new THREE.MeshStandardMaterial({
      map: texture,
      side: THREE.DoubleSide,
      flatShading: false,
      metalness: 0.4,
      roughness: 0.5,
      wireframe: wireframe,
    });
  } else {
    material = new THREE.MeshStandardMaterial({
      color: color,
      side: THREE.DoubleSide,
      flatShading: true,
      metalness: 0.4,
      roughness: 0.5,
      wireframe: wireframe
    });
  }

  const mallaCuerpo = new THREE.Mesh(cuerpo, material);

  // 🔽 Crear tapas (inferior y superior) con UVs corregidos
const crearTapa = (y, currentRadius, invertida = false, colorTapa = 0x333333) => {
  const materialTapa = new THREE.MeshStandardMaterial({
    color: colorTapa,
    side: THREE.DoubleSide,
    metalness: 0.3,
    roughness: 0.6
  });

  const vertices = [];
  const indices = [];
  const center = new THREE.Vector3(0, y, 0);
  vertices.push(center.x, center.y, center.z);

  for (let i = 0; i < lados; i++) {
    const angle = i * anguloPaso;
    const x = Math.cos(angle) * currentRadius;
    const z = Math.sin(angle) * currentRadius;
    vertices.push(x, y, z);
  }

  for (let i = 1; i <= lados; i++) {
    const a = 0;
    const b = i;
    const c = (i % lados) + 1;
    if (invertida) {
      indices.push(a, c, b);
    } else {
      indices.push(a, b, c);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  return new THREE.Mesh(geometry, materialTapa);
};


  const scaleBase = 1;
  const scaleTop = 1 - (1 - escalaMaxima) * Math.sin(Math.PI * 1);

  const tapaInferior = crearTapa(-0.35, radio * scaleBase, true);
  const tapaSuperior = crearTapa(altura - 0.35, radio * scaleTop, true);

  // Agrupar cuerpo y tapas
  const grupo = new THREE.Group();
  grupo.add(mallaCuerpo);
  grupo.add(tapaInferior);
  grupo.add(tapaSuperior);

  return grupo;
}
