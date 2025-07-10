// auto.js
import * as THREE from 'three';

export function crearAuto() {
  const auto = new THREE.Group();

  const scaleFactor = 0.35;

  // --- Carrocería ---
  // ¡CAMBIO CLAVE AQUÍ! Ahora el largo (0.8) está en el eje Z (depth)
  const cuerpoGeom = new THREE.BoxGeometry(
    0.4 * scaleFactor, // Ancho (X)
    0.3 * scaleFactor, // Alto (Y)
    0.8 * scaleFactor  // Largo (Z)
  );
  const cuerpoMat = new THREE.MeshStandardMaterial({ color: 0x156289, metalness: 0.5, roughness: 0.6 });
  const cuerpo = new THREE.Mesh(cuerpoGeom, cuerpoMat);
  cuerpo.position.y = (0.3 * scaleFactor) / 2;
  auto.add(cuerpo);

  // --- Ruedas ---
  const ruedaRadio = 0.1 * scaleFactor;
  const ruedaAncho = 0.1 * scaleFactor;
  const ruedaGeom = new THREE.CylinderGeometry(ruedaRadio, ruedaRadio, ruedaAncho, 32);
  const ruedaMat = new THREE.MeshStandardMaterial({ color: 0x333083, metalness: 0.7, roughness: 0.5, wireframe: true });

  // ¡AJUSTE CLAVE AQUÍ! Posiciones de ruedas adaptadas a la nueva orientación de la carrocería
  // Las ruedas delanteras/traseras se separan por Z, y las laterales por X
  const posicionesRuedas = [
    [-0.2 * scaleFactor, ruedaRadio, 0.3 * scaleFactor],  // Delantera izquierda (X, Y, Z)
    [0.2 * scaleFactor, ruedaRadio, 0.3 * scaleFactor],   // Delantera derecha
    [-0.2 * scaleFactor, ruedaRadio, -0.3 * scaleFactor], // Trasera izquierda
    [0.2 * scaleFactor, ruedaRadio, -0.3 * scaleFactor],  // Trasera derecha
  ];

  const ruedasMallas = [];

  posicionesRuedas.forEach(pos => {
    const ruedaMesh = new THREE.Mesh(ruedaGeom, ruedaMat);
    ruedaMesh.rotation.x = -Math.PI / 2; // Gira 90 grados alrededor del eje X
    ruedaMesh.rotation.z = Math.PI / 2;  // Gira 90 grados alrededor del eje Z para alinear el cilindro

    const ruedaGrupo = new THREE.Group();
    ruedaGrupo.position.set(...pos);
    ruedaGrupo.add(ruedaMesh);

    auto.add(ruedaGrupo);
    ruedasMallas.push(ruedaMesh);
  });

  auto.userData.ruedas = ruedasMallas;

  // --- ROTACIÓN FINAL DEL GRUPO 'AUTO' ---
  // Con la BoxGeometry y ruedas ajustadas, el frente del auto (largo) ya debería estar en el eje Z.
  // Si el auto se ve hacia adelante correctamente, no necesitas ninguna rotación aquí.
  // Si el auto se ve hacia atrás (+Z es la cola), entonces rótalo 180 grados.
  // auto.rotation.y = Math.PI; // Descomenta si el auto está al revés

  // Si después de todo esto, el auto todavía se mueve de lado, es porque su "frente"
  // está en el eje -X o +X. Prueba estas:
  // auto.rotation.y = Math.PI / 2;   // Rota 90 grados anti-horario
  // auto.rotation.y = -Math.PI / 2;  // Rota 90 grados horario

  return auto;
}