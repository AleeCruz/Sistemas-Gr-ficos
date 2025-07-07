import * as THREE from 'three';
import { scene } from './scene.js';
import { ParametricGeometry } from 'three/examples/jsm/geometries/ParametricGeometry.js';
import { crearCurva } from './curva.js'; // Importa la función crearCurva desde curva.js

function crearCalleConParametricGeometry() {
  const curva = crearCurva();

  const ancho = 0.7;
  const superficieParametrica = (u, v, target) => {
    const p = curva.getPointAt(u);
    const tangente = curva.getTangentAt(u);
    const normal = new THREE.Vector3(0, 1, 0);
    const binormal = new THREE.Vector3();
    binormal.crossVectors(normal, tangente).normalize();

    const desplazamiento = binormal.multiplyScalar((v - 0.5) * ancho);
    const puntoFinal = new THREE.Vector3().copy(p).add(desplazamiento);

    target.set(puntoFinal.x, puntoFinal.y + 0.02, puntoFinal.z);
  };

  const pasosU = 400; // Segmentos a lo largo de la curva
  const pasosV = 4;   // Segmentos a lo ancho de la calle

  const geometry = new ParametricGeometry(superficieParametrica, pasosU, pasosV);

  // --- 1. Cargar la textura ---
  const textureLoader = new THREE.TextureLoader();
  const texturaAsfalto = textureLoader.load('textures/asfalto.jpg');

  // Ajusta cómo se repite la textura
  texturaAsfalto.wrapS = THREE.RepeatWrapping; // Repetir horizontalmente
  texturaAsfalto.wrapT = THREE.RepeatWrapping; // Repetir verticalmente

  // Estos valores determinan cuántas veces se repite la textura.
  // Ajusta 'repeatX' para la repetición a lo ancho de la calle.
  // Ajusta 'repeatY' para la repetición a lo largo de la calle.
  // La longitud de la curva y el ancho de la calle influyen aquí.
  // Un buen punto de partida es un valor pequeño para el ancho y uno más grande para el largo.
  const repeatX = 1; // La textura de asfalto generalmente cubre el ancho de la calle una vez o un par de veces
  const repeatY = 50; // La textura se repetirá 50 veces a lo largo de la calle. Ajusta según la longitud de tu curva.
  
  texturaAsfalto.repeat.set(repeatX, repeatY);

texturaAsfalto.rotation = Math.PI / 2; // Rota la textura 90 grados (en radianes)

  // Opcional: El punto de pivote de la rotación. Por defecto es (0,0), la esquina inferior izquierda.
  // Para rotar alrededor del centro de la textura:
  texturaAsfalto.center.set(0.5, 0.5); // Establece el centro de rotación en el centro de la textura




  // --- 2. Asignar la textura al material ---
  const material = new THREE.MeshStandardMaterial({
    map: texturaAsfalto, // ¡Aquí aplicamos la textura!
    color: 0xffffff, // El color blanco permite que la textura se vea con sus colores originales
    side: THREE.DoubleSide,
    flatShading: true,
    // wireframe: false // Puedes comentar o dejar esto, no afecta la textura
  });

  // --- 3. Ajustar UVs (Coordenadas de Textura) ---
  // La ParametricGeometry ya crea UVs por defecto (u, v), que son perfectos para esto.
  // u va de 0 a 1 a lo largo de la curva (simulando la longitud de la calle).
  // v va de 0 a 1 a lo ancho de la calle.
  // Solo necesitamos asegurarnos de que el material repita la textura correctamente.
  // No se requiere código adicional para los UVs aquí, ya que ParametricGeometry los maneja bien.
  // Las propiedades `wrapS` y `wrapT` junto con `repeat.set()` en la textura son clave.


  const malla = new THREE.Mesh(geometry, material);
  scene.add(malla);

  return { malla, curva };
}

const { malla, curva: catmullRomCurve } = crearCalleConParametricGeometry();

export {
  catmullRomCurve,
  malla as mallaSuperficie,
};