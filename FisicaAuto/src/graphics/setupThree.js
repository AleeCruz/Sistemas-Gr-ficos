// src/graphics/setupThree.js
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import Stats from 'three/addons/libs/stats.module.js';

export function setupThree(scene, camera, renderer) {
    scene.background = new THREE.Color(0xbfd1e5);

    camera.position.set(30, 30, 30);
    camera.lookAt(0, 2, 0);

    const ambient = new THREE.HemisphereLight(0x555555, 0xffffff, 2);
    scene.add(ambient);

    const light = new THREE.DirectionalLight(0xffffff, 2);
    light.position.set(0, 12.5, 12.5);
    light.castShadow = true;
    scene.add(light);

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const ground = new THREE.PlaneGeometry(20, 20);
    ground.rotateX(-Math.PI / 2);
    const groundMaterial = new THREE.MeshPhongMaterial({ color: 0x999999 });
    const groundMesh = new THREE.Mesh(ground, groundMaterial);
    groundMesh.receiveShadow = true;
    scene.add(groundMesh);

    new THREE.TextureLoader().load('/textures/grid.png', texture => {
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(200, 200);
        groundMesh.material.map = texture;
        groundMesh.material.needsUpdate = true;
    });

    scene.add(new THREE.AxesHelper(5));
    document.body.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 2, 0);
    controls.update();

    const stats = new Stats();
    document.body.appendChild(stats.dom);

    return { controls, stats, groundMesh };
}
