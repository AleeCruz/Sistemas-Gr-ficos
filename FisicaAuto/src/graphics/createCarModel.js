// src/graphics/createCarModel.js
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as THREE from 'three';

export async function createCarModel(scene) {
    const loader = new GLTFLoader();
    const gltf = await loader.loadAsync('/modelos/car_model.glb');
    const model = gltf.scene;

    model.scale.set(0.001, 0.001, 0.001);
    model.rotation.y = Math.PI;

    model.traverse(child => {
        if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            if (child.material && child.material.opacity < 1) {
                child.material.transparent = true;
                child.material.depthWrite = false;
                child.material.opacity = Math.max(child.material.opacity, 0.5);
            }
        }
    });

    const chassisMesh = new THREE.Group();
    chassisMesh.add(model);
    chassisMesh.add(new THREE.AxesHelper(2));
    scene.add(chassisMesh);

    return chassisMesh;
}
