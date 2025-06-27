import * as THREE from 'three';
import { ParametricGeometry } from 'three/examples/jsm/geometries/ParametricGeometry.js';

/**
 * Crea una elipse que se barre hacia arriba rotando, usando geometría paramétrica.
 * Incluye tapas superior e inferior trianguladas y soporte para texturas con repeticiones.
 */
export function crearElipseBarridoGirandoParametrico(
  radioX = 0.28, // Nuevo: radio a lo largo del eje X
  radioZ = 0.45, // Nuevo: radio a lo largo del eje Z
  altura = 2.35,
  pasosAltura = 50,
  pasosPerfil = 30, // Representa el número de segmentos alrededor de la elipse
  rotacionTotalRad = (Math.PI) + Math.PI / 2,
  color = 0x1a2b3c,
  wireframe = false,
  texturaURL = "textures/ventana6.jpg", // <--- NUEVO: URL de la textura
  repetirUV_X = 1,   // <--- NUEVO: Repeticiones en el eje U (horizontal)
  repetirUV_Y = 2    // <--- NUEVO: Repeticiones en el eje V (vertical)
) {
  const puntosInferior = [];
  const puntosSuperior = [];

  // 🧠 Función paramétrica (u: altura, v: ángulo de la elipse)
  // ParametricGeometry usa 'u' como el primer parámetro (pasosPerfil) y 'v' como el segundo (pasosAltura)
  // Por lo tanto, 'u' mapea el perfil (elipse) y 'v' mapea la altura.
  const superficieParametrica = (v_perfil, u_altura, target) => { // Renombré para claridad
    // 'u_altura' va de 0 a 1, mapeando la altura
    const y = u_altura * altura - 0.35; // Mantengo tu -0.35 para la base
    const angle = u_altura * rotacionTotalRad; // Rotación total aplicada a la altura

    // 'v_perfil' va de 0 a 1, mapeando el perfil de la elipse
    const profileAngle = v_perfil * Math.PI * 2; // Ángulo para el contorno de la elipse (0 a 2*PI)

    // Coordenadas x, z de la elipse base
    let x = radioX * Math.cos(profileAngle);
    let z = radioZ * Math.sin(profileAngle);

    // Aplicar la rotación del barrido
    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);
    const xr = cosA * x - sinA * z;
    const zr = sinA * x + cosA * z;

    if (u_altura === 0) puntosInferior.push(new THREE.Vector3(xr, y, zr));
    if (u_altura === 1) puntosSuperior.push(new THREE.Vector3(xr, y, zr));

    target.set(xr, y, zr);
  };

  // Geometría lateral de la elipse
  // ParametricGeometry genera automáticamente las UVs (u, v) de 0 a 1
  // donde 'u' corresponde al primer parámetro (v_perfil aquí) y 'v' al segundo (u_altura aquí).
  const geometry = new ParametricGeometry(superficieParametrica, pasosPerfil, pasosAltura);
  geometry.computeVertexNormals();

  // --- Material ---
  let material;
  if (texturaURL) {
    const texture = new THREE.TextureLoader().load(texturaURL);
    texture.wrapS = THREE.RepeatWrapping; // Repetición horizontal
    texture.wrapT = THREE.RepeatWrapping; // Repetición vertical
    texture.repeat.set(repetirUV_X, repetirUV_Y); // Aplicar las repeticiones

    material = new THREE.MeshStandardMaterial({
      map: texture, // Usar la textura
      side: THREE.DoubleSide, // Renderizar ambos lados
      flatShading: false, // Mejor con texturas para suavizar normales
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

  // Función auxiliar para crear una tapa triangulada con UVs
  const crearTapa = (puntos, reverse = false) => {
    const center = new THREE.Vector3(0, puntos[0].y, 0); // El centro de la elipse es (0,y,0)
    const vertices = [];
    const indices = [];
    const tapaUvs = []; // Array para las UVs de la tapa

    // Añadir el centro a los vértices y sus UVs
    vertices.push(center.x, center.y, center.z);
    tapaUvs.push(0.5 * repetirUV_X, 0.5 * repetirUV_Y); // UV del centro (0.5, 0.5)

    // Calculamos los rangos para normalizar las UVs
    const minX = Math.min(...puntos.map(p => p.x));
    const maxX = Math.max(...puntos.map(p => p.x));
    const minZ = Math.min(...puntos.map(p => p.z));
    const maxZ = Math.max(...puntos.map(p => p.z));

    const rangeX = maxX - minX;
    const rangeZ = maxZ - minZ;

    // Si los radios son muy pequeños, rangeX o rangeZ podrían ser 0 o casi 0.
    // Esto podría causar división por cero o resultados erróneos.
    // Añadimos una pequeña cantidad para evitarlo.
    const safeRangeX = rangeX > 0.0001 ? rangeX : 1;
    const safeRangeZ = rangeZ > 0.0001 ? rangeZ : 1;


    for (let i = 0; i < puntos.length; i++) {
      const p1 = puntos[i];
      const p2 = puntos[(i + 1) % puntos.length];

      // Los vértices de cada triángulo: centro, p1, p2
      vertices.push(p1.x, p1.y, p1.z);
      vertices.push(p2.x, p2.y, p2.z);

      // Calcular UVs para p1 y p2
      // Proyección cilíndrica o planar: mapeamos X a U y Z a V
      // Normalizamos la posición dentro del rango de la elipse
      const u_p1 = (p1.x - minX) / safeRangeX;
      const v_p1 = (p1.z - minZ) / safeRangeZ;

      const u_p2 = (p2.x - minX) / safeRangeX;
      const v_p2 = (p2.z - minZ) / safeRangeZ;

      // Aplicar las repeticiones a las UVs de los vértices
      tapaUvs.push(u_p1 * repetirUV_X, v_p1 * repetirUV_Y);
      tapaUvs.push(u_p2 * repetirUV_X, v_p2 * repetirUV_Y);

      // Índices para formar los triángulos
      // El centro es el índice 0 en `vertices`
      const baseIndex = i * 2 + 1; // Índices de p1 y p2 dentro del array `vertices` (después del centro)
      if (!reverse) {
        indices.push(0, baseIndex, baseIndex + 1); // Triángulo: Centro, P1, P2
      } else {
        indices.push(0, baseIndex + 1, baseIndex); // Triángulo: Centro, P2, P1 (para invertir la normal)
      }
    }

    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geom.setIndex(indices);
    geom.setAttribute('uv', new THREE.Float32BufferAttribute(tapaUvs, 2)); // Asignar las UVs
    geom.computeVertexNormals();

    return new THREE.Mesh(geom, material);
  };

  // Crear tapas
  const tapaInferior = crearTapa(puntosInferior, false);
  const tapaSuperior = crearTapa(puntosSuperior, true);

  // Devolver un grupo con todo
  const grupo = new THREE.Group();
  grupo.add(lateralMesh);
  grupo.add(tapaInferior);
  grupo.add(tapaSuperior);

  return grupo;
}