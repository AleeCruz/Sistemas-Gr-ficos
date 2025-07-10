import * as THREE from 'three';

export function createTunnel(texturaParedURL = "textures/pared2.png") {
  const tunnelGroup = new THREE.Group();

  const texturaLoader = new THREE.TextureLoader();
  const wallTexture = texturaParedURL ? texturaLoader.load(texturaParedURL) : null;

  if (wallTexture) {
    wallTexture.wrapS = wallTexture.wrapT = THREE.RepeatWrapping;
    wallTexture.repeat.set(3, 1);
  }

  const tunnelWidth = 10;
  const tunnelHeight = 6;
  const tunnelDepth = 30;
  const innerWallThickness = 0.5;
  const ceilingThickness = 0.5;


  const tunnelMaterial = new THREE.MeshPhongMaterial({
    color: 0x666666,
    map: wallTexture || null,
  });

  // --- Arco de entrada ---
  const shape = new THREE.Shape();
shape.absarc(0, tunnelHeight * 0.2, tunnelWidth / 2, Math.PI, 0, false);
  shape.lineTo(tunnelWidth / 2, -tunnelHeight);
  shape.lineTo(-tunnelWidth / 2, -tunnelHeight);
  shape.lineTo(-tunnelWidth / 2, 0);

  const extrudeSettings = {
    depth: innerWallThickness,
    bevelEnabled: false,
  };

  const archGeometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  const archMesh = new THREE.Mesh(archGeometry, tunnelMaterial);
  archMesh.rotation.x = Math.PI;
  archMesh.position.set(0, 0.8, 0.5);
  archMesh.castShadow = true;
  tunnelGroup.add(archMesh);

  // --- Paredes internas ---
  const wallGeometry = new THREE.BoxGeometry(innerWallThickness, tunnelHeight, tunnelDepth);

  const leftWall = new THREE.Mesh(wallGeometry, tunnelMaterial);
  leftWall.position.set(-tunnelWidth / 2 + innerWallThickness / 2, tunnelHeight / 2, -tunnelDepth / 2);
  tunnelGroup.add(leftWall);

  const rightWall = leftWall.clone();
  rightWall.position.x = tunnelWidth / 2 - innerWallThickness / 2;
  tunnelGroup.add(rightWall);

  // --- Techo del túnel ---
  const ceilingGeometry = new THREE.BoxGeometry(tunnelWidth, ceilingThickness, tunnelDepth);
  const ceiling = new THREE.Mesh(ceilingGeometry, tunnelMaterial);
  ceiling.position.set(0, (tunnelHeight - ceilingThickness / 2)+0.5, -tunnelDepth / 2);
  tunnelGroup.add(ceiling);

  // --- Luz interna del túnel ---
  const light = new THREE.PointLight(0xffeeaa, 1.2, 40);
  light.position.set(0, tunnelHeight - 0.5, -tunnelDepth / 2);
  light.castShadow = true;
  tunnelGroup.add(light);

  return tunnelGroup;
}
