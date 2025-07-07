// modules/guiManager.js
import * as dat from 'dat.gui';
import * as THREE from 'three';

let gui;
let sunFolder, environmentFolder;

export function setupGUI(spotLight, ambientLight, scene, sharedSunSettings) {
    gui = new dat.GUI();

    // --- Controles del Sol (SpotLight) ---
    sunFolder = gui.addFolder('Controles del Sol');

    sunFolder.addColor(sharedSunSettings, 'color').name('Color de Luz').onChange(val => {
        spotLight.color.set(val);
        // Opcional: Actualizar el color de la esfera visual del sol
        spotLight.children[0].material.color.set(val);
    });
    sunFolder.add(sharedSunSettings, 'intensity', 0, 5).name('Intensidad').onChange(val => {
        spotLight.intensity = val;
    });
    sunFolder.add(sharedSunSettings, 'angle', 0.01, Math.PI / 2).name('Ángulo').onChange(val => {
        spotLight.angle = val;
    });
    sunFolder.add(sharedSunSettings, 'penumbra', 0, 1).name('Penumbra').onChange(val => {
        spotLight.penumbra = val;
    });
    sunFolder.add(sharedSunSettings, 'distance', 10, 500).name('Distancia').onChange(val => {
        spotLight.distance = val;
    });

    sunFolder.add(sharedSunSettings, 'autoAnimateSun').name('Animar Sol Automáticamente');
    // La función resetSunPosition se llama directamente desde sharedSunSettings
    sunFolder.add(sharedSunSettings, 'resetSunPosition').name('Reiniciar Posición del Sol');

    sunFolder.open();

    // --- Controles del Ambiente ---
    environmentFolder = gui.addFolder('Controles de Ambiente');

    environmentFolder.add(sharedSunSettings, 'ambientIntensity', 0, 1).name('Intensidad Ambiental').onChange(val => {
        ambientLight.intensity = val;
    });
    environmentFolder.addColor(sharedSunSettings, 'skyColor').name('Color del Cielo').onChange(val => {
        scene.background.set(val);
    });
    environmentFolder.addColor(sharedSunSettings, 'fogColor').name('Color de Niebla').onChange(val => {
        scene.fog.color.set(val);
    });
    environmentFolder.add(sharedSunSettings, 'fogNear', 1, 150).name('Niebla Cercana').onChange(val => {
        scene.fog.near = val;
    });
    environmentFolder.add(sharedSunSettings, 'fogFar', 50, 500).name('Niebla Lejana').onChange(val => {
        scene.fog.far = val;
    });

    // Presets de ambiente
    const presets = {
        Mañana: () => setSunPreset('morning', spotLight, ambientLight, scene, sharedSunSettings),
        Tarde: () => setSunPreset('afternoon', spotLight, ambientLight, scene, sharedSunSettings),
        Noche: () => setSunPreset('night', spotLight, ambientLight, scene, sharedSunSettings),
    };

    environmentFolder.add(presets, 'Mañana');
    environmentFolder.add(presets, 'Tarde');
    environmentFolder.add(presets, 'Noche');

    environmentFolder.open();
}

function setSunPreset(mode, spotLight, ambientLight, scene, sharedSunSettings) {
    let newSunColor, newIntensity, newAngle, newPenumbra, newAmbientIntensity, newSkyColor, newFogColor, newFogNear, newFogFar;

    // Puedes ajustar estos valores según tus preferencias
    switch (mode) {
        case 'morning':
            newSunColor = '#ffd59a'; // Naranja suave
            newIntensity = 1.0;
            newAngle = Math.PI / 4;
            newPenumbra = 0.5;
            newAmbientIntensity = 0.3;
            newSkyColor = '#fff2d0'; // Luz cálida
            newFogColor = '#fff2d0';
            newFogNear = 60;
            newFogFar = 120;
            break;

        case 'afternoon':
            newSunColor = '#ffffff'; // Blanca intensa
            newIntensity = 2.0;
            newAngle = Math.PI / 5;
            newPenumbra = 0.2;
            newAmbientIntensity = 0.5;
            newSkyColor = '#87ceeb'; // Celeste cielo
            newFogColor = '#87ceeb';
            newFogNear = 60;
            newFogFar = 120;
            break;

        case 'night':
            newSunColor = '#92aaff'; // Azul tenue
            newIntensity = 0.3;
            newAngle = Math.PI / 6;
            newPenumbra = 0.8;
            newAmbientIntensity = 0.1;
            newSkyColor = '#0c1445'; // Noche
            newFogColor = '#0c1445';
            newFogNear = 10;
            newFogFar = 50;
            break;
    }

    // Actualizar el objeto compartido de settings
    sharedSunSettings.color = newSunColor;
    sharedSunSettings.intensity = newIntensity;
    sharedSunSettings.angle = newAngle;
    sharedSunSettings.penumbra = newPenumbra;
    sharedSunSettings.ambientIntensity = newAmbientIntensity;
    sharedSunSettings.skyColor = newSkyColor;
    sharedSunSettings.fogColor = newFogColor;
    sharedSunSettings.fogNear = newFogNear;
    sharedSunSettings.fogFar = newFogFar;


    // Aplicar los cambios a los objetos de Three.js
    spotLight.color.set(sharedSunSettings.color);
    spotLight.intensity = sharedSunSettings.intensity;
    spotLight.angle = sharedSunSettings.angle;
    spotLight.penumbra = sharedSunSettings.penumbra;
    ambientLight.intensity = sharedSunSettings.ambientIntensity;
    scene.background.set(sharedSunSettings.skyColor);
    scene.fog.color.set(sharedSunSettings.fogColor);
    scene.fog.near = sharedSunSettings.fogNear;
    scene.fog.far = sharedSunSettings.fogFar;

    // Actualizar la visualización en el dat.GUI para que refleje los valores del preset
    for (const i in sunFolder.__controllers) {
        sunFolder.__controllers[i].updateDisplay();
    }
    for (const i in environmentFolder.__controllers) {
        environmentFolder.__controllers[i].updateDisplay();
    }
}