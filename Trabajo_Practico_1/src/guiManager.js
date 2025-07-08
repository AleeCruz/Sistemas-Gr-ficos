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
    sunFolder.add(sharedSunSettings, 'intensity', 0, 25).name('Intensidad').onChange(val => {
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

    environmentFolder.add(sharedSunSettings, 'ambientIntensity', 0, 0.3).name('Intensidad Ambiental').onChange(val => {
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
            newSunColor = '#ffa012'; // Naranja suave
            newIntensity = 25.0;
            newAngle = 0.36;
            newPenumbra = 0.31;
            newAmbientIntensity = 0;
            newSkyColor = '#e58914'; // Luz cálida
            newFogColor = '#e58914';
            newFogNear = 1;
            newFogFar = 67;
            break;

        case 'afternoon':
            newSunColor = '#ffffff'; // Blanca intensa
            newIntensity = 25;
            newAngle = 0.48;
            newPenumbra = 0.23;
            newAmbientIntensity = 0.3;
            newSkyColor = '#87ceeb'; // Celeste cielo
            newFogColor = '#cde5ef';
            newFogNear = 1;
            newFogFar = 67;
            break;

        case 'night':
            newSunColor = '#4d4d6f'; // Azul tenue
            newIntensity = 20;
            newAngle = Math.PI / 6;
            newPenumbra = 0.8;
            newAmbientIntensity = 0;
            newSkyColor = '#000000'; // Noche
            newFogColor = '#000000';
            newFogNear = 1;
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