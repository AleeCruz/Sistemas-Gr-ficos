import * as THREE from 'three';

export function crearAuto() {
  const auto = new THREE.Group();

  // Factor de escalado para reducir el tamaño al 35% (100% - 65% = 35%)
  const scaleFactor = 0.35;

  // --- Carrocería ---
  // Dimensiones originales que definiste: 0.8 de largo, 0.3 de alto, 0.4 de ancho
  // Nuevas dimensiones: (original * scaleFactor)
  const cuerpoGeom = new THREE.BoxGeometry(
    0.8 * scaleFactor, // Largo
    0.3 * scaleFactor, // Alto
    0.4 * scaleFactor  // Ancho
  );
  const cuerpoMat = new THREE.MeshStandardMaterial({ color: 0x156289, metalness: 0.5, roughness: 0.6 });
  const cuerpo = new THREE.Mesh(cuerpoGeom, cuerpoMat);
  // La posición Y también debe ajustarse al nuevo tamaño del cuerpo
  cuerpo.position.y = (0.3 * scaleFactor) / 2; // La mitad de la nueva altura
  auto.add(cuerpo);

  // --- Ruedas ---
  // El radio y el ancho de las ruedas también deben ser escalados
  const ruedaRadio = 0.1 * scaleFactor;
  const ruedaAncho = 0.1 * scaleFactor;
  const ruedaGeom = new THREE.CylinderGeometry(ruedaRadio, ruedaRadio, ruedaAncho, 32);
  const ruedaMat = new THREE.MeshStandardMaterial({ color: 0x333083, metalness: 0.7, roughness: 0.5, wireframe: true });

  // Posiciones de las ruedas ajustadas al nuevo tamaño de la carrocería y al radio de la rueda
  const posicionesRuedas = [
    [-0.3 * scaleFactor, ruedaRadio, 0.2 * scaleFactor],  // Delantera izquierda (X, Y, Z)
    [0.3 * scaleFactor, ruedaRadio, 0.2 * scaleFactor],   // Delantera derecha
    [-0.3 * scaleFactor, ruedaRadio, -0.2 * scaleFactor], // Trasera izquierda
    [0.3 * scaleFactor, ruedaRadio, -0.2 * scaleFactor],  // Trasera derecha
  ];

  const ruedasMallas = [];

  posicionesRuedas.forEach(pos => {
    const ruedaMesh = new THREE.Mesh(ruedaGeom, ruedaMat);
    ruedaMesh.rotation.x = -Math.PI / 2; // Gira 90 grados alrededor del eje X

    const ruedaGrupo = new THREE.Group();
    ruedaGrupo.position.set(...pos);
    ruedaGrupo.add(ruedaMesh);

    auto.add(ruedaGrupo);
    ruedasMallas.push(ruedaMesh);
  });

  auto.userData.ruedas = ruedasMallas;

  return auto;
}