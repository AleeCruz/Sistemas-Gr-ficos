// modules/streetLightManager.js
import * as THREE from 'three';
import { crearLamparaCalle } from './crearLamparaCalle.js'; // Ajusta la ruta si es necesario

const lamparasConLuces = []; // Array para almacenar las lámparas y sus luces asociadas

export function createStreetLights(scene, curva) {
    // Crear una lámpara base una sola vez (geométrica y material)
    const lamparaBaseMesh = crearLamparaCalle(); // Asume que esto devuelve un Object3D o Mesh

    const cantidadLamparas = 10; // Aumentamos la cantidad para un mejor efecto visual
    const distanciaAlCostado = 0.6;

    for (let i = 0; i < cantidadLamparas; i++) {
        const t = i / (cantidadLamparas - 1); // 0 a 1
        const pos = curva.getPointAt(t);
        const tangente = curva.getTangentAt(t);
        const normal = tangente.clone().cross(new THREE.Vector3(0, 1, 0)).normalize();

        // Lámpara derecha
        const lamparaDerecha = lamparaBaseMesh.clone();
        lamparaDerecha.position.copy(pos.clone().add(normal.clone().multiplyScalar(distanciaAlCostado)));
        lamparaDerecha.lookAt(pos.clone().add(tangente)); // Apunta la lámpara a lo largo de la carretera
        lamparaDerecha.scale.set(0.5, 0.5, 0.5);

        // Añadir una luz puntual (PointLight) a la lámpara
        const luzPuntualDerecha = new THREE.PointLight(0xfff0c0, 0, 10); // Color cálido, intensidad 0 inicialmente, distancia 10
        luzPuntualDerecha.position.set(0, 3.5, 0); // Posición relativa dentro de la lámpara (simula la bombilla)
        luzPuntualDerecha.castShadow = true;
        luzPuntualDerecha.shadow.mapSize.width = 512;
        luzPuntualDerecha.shadow.mapSize.height = 512;
        luzPuntualDerecha.shadow.camera.near = 0.1;
        luzPuntualDerecha.shadow.camera.far = 15;
        lamparaDerecha.add(luzPuntualDerecha); // Añade la luz como hija de la lámpara
        scene.add(lamparaDerecha);

        lamparasConLuces.push({ mesh: lamparaDerecha, light: luzPuntualDerecha });

        // Lámpara izquierda
        const lamparaIzquierda = lamparaBaseMesh.clone();
        lamparaIzquierda.position.copy(pos.clone().add(normal.clone().multiplyScalar(-distanciaAlCostado)));
        lamparaIzquierda.lookAt(pos.clone().add(tangente)); // Apunta la lámpara a lo largo de la carretera
        lamparaIzquierda.scale.set(0.5, 0.5, 0.5);

        const luzPuntualIzquierda = new THREE.PointLight(0xfff0c0, 0, 10); // Intensidad 0 inicialmente
        luzPuntualIzquierda.position.set(0, 3.5, 0);
        luzPuntualIzquierda.castShadow = true;
        luzPuntualIzquierda.shadow.mapSize.width = 512;
        luzPuntualIzquierda.shadow.mapSize.height = 512;
        luzPuntualIzquierda.shadow.camera.near = 0.1;
        luzPuntualIzquierda.shadow.camera.far = 15;
        lamparaIzquierda.add(luzPuntualIzquierda);
        scene.add(lamparaIzquierda);

        lamparasConLuces.push({ mesh: lamparaIzquierda, light: luzPuntualIzquierda });
    }
}

let targetIntensity = 0; // Intensidad objetivo
let currentIntensity = 0; // Intensidad actual
const transitionSpeed = 0.05; // Velocidad de transición (ajusta para más rápido/lento)

export function updateStreetLights(sunAltitudeRatio) {
    // sunAltitudeRatio es un valor entre 0 y 1, donde 0 es "noche total" y 1 es "día total".
    // Queremos que las luces se enciendan cuando el sol está bajo (noche)

    // Define un umbral para considerar "noche"
    const nightThreshold = 0.3; // Por debajo de este valor, es noche
    const dayThreshold = 0.7; // Por encima de este valor, es día

    if (sunAltitudeRatio < nightThreshold) {
        // Es de noche, las luces deberían estar encendidas
        targetIntensity = 1; // Máxima intensidad para las luces de la calle
    } else if (sunAltitudeRatio > dayThreshold) {
        // Es de día, las luces deberían estar apagadas
        targetIntensity = 0;
    }
    // Si está entre nightThreshold y dayThreshold, la intensidad se quedará como está,
    // o podríamos hacer una transición más compleja aquí si se desea.

    // Interpolación suave de la intensidad actual a la intensidad objetivo
    currentIntensity = THREE.MathUtils.lerp(currentIntensity, targetIntensity, transitionSpeed);

    lamparasConLuces.forEach(lampara => {
        lampara.light.intensity = currentIntensity * 1.5; // Multiplica por un factor para hacerlas más brillantes
    });
}