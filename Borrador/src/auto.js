import * as THREE from 'three';

export function crearAuto() {
  const auto = new THREE.Group();

  // Carrocería
  const cuerpoGeom = new THREE.BoxGeometry(4, 1.5, 2);
  const cuerpoMat = new THREE.MeshStandardMaterial({ color: 0x156289, metalness: 0.5, roughness: 0.6 });
  const cuerpo = new THREE.Mesh(cuerpoGeom, cuerpoMat);
  cuerpo.position.y = 1;
  auto.add(cuerpo);

  // Ruedas
  const ruedaGeom = new THREE.CylinderGeometry(0.5, 0.5, 0.5, 32);
  const ruedaMat = new THREE.MeshStandardMaterial({ color: 0x333383, metalness: 0.7, roughness: 0.5 });

  const posicionesRuedas = [
    [-1.5, 0.5, 1],  // Delantera izquierda
    [1.5, 0.5, 1],   // Delantera derecha
    [-1.5, 0.5, -1], // Trasera izquierda
    [1.5, 0.5, -1],  // Trasera derecha
  ];

  posicionesRuedas.forEach(pos => {
    const rueda = new THREE.Mesh(ruedaGeom, ruedaMat);
    rueda.rotation.x = Math.PI / 2; // Girar para que el eje quede horizontal, rueda "acostada"
    rueda.position.set(...pos);
    auto.add(rueda);
  });

  return auto;
}
