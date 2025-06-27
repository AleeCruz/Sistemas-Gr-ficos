import * as THREE from 'three';
import { ParametricGeometry } from 'three/examples/jsm/geometries/ParametricGeometry.js';

/**
 * Crea un hexágono que asciende en Y y cambia de escala durante el recorrido,
 * usando geometría paramétrica. Incluye tapas superior e inferior con soporte para texturas.
 */
export function crearHexagonoEscaladoBarridoParametrico(
  radio = 0.35,
  altura = 2.35,
  pasosAltura = 40,
  pasosContorno = 10,
  escalaMaxima = 0.68,
  color = 0xff4500,
  wireframe = false,
  texturaURL = "textures/ventana7.jpg",   // <-- NUEVO: URL de la textura
  repetirUV_X = 1,     // <-- NUEVO: Repeticiones en U (alrededor del perímetro)
  repetirUV_Y = 1      // <-- NUEVO: Repeticiones en V (a lo largo de la altura)
) {
  const lados = 6;
  const anguloPaso = (2 * Math.PI) / lados;

  // Función paramétrica: u (0 a 1 en altura), v (0 a 1 en contorno)
  // Renombramos 'u' a 'v_contorno' y 'v' a 'u_altura' para mayor claridad
  // Ya que ParametricGeometry usa el primer parámetro para 'u' y el segundo para 'v'.
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
  // ParametricGeometry genera automáticamente las UVs (u, v) de 0 a 1 para el cuerpo.
  // 'u' corresponderá a v_contorno (horizontal) y 'v' a u_altura (vertical).
  const cuerpo = new ParametricGeometry(superficieParametrica, pasosContorno, pasosAltura);
  cuerpo.computeVertexNormals();

  // --- Material ---
  let material;
  if (texturaURL) {
    const texture = new THREE.TextureLoader().load(texturaURL);
    texture.wrapS = THREE.RepeatWrapping; // Permite la repetición horizontal
    texture.wrapT = THREE.RepeatWrapping; // Permite la repetición vertical
    texture.repeat.set(repetirUV_X, repetirUV_Y); // Aplica el número de repeticiones

    material = new THREE.MeshStandardMaterial({
      map: texture, // Usa la textura
      side: THREE.DoubleSide, // Renderiza ambos lados
      flatShading: false, // Generalmente se ve mejor para texturas
      metalness: 0.4, // Mantienes tus propiedades de metalness/roughness
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

  // 🔽 Crear tapas (inferior y superior) con UVs
  const crearTapa = (y, currentRadius, invertida = false) => { // currentRadius es el radio del hexágono en esa tapa
    const vertices = []; // Puntos del contorno
    const posiciones = []; // Array para los atributos de posición
    const uvs = [];         // Array para los atributos UV

    const center = new THREE.Vector3(0, y, 0); // Centro de la tapa
    posiciones.push(center.x, center.y, center.z);
    uvs.push(0.5 * repetirUV_X, 0.5 * repetirUV_Y); // UV del centro de la tapa

    // Generar vértices del hexágono para el contorno de la tapa
    for (let i = 0; i < lados; i++) {
      const ang = i * anguloPaso;
      const x = Math.cos(ang) * currentRadius; // Usar currentRadius para la escala de la tapa
      const z = Math.sin(ang) * currentRadius;
      vertices.push(new THREE.Vector3(x, y, z));
      posiciones.push(x, y, z);

      // Calcular UVs para los puntos del contorno
      // Normalizar la posición (x,z) dentro del cuadrado que encierra la tapa
      // Asumiendo que el centro (0,0) de la tapa se mapea a (0.5, 0.5) de la textura.
      // Y los bordes van de -currentRadius a +currentRadius.
      const u_coord = (x / currentRadius) * 0.5 + 0.5; // Mapea de [-1,1] a [0,1]
      const v_coord = (z / currentRadius) * 0.5 + 0.5; // Mapea de [-1,1] a [0,1]
      uvs.push(u_coord * repetirUV_X, v_coord * repetirUV_Y);
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(posiciones, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2)); // Asignar UVs a la tapa

    // Crear índices para la triangulación desde el centro
    const indices = [];
    for (let i = 1; i <= lados; i++) {
      const a = 0; // Índice del centro
      const b = i; // Índice del primer vértice del segmento (en `posiciones`)
      const c = (i % lados) + 1; // Índice del segundo vértice del segmento (en `posiciones`)
      if (invertida) {
        indices.push(a, c, b); // Orden invertido para la normal de la tapa
      } else {
        indices.push(a, b, c);
      }
    }

    geometry.setIndex(indices);
    geometry.computeVertexNormals();

    return new THREE.Mesh(geometry, material);
  };

  // Calcular las escalas de las tapas para que coincidan con la forma del cuerpo
  // La escala en t=0 (base) es 1 - (1 - escalaMaxima) * sin(0) = 1
  const scaleBase = 1;
  // La escala en t=1 (cima) es 1 - (1 - escalaMaxima) * sin(PI) = 1
  // Ojo: si quieres que la tapa superior tenga la escala del punto más "estrecho"
  // de tu sinusoide, deberías calcular 't' para ese punto.
  // Tu fórmula de escala: 1 - (1 - escalaMaxima) * Math.sin(Math.PI * t)
  // El mínimo de sin(PI*t) es cuando PI*t = PI/2, es decir t = 0.5
  const scaleTop = 1 - (1 - escalaMaxima) * Math.sin(Math.PI * 1); // En t=1 (arriba)

  // Si quieres que la tapa superior tenga el tamaño del punto de 'escalaMaxima'
  // const scaleMinPoint = escalaMaxima;
  // const tapaSuperior = crearTapa(altura - 0.35, radio * scaleMinPoint, false);
  // Pero con tu fórmula de seno, la escala en la cima vuelve a ser 1.
  const tapaInferior = crearTapa(-0.35, radio * scaleBase, true); // La escala de la base es radio * 1
  const tapaSuperior = crearTapa(altura - 0.35, radio * scaleTop, false); // La escala de la cima es radio * 1 (por sin(PI))


  // Agrupar cuerpo y tapas
  const grupo = new THREE.Group();
  grupo.add(mallaCuerpo);
  grupo.add(tapaInferior);
  grupo.add(tapaSuperior);

  return grupo;
}