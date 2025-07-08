import * as THREE from 'three';

export function crearLamparaCalle() {
  const lampara = new THREE.Group();

  // Poste vertical (el "palo")
  const poste = new THREE.Mesh(
    new THREE.CylinderGeometry(0.09, 0.09, 3, 6), // Radio, radio, altura, y menos segmentos para más simplicidad
    new THREE.MeshStandardMaterial({ color: 0x222222, flatShading: true }) // flatShading para un aspecto más "básico"
  );
  poste.position.y = 1.5; // Coloca la base en Y=0
  poste.castShadow = true;
  poste.receiveShadow = true; // Para que también pueda recibir sombras
  lampara.add(poste);

  // Foco/Luz (la "esfera")
  const foco = new THREE.Mesh(
    new THREE.SphereGeometry(0.3, 8, 8), // Radio, y menos segmentos para una esfera más simple (antes 16, 16)
    new THREE.MeshStandardMaterial({
      color: 0xffffcc,
      emissive: 0xffffaa,
      emissiveIntensity: 1.2 // Un poco más brillante para que se vea como fuente de luz
    })
  );
  foco.position.set(0, 3.1, 0); // La esfera justo encima del palo
  foco.castShadow = true;
  foco.receiveShadow = true;
  lampara.add(foco);

  // Luz puntual (PointLight) que emana de la esfera
  // Una PointLight es buena para una esfera que irradia luz en todas direcciones
  const luz = new THREE.PointLight(0xffffcc, 1.5, 8, 2); // Color, Intensidad (ajustada), Distancia, Decaimiento
  luz.position.copy(foco.position); // La luz emana desde la posición de la esfera
  luz.castShadow = true; // La luz puntual proyecta sombras
  luz.shadow.mapSize.width = 512; // Resolución del mapa de sombras (se puede reducir a 256 si es necesario)
  luz.shadow.mapSize.height = 512;
  luz.shadow.camera.near = 0.1;
  luz.shadow.camera.far = 10;
  lampara.add(luz);

  return lampara;
}