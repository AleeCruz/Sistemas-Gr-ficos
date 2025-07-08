// illuminationSun.js
import * as THREE from 'three';

/**
 * Crea y gestiona un objeto sol con un spotlight asociado que orbita alrededor de un punto central.
 * @param {THREE.Scene} scene - La escena de Three.js a la que se añadirán el sol y la luz.
 * @param {number} initialOrbitRadius - El radio INICIAL de la órbita del sol en el plano XY.
 * @param {number} initialOrbitSpeed - La velocidad INICIAL de la órbita del sol (en radianes por segundo, ajustado para el bucle de animación).
 * @param {THREE.Vector3} targetPosition - La posición en coordenadas de mundo a la que el spotlight debe apuntar.
 * @returns {{sun: THREE.Mesh, spotLight: THREE.SpotLight, update: Function, params: Object, setOrbitAngle: Function}} Un objeto con el mesh del sol, el spotlight, una función de actualización, un objeto de parámetros y una función para establecer el ángulo de órbita.
 */
export function createIlluminationSun(scene, initialOrbitRadius, initialOrbitSpeed, targetPosition) {
    // Parámetros que serán controlados por dat.GUI
    const params = {
        orbitRadius: initialOrbitRadius,
        orbitSpeed: initialOrbitSpeed
    };

    // Crear el "sol" (esfera con luz)
    const sunGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    scene.add(sun);

    // Configurar el SpotLight
    const spotLight = new THREE.SpotLight(0xffffff, 2, 20, Math.PI * 0.15, 0.5, 2);
    spotLight.position.set(0, 0, 0);
    spotLight.castShadow = true;
    spotLight.shadow.mapSize.width = 1024;
    spotLight.shadow.mapSize.height = 1024;
    spotLight.shadow.camera.near = 0.5;
    spotLight.shadow.camera.far = 25;
    spotLight.shadow.camera.fov = 30;
    sun.add(spotLight);

    // Definir el target del spotlight
    spotLight.target.position.copy(targetPosition);
    scene.add(spotLight.target);

    // Opcional: Ayudante para visualizar el cono de luz
    const spotLightHelper = new THREE.SpotLightHelper(spotLight);
    scene.add(spotLightHelper);

    let angle = 0; // Ángulo inicial para la órbita del sol

    // --- NUEVA FUNCIÓN: Establecer el ángulo de órbita ---
    function setOrbitAngle(newAngle) {
        angle = newAngle;
        // Forzar una actualización de posición inmediata al cambiar el ángulo
        updateSunPosition(true); 
    }
    // -----------------------------------------------------

    // Función de actualización para el sol y el spotlight
    // Agregamos un parámetro 'forceUpdate' para actualizar la posición sin incrementar el ángulo
    function updateSunPosition(forceUpdate = false) {
        if (!forceUpdate) {
            angle += params.orbitSpeed * 0.001; // Usamos params.orbitSpeed
        }
        sun.position.set(params.orbitRadius * Math.cos(angle), params.orbitRadius * Math.sin(angle), 0); // Usamos params.orbitRadius
        spotLightHelper.update();
    }

    return {
        sun: sun,
        spotLight: spotLight,
        update: updateSunPosition,
        params: params,
        setOrbitAngle: setOrbitAngle // Exportamos la nueva función
    };
}