// dayNightManager.js
import * as THREE from 'three';

/**
 * Gestiona el ciclo día/noche en una escena de Three.js, controlando el color del cielo,
 * la niebla y las intensidades de las luces (globales e individuales de las farolas).
 */
export class DayNightManager {
    /**
     * @param {THREE.Scene} scene La escena principal de Three.js.
     * @param {THREE.WebGLRenderer} renderer El renderizador de Three.js WebGL.
     * @param {THREE.DirectionalLight} mainDirectionalLight La luz direccional principal (ej. sol/luna).
     * @param {THREE.AmbientLight} mainAmbientLight La luz ambiental principal.
     */
    constructor(scene, renderer, mainDirectionalLight, mainAmbientLight) {
        this.scene = scene;
        this.renderer = renderer;
        this.mainDirectionalLight = mainDirectionalLight;
        this.mainAmbientLight = mainAmbientLight;
        this.streetLights = []; // Array para almacenar instancias de THREE.PointLight de las farolas

        this._dayNightFactor = 0; // Estado interno: 0 = día, 1 = noche

        // Definir colores y parámetros de niebla para las transiciones día y noche
        this.skyDay = new THREE.Color(0x87CEEB); // Azul claro para el cielo de día
        this.skyNight = new THREE.Color(0x050515); // Azul/púrpura muy oscuro para la noche

        this.fogColorDay = new THREE.Color(0xAAAAAA); // Niebla gris claro para el día
        this.fogColorNight = new THREE.Color(0x000005); // Niebla casi negra para la noche

        this.fogNearDay = 50; // La niebla comienza más lejos durante el día
        this.fogFarDay = 150; // La niebla es menos densa durante el día
        this.fogNearNight = 10; // La niebla comienza más cerca durante la noche
        this.fogFarNight = 70; // La niebla es más densa y limita la visibilidad por la noche

        // Aplicar configuraciones iniciales
        this.updateLightsAndSky();
    }

    /**
     * Añade una PointLight de una farola para ser gestionada por el ciclo día/noche.
     * Almacena la intensidad inicial de la luz para escalarla correctamente durante las transiciones.
     * @param {THREE.PointLight} pointLight La instancia de PointLight a gestionar.
     */
    addStreetLight(pointLight) {
        if (pointLight instanceof THREE.PointLight) {
            this.streetLights.push(pointLight);
            // Almacenar la intensidad inicial para poder escalarla más tarde
            pointLight.userData.initialIntensity = pointLight.intensity;
        }
    }

    /**
     * Setter para el factor día/noche. Limita el valor entre 0 y 1
     * y activa una actualización de la iluminación y la atmósfera de la escena.
     * @param {number} value Un flotante entre 0 (día completo) y 1 (noche completa).
     */
    set dayNightFactor(value) {
        this._dayNightFactor = THREE.MathUtils.clamp(value, 0, 1);
        this.updateLightsAndSky();
    }

    /**
     * Getter para el factor día/noche actual.
     * @returns {number} El factor día/noche actual (0-1).
     */
    get dayNightFactor() {
        return this._dayNightFactor;
    }

    /**
     * Actualiza todos los elementos de la escena (fondo, niebla, luces globales, luces de farolas)
     * basándose en el '_dayNightFactor' actual.
     */
    updateLightsAndSky() {
        const factor = this._dayNightFactor; // Alias para mayor legibilidad

        // 1. Interpolar y establecer el color de fondo de la escena
        const currentSkyColor = new THREE.Color().lerpColors(this.skyDay, this.skyNight, factor);
        this.scene.background = currentSkyColor;

        // 2. Interpolar y aplicar la configuración de la niebla
        this.scene.fog = new THREE.Fog(
            new THREE.Color().lerpColors(this.fogColorDay, this.fogColorNight, factor),
            THREE.MathUtils.lerp(this.fogNearDay, this.fogNearNight, factor),
            THREE.MathUtils.lerp(this.fogFarDay, this.fogFarNight, factor)
        );

        // 3. Ajustar la intensidad de la luz ambiental principal
        // Es más brillante durante el día (factor 0) y más tenue por la noche (factor 1)
        this.mainAmbientLight.intensity = THREE.MathUtils.lerp(0.6, 0.1, factor);

        // 4. Ajustar la intensidad y posición de la luz direccional principal (sol/luna)
        // Es más brillante durante el día y más tenue por la noche
        this.mainDirectionalLight.intensity = THREE.MathUtils.lerp(10, 0.1, factor);

        // Simular el movimiento del sol/luna por el cielo
        // Usando seno/coseno para que parezca que sube y baja
        const angle = factor * Math.PI; // Ángulo de 0 a PI (0 a 180 grados)
        const radius = 50; // Distancia de la fuente de luz
        const sunMoonX = radius * Math.sin(angle); // Se mueve de +X a -X
        const sunMoonY = radius * Math.cos(angle); // Se mueve de +Y (arriba) a -Y (debajo del horizonte)
        const sunMoonZ = 50; // Mantener Z constante con respecto a la escena

        this.mainDirectionalLight.position.set(sunMoonX, sunMoonY, sunMoonZ);

        // 5. Ajustar la intensidad de las luces individuales de las farolas
        this.streetLights.forEach(light => {
            if (light.userData.initialIntensity !== undefined) {
                // Las luces de las farolas deben encenderse gradualmente a medida que oscurece (el factor se acerca a 1)
                // Usar el factor al cuadrado (factor * factor) hace que se enciendan más lentamente al principio
                const desiredIntensity = light.userData.initialIntensity * factor * factor;
                // Evitar establecer una intensidad demasiado baja; apagarlas efectivamente si son muy tenues
                light.intensity = desiredIntensity < 0.01 ? 0 : desiredIntensity;
            }
        });
    }
}
