import * as THREE from 'three';

let time = 0;

// Centralized settings object for sun properties, accessible by GUI and animation
export const sunSettings = {
    color: '#ffffff',
    intensity: 1.5,
    angle: Math.PI / 5,
    penumbra: 0.2,
    distance: 200,
    ambientIntensity: 0.4,
    autoAnimateSun: true, // Control para la animación
    skyColor: '#87CEEB',
    fogColor: '#87CEEB',
    fogNear: 60,
    fogFar: 120,
    // La función de reseteo debe recibir la luz para actuar sobre ella
    resetSunPosition: (spotLight) => {
        spotLight.position.set(0, 10, 0); // Posición inicial
        spotLight.target.position.set(0, 0, 0); // Asegura que el target también se resetea
        spotLight.target.updateMatrixWorld();
        time = 0; // Reinicia el tiempo para que la animación empiece desde el inicio
    }
};

export function animateSun(spotLight, currentSunSettings) {
    if (currentSunSettings.autoAnimateSun) {
        time += 0.002;
        const radius = 20;
        const height = 20; // Altura máxima del sol en la órbita
        const x = radius * Math.cos(time);
        const z = 0;
        const y = height * Math.sin(time); // Simula el ascenso y descenso del sol

        spotLight.position.set(x, y, z);
    }
    // Aunque el sol no se anime automáticamente, su target siempre debe estar actualizado
    spotLight.target.updateMatrixWorld();
}

// Función para obtener el objeto de settings, que será pasado al GUI
export function getSunSettings() {
    return sunSettings;
}