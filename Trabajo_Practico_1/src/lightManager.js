// modules/lightManager.js
import * as THREE from 'three';

let spotLight, ambientLight, lightHelper;

// Las configuraciones iniciales se toman de sunAnimation.js para coherencia
// O podrías definirlas aquí y pasarlas al objeto de settings del GUI/animación.
// Para esta integración, las inicializaremos a valores por defecto y guiManager las sobrescribirá.
const DEFAULT_SPOTLIGHT_COLOR = '#ffffff';
const DEFAULT_SPOTLIGHT_INTENSITY = 1.5;
const DEFAULT_SPOTLIGHT_DISTANCE = 200;
const DEFAULT_SPOTLIGHT_ANGLE = Math.PI / 5;
const DEFAULT_SPOTLIGHT_PENUMBRA = 0.2;
const DEFAULT_AMBIENT_INTENSITY = 0.4;

export function setupLights(scene) {
    // Sol (SpotLight)
    spotLight = new THREE.SpotLight(
        new THREE.Color(DEFAULT_SPOTLIGHT_COLOR),
        DEFAULT_SPOTLIGHT_INTENSITY,
        DEFAULT_SPOTLIGHT_DISTANCE,
        DEFAULT_SPOTLIGHT_ANGLE,
        DEFAULT_SPOTLIGHT_PENUMBRA,
        1
    );
    spotLight.position.set(0, 10, 0); // Posición inicial del sol
    spotLight.castShadow = true;
    spotLight.shadow.mapSize.width = 1024;
    spotLight.shadow.mapSize.height = 1024;
    spotLight.shadow.camera.near = 0.5;
    spotLight.shadow.camera.far = 300;

    spotLight.target.position.set(0, 0, 0); // El sol apunta al origen
    scene.add(spotLight.target);

    // Un pivote para que el sol gire alrededor del origen de la escena
    const sunPivot = new THREE.Object3D();
    sunPivot.add(spotLight);
    scene.add(sunPivot);

    // Esfera visual para el sol (adjunta directamente al spotLight)
    const sunSphere = new THREE.Mesh(
        new THREE.SphereGeometry(0.6, 32, 32),
        new THREE.MeshBasicMaterial({ color: 0xffff00 }) // Color inicial de la esfera visual
    );
    spotLight.add(sunSphere);

    // Luz ambiental
    ambientLight = new THREE.AmbientLight(0xffffff, DEFAULT_AMBIENT_INTENSITY);
    scene.add(ambientLight);

    // Helper de luz
    lightHelper = new THREE.SpotLightHelper(spotLight);
    scene.add(lightHelper);

    return { spotLight, ambientLight, sunPivot }; // Devolvemos las luces para que main.js pueda referenciarlas
}

export function updateLightHelper(light) {
    if (lightHelper && light === spotLight) { // Asegurarse de que sea el helper del spotLight
        lightHelper.update();
    }
}