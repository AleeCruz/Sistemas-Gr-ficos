import * as THREE from 'three';

export function crearAutoPequeño(scene) {
  const auto = new THREE.Group();

  // 🔹 Chasis más pequeño
  const chasisGeo = new THREE.BoxGeometry(1, 0.4, 2);
  const chasisMat = new THREE.MeshPhongMaterial({ color: 0x156289 });
  const chasis = new THREE.Mesh(chasisGeo, chasisMat);
  chasis.position.y = 0.5;
  auto.add(chasis);

  // 🔹 Luces
  const spot = new THREE.SpotLight(0xffffff, 50);
  spot.angle = Math.PI / 6;
  spot.distance = 10;
  spot.position.set(0, 0.5, -1);
  spot.target.position.set(0, 0.5, -3);
  chasis.add(spot);
  chasis.add(spot.target);

  // 🔹 Ejes visuales
  const eje = new THREE.AxesHelper(1);
  chasis.add(eje);

  // 🔹 Ruedas pequeñas
  const ruedaGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.1, 16);
  ruedaGeo.rotateZ(Math.PI / 2);
  const ruedaMat = new THREE.MeshPhongMaterial({ color: 0x000000 });

  const posiciones = [
    [-0.5, 0.2, -0.7], // del izq
    [0.5, 0.2, -0.7],  // del der
    [-0.5, 0.2, 0.7],  // tras izq
    [0.5, 0.2, 0.7],   // tras der
  ];

  posiciones.forEach(pos => {
    const rueda = new THREE.Mesh(ruedaGeo, ruedaMat);
    rueda.position.set(...pos);
    auto.add(rueda);
  });

  scene.add(auto);
  return auto;
}
