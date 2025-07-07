import * as THREE from 'three';
import { ParametricGeometry } from 'three/examples/jsm/geometries/ParametricGeometry.js';

/**
 * Crea un cuadrado que se barre hacia arriba rotando, usando geometría paramétrica.
 * Incluye tapas superior e inferior trianguladas y soporte para texturas con repeticiones.
 */
export function crearCuadradoBarridoGirandoParametrico(
  lado = 0.6,
  altura = 2.9,
  pasosAltura = 79,
  pasosPerfil = 30,
  rotacionTotalRad = (3 * Math.PI) / 4,
  color = 0xffffff,
  wireframe = false,
  texturaURL = "textures/ventana1.png",
  repetirUV_X = 3,
  repetirUV_Y = 6
) {
  const half = lado / 2;
  const puntosInferior = [];
  const puntosSuperior = [];

  // --- Función paramétrica (cuerpo lateral) ---
  const superficieParametrica = (u_perfil, v_altura, target) => {
    // u_perfil va de 0 a 1, v_altura va de 0 a 1
    const y = v_altura * altura-0.35; // Altura se mapea directamente a 'y'
    const angle = v_altura * rotacionTotalRad; // La rotación depende de la altura

    let x = 0, z = 0;
    // Esto mapea el u_perfil (0 a 1) a los 4 lados del cuadrado
    const p = u_perfil * 4;
    if (p < 1) { // Lado inferior
      x = -half + p * lado;
      z = -half;
    } else if (p < 2) { // Lado derecho
      x = half;
      z = -half + (p - 1) * lado;
    } else if (p < 3) { // Lado superior
      x = half - (p - 2) * lado;
      z = half;
    } else { // Lado izquierdo
      x = -half;
      z = half - (p - 3) * lado;
    }

    // Aplicar rotación
    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);
    const xr = cosA * x - sinA * z;
    const zr = sinA * x + cosA * z;

    // Almacenar puntos para las tapas (solo en los extremos de la altura)
    if (v_altura === 0) {
        puntosInferior.push(new THREE.Vector3(xr, y, zr));
    }
    if (v_altura === 1) {
        puntosSuperior.push(new THREE.Vector3(xr, y, zr));
    }

    target.set(xr, y, zr);
  };

  // --- Geometría del cuerpo lateral ---
  // ParametricGeometry genera automáticamente las UVs (u, v) de 0 a 1
  const geometry = new ParametricGeometry(superficieParametrica, pasosPerfil, pasosAltura);
  geometry.computeVertexNormals();

  // --- Cargar textura o color plano ---
  let material;
  if (texturaURL) {
    const texture = new THREE.TextureLoader().load(texturaURL);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    // Aquí es donde la repetición de la textura es efectiva con las UVs generadas por ParametricGeometry
    texture.repeat.set(repetirUV_X, repetirUV_Y);

    material = new THREE.MeshStandardMaterial({
      map: texture,
      side: THREE.DoubleSide, // Importante para ver ambos lados
      flatShading: false,
      wireframe: wireframe,
    });
  } else {
    material = new THREE.MeshStandardMaterial({
      color: color,
      side: THREE.DoubleSide,
      flatShading: true,
      wireframe: wireframe
    });
  }

  const lateralMesh = new THREE.Mesh(geometry, material);

  // --- Tapas trianguladas ---
  const crearTapa = (puntos, reverse = false) => {
    const center = puntos.reduce((acc, p) => acc.add(p.clone()), new THREE.Vector3()).multiplyScalar(1 / puntos.length);
    const vertices = [];
    const indices = [];
    const tapaUvs = [];

    // Añadir el centro
    vertices.push(center.x, center.y, center.z);
    // UV del centro: mapear al centro de la textura (0.5, 0.5)
    tapaUvs.push(0.5 * repetirUV_X, 0.5 * repetirUV_Y);

    // Bounding box para calcular UVs relativas
    const minX = Math.min(...puntos.map(p => p.x));
    const maxX = Math.max(...puntos.map(p => p.x));
    const minZ = Math.min(...puntos.map(p => p.z));
    const maxZ = Math.max(...puntos.map(p => p.z));
    const rangeX = maxX - minX;
    const rangeZ = maxZ - minZ;

    for (let i = 0; i < puntos.length; i++) {
      const p1 = puntos[i];
      const p2 = puntos[(i + 1) % puntos.length];

      vertices.push(p1.x, p1.y, p1.z);
      vertices.push(p2.x, p2.y, p2.z);

      // Calcular UVs basadas en la posición relativa dentro del rango de la tapa
      // Normalizar entre 0 y 1 y luego aplicar repetición
      const u_p1 = (p1.x - minX) / rangeX;
      const v_p1 = (p1.z - minZ) / rangeZ; // Usamos Z para el eje Y de la textura en el plano
      const u_p2 = (p2.x - minX) / rangeX;
      const v_p2 = (p2.z - minZ) / rangeZ;

      tapaUvs.push(u_p1 * repetirUV_X, v_p1 * repetirUV_Y);
      tapaUvs.push(u_p2 * repetirUV_X, v_p2 * repetirUV_Y);

      const baseIndex = i * 2 + 1;
      if (!reverse) {
        indices.push(0, baseIndex, baseIndex + 1);
      } else {
        indices.push(0, baseIndex + 1, baseIndex); // Invertir orden para la cara opuesta
      }
    }

    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geom.setIndex(indices);
    geom.setAttribute('uv', new THREE.Float32BufferAttribute(tapaUvs, 2));
    geom.computeVertexNormals();

    return new THREE.Mesh(geom, material);
  };

  // Asegurarse de que los puntos de las tapas estén en el orden correcto
  // La parametric geometry genera los puntos en sentido horario o antihorario
  // Dependiendo de cómo se recorre el perfil.
  // Es posible que necesites ordenar los puntosInferior/Superior si no vienen en orden secuencial
  // (aunque para un cuadrado simple, deberían estarlo).
  // Si experimentas problemas con las tapas, revisa el orden de 'puntosInferior' y 'puntosSuperior'.
  // Para un cuadrado, generalmente ya están en orden.

  const tapaInferior = crearTapa(puntosInferior, false);
  const tapaSuperior = crearTapa(puntosSuperior, true); // La tapa superior normalmente necesita estar invertida para que las normales miren hacia afuera

  // --- Grupo final ---
  const grupo = new THREE.Group();
  grupo.add(lateralMesh);
  grupo.add(tapaInferior);
  grupo.add(tapaSuperior);

  return grupo;
}