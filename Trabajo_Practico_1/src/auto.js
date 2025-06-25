import * as THREE from 'three';

/**
 * Crea un modelo de automóvil más pequeño, adecuado para una grilla de 10x10.
 * Las ruedas se configuran para poder rotar individualmente.
 *
 * @returns {THREE.Group} Un grupo THREE.Group que contiene el auto completo.
 */
export function crearAuto() {
  const auto = new THREE.Group();

  // --- Carrocería (escalada para ser más pequeña) ---
  // Dimensiones originales: 4 de largo, 1.5 de alto, 2 de ancho
  // Nuevas dimensiones: 1.2 de largo, 0.45 de alto, 0.6 de ancho (escalado ~0.3x)
  const cuerpoGeom = new THREE.BoxGeometry(0.8, 0.3, 0.4);
  const cuerpoMat = new THREE.MeshStandardMaterial({ color: 0x156289, metalness: 0.5, roughness: 0.6 });
  const cuerpo = new THREE.Mesh(cuerpoGeom, cuerpoMat);
  cuerpo.position.y = 0.25; // La mitad de la altura para que el "suelo" del auto esté en y=0
  auto.add(cuerpo);

  // --- Ruedas (más pequeñas y preparadas para girar) ---
  // Las ruedas serán grupos individuales para poder rotarlas fácilmente.
  const ruedaRadio = 0.1; // Radio de la rueda
  const ruedaAncho = 0.1; // Ancho de la rueda
  const ruedaGeom = new THREE.CylinderGeometry(ruedaRadio, ruedaRadio, ruedaAncho, 32); // Menos segmentos para optimizar
  const ruedaMat = new THREE.MeshStandardMaterial({ color: 0x333083, metalness: 0.7, roughness: 0.5 ,wireframe
:true
  });

  const posicionesRuedas = [
    [-0.3, ruedaRadio, 0.2],  // Delantera izquierda (X, Y, Z)
    [0.3, ruedaRadio, 0.2],   // Delantera derecha
    [-0.3, ruedaRadio, -0.2], // Trasera izquierda
    [0.3, ruedaRadio, -0.2],  // Trasera derecha
  ];

  // Almacenamos las referencias a las mallas de las ruedas para poder rotarlas más tarde
  const ruedasMallas = [];

  posicionesRuedas.forEach(pos => {
    const ruedaMesh = new THREE.Mesh(ruedaGeom, ruedaMat);
    // Para que la rueda gire correctamente sobre su eje, su geometría debe estar "acostada".
    // Esto se logra rotando la geometría sobre el eje X.
    ruedaMesh.rotation.x = -Math.PI / 2; // Gira 90 grados alrededor del eje X

    // Crea un grupo para cada rueda. Esto es útil si quieres añadir más detalles a la rueda
    // o para asegurar que la rotación se aplica correctamente desde su centro.
    const ruedaGrupo = new THREE.Group();
    ruedaGrupo.position.set(...pos); // Posiciona el grupo (y con ello, la rueda)
    ruedaGrupo.add(ruedaMesh);       // Añade la malla de la rueda al grupo

    auto.add(ruedaGrupo);
    ruedasMallas.push(ruedaMesh); // Guarda la referencia a la malla de la rueda
  });

  // Exportamos las mallas de las ruedas para poder rotarlas desde fuera.
  // Podrías devolverlas como parte de un objeto: { auto: auto, ruedas: ruedasMallas }
  // O adjuntarlas directamente al objeto 'auto' si sabes que siempre estarán allí.
  auto.userData.ruedas = ruedasMallas; // Adjunta las ruedas al objeto 'auto' para fácil acceso

  return auto;
}