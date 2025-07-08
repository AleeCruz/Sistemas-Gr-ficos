import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as dat from 'dat.gui';

let scene, camera, renderer, controls;
let spotLight, lightHelper, sunPivot, ambient;
let gui, sunFolder, environmentFolder; // Se añadió environmentFolder
let time = 0;

// Centralized settings object for easier GUI integration and state management
const sunSettings = {
    color: '#ffffff', // Initial color of the sun (spotlight)
    intensity: 1.5,
    angle: Math.PI / 5,
    penumbra: 0.2,
    distance: 200,
    ambientIntensity: 0.4,
    autoAnimateSun: true, // New setting to control sun's automatic movement
    skyColor: '#87CEEB', // Initial sky color (Three.js expects hex string for dat.GUI color)
    fogColor: '#87CEEB', // Initial fog color
    fogNear: 60,
    fogFar: 120,
    resetSunPosition: () => { // Function to reset sun position to default (top-center)
        spotLight.position.set(0, 10, 0);
        spotLight.target.position.set(0, 0, 0);
        spotLight.target.updateMatrixWorld();
        lightHelper.update();
        time = 0; // Reset time to restart animation from beginning if re-enabled
    }
};

init();
animate();

function init() {
    // Escena
    scene = new THREE.Scene();
    scene.background = new THREE.Color(sunSettings.skyColor);
    scene.fog = new THREE.Fog(new THREE.Color(sunSettings.fogColor), sunSettings.fogNear, sunSettings.fogFar);

    // Cámara
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 200);
    camera.position.set(0, 8, 20);

    // Render
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.body.appendChild(renderer.domElement);

    // Controles
    controls = new OrbitControls(camera, renderer.domElement);

    // Piso
    const ground = new THREE.Mesh(
        new THREE.PlaneGeometry(200, 200),
        new THREE.MeshStandardMaterial({ color: 0x3a5f0b })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Sol (SpotLight)
    spotLight = new THREE.SpotLight(
        new THREE.Color(sunSettings.color),
        sunSettings.intensity,
        sunSettings.distance,
        sunSettings.angle,
        sunSettings.penumbra,
        1
    );
    spotLight.position.set(0, 10, 0);
    spotLight.castShadow = true;
    spotLight.shadow.mapSize.width = 1024;
    spotLight.shadow.mapSize.height = 1024;
    spotLight.shadow.camera.near = 0.5;
    spotLight.shadow.camera.far = 300;

    spotLight.target.position.set(0, 0, 0); // Ensure target is at origin
    scene.add(spotLight.target);

    sunPivot = new THREE.Object3D();
    sunPivot.add(spotLight);
    scene.add(sunPivot);

    // Esfera visual para el sol
    const sunSphere = new THREE.Mesh(
        new THREE.SphereGeometry(0.6, 32, 32),
        new THREE.MeshBasicMaterial({ color: 0xffff00 })
    );
    spotLight.add(sunSphere);

    // Luz ambiental
    ambient = new THREE.AmbientLight(0xffffff, sunSettings.ambientIntensity);
    scene.add(ambient);

    // Helper
    lightHelper = new THREE.SpotLightHelper(spotLight);
    scene.add(lightHelper);

    // GUI
    setupGUI();

    // Resize
    window.addEventListener('resize', onWindowResize);
}

function setupGUI() {
    gui = new dat.GUI();

    // --- Controles del Sol (SpotLight) ---
    sunFolder = gui.addFolder('Controles del Sol');

    sunFolder.addColor(sunSettings, 'color').name('Color de Luz').onChange(val => {
        spotLight.color.set(val);
        // Also update the visual sun sphere color if desired, e.g.:
        // spotLight.children[0].material.color.set(val);
    });
    sunFolder.add(sunSettings, 'intensity', 0, 5).name('Intensidad').onChange(val => {
        spotLight.intensity = val;
    });
    sunFolder.add(sunSettings, 'angle', 0.01, Math.PI / 2).name('Ángulo').onChange(val => {
        spotLight.angle = val;
    });
    sunFolder.add(sunSettings, 'penumbra', 0, 1).name('Penumbra').onChange(val => {
        spotLight.penumbra = val;
    });
    sunFolder.add(sunSettings, 'distance', 10, 500).name('Distancia').onChange(val => {
        spotLight.distance = val;
    });

    sunFolder.add(sunSettings, 'autoAnimateSun').name('Animar Sol Automáticamente');
    sunFolder.add(sunSettings, 'resetSunPosition').name('Reiniciar Posición del Sol');

    sunFolder.open();

    // --- Controles del Ambiente ---
    environmentFolder = gui.addFolder('Controles de Ambiente');

    environmentFolder.add(sunSettings, 'ambientIntensity', 0, 1).name('Intensidad Ambiental').onChange(val => {
        ambient.intensity = val;
    });
    environmentFolder.addColor(sunSettings, 'skyColor').name('Color del Cielo').onChange(val => {
        scene.background.set(val);
    });
    environmentFolder.addColor(sunSettings, 'fogColor').name('Color de Niebla').onChange(val => {
        scene.fog.color.set(val);
    });
    environmentFolder.add(sunSettings, 'fogNear', 1, 150).name('Niebla Cercana').onChange(val => {
        scene.fog.near = val;
    });
    environmentFolder.add(sunSettings, 'fogFar', 50, 500).name('Niebla Lejana').onChange(val => {
        scene.fog.far = val;
    });

    // Presets de ambiente
    const presets = {
        Mañana: () => setSunPreset('morning'),
        Tarde: () => setSunPreset('afternoon'),
        Noche: () => setSunPreset('night'),
    };

    environmentFolder.add(presets, 'Mañana');
    environmentFolder.add(presets, 'Tarde');
    environmentFolder.add(presets, 'Noche');

    environmentFolder.open();
}

function setSunPreset(mode) {
    let newSunColor, newIntensity, newAngle, newPenumbra, newAmbientIntensity, newSkyColor, newFogColor;

    switch (mode) {
        case 'morning':
            newSunColor = '#ffd59a'; // Naranja suave
            newIntensity = 1.0;
            newAngle = Math.PI / 4;
            newPenumbra = 0.5;
            newAmbientIntensity = 0.3;
            newSkyColor = '#fff2d0'; // Luz cálida
            newFogColor = '#fff2d0';
            break;

        case 'afternoon':
            newSunColor = '#ffffff'; // Blanca intensa
            newIntensity = 2.0;
            newAngle = Math.PI / 5;
            newPenumbra = 0.2;
            newAmbientIntensity = 0.5;
            newSkyColor = '#87ceeb'; // Celeste cielo
            newFogColor = '#87ceeb';
            break;

        case 'night':
            newSunColor = '#92aaff'; // Azul tenue
            newIntensity = 0.3;
            newAngle = Math.PI / 6;
            newPenumbra = 0.8;
            newAmbientIntensity = 0.1;
            newSkyColor = '#0c1445'; // Noche
            newFogColor = '#0c1445';
            break;
    }

    // Update sunSettings object and then apply to Three.js objects
    sunSettings.color = newSunColor;
    sunSettings.intensity = newIntensity;
    sunSettings.angle = newAngle;
    sunSettings.penumbra = newPenumbra;
    sunSettings.ambientIntensity = newAmbientIntensity;
    sunSettings.skyColor = newSkyColor;
    sunSettings.fogColor = newFogColor;

    // Apply changes to Three.js objects
    spotLight.color.set(sunSettings.color);
    spotLight.intensity = sunSettings.intensity;
    spotLight.angle = sunSettings.angle;
    spotLight.penumbra = sunSettings.penumbra;
    ambient.intensity = sunSettings.ambientIntensity;
    scene.background.set(sunSettings.skyColor);
    scene.fog.color.set(sunSettings.fogColor);

    // Update dat.GUI display to reflect preset values
    for (let i in sunFolder.__controllers) {
        sunFolder.__controllers[i].updateDisplay();
    }
    for (let i in environmentFolder.__controllers) {
        environmentFolder.__controllers[i].updateDisplay();
    }
}

function animate() {
    requestAnimationFrame(animate);

    // Órbita solar solo si autoAnimateSun es true
    if (sunSettings.autoAnimateSun) {
        time += 0.002;
        const radius = 40;
        const height = 20;
        const x = radius * Math.cos(time);
        const z = radius * Math.sin(time);
        const y = height * Math.sin(time); // Simulates sun rising and setting

        spotLight.position.set(x, y, z);
    }
    // No move spotLight.target.position.set(0,0,0) here, as it should stay fixed at the scene center.
    spotLight.target.updateMatrixWorld(); // Keep the target updated

    lightHelper.update(); // Important to update the helper when light changes
    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}