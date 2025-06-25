// cubo.js

import * as THREE from 'three';


export function createCube(options = {}) {
    const { size = 1, color = 0x00ff00, material } = options;

    const geometry = new THREE.BoxGeometry(size, size, size);
    let cubeMaterial;

    if (material instanceof THREE.Material) {
        cubeMaterial = material;
    } else {
        cubeMaterial = new THREE.MeshBasicMaterial({ color: color });
    }

    const cube = new THREE.Mesh(geometry, cubeMaterial);

    return cube;
}