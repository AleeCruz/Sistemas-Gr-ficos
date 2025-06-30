// main.js
import * as THREE from 'three';
import { scene, camera, renderer, controls } from './scene.js';
import { catmullRomCurve } from './caminoCurva.js';
import { generarObjetosSinSuperposicion } from './gridObjects.js';
// import { crearAuto } from './auto.js'; // Esta importación no se usaba directamente para crear el coche en tu código
import { moverCuboSobreCurva } from './movimientoSobreCurva.js';
import { crearCurva } from "./curva.js";
import { CameraManager } from './cameraManager.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { crearLamparaCalle } from './crearLamparaCalle.js';
import { DayNightManager } from './dayNightManager.js'; // NUEVO: Importar el DayNightManager

// Generamos objetos en la grilla sin superposición
generarObjetosSinSuperposicion({
    curve: catmullRomCurve,
    streetWidth: 0.5,
    gridSize: 15,
    gridDivision: 15,
});

let auto, curva, clock;
let cameraManager;
let dayNightManager; // Declarar la instancia de DayNightManager
let streetPointLights = []; // Array para recolectar las instancias de PointLight de cada farola

// --- LUCES GLOBALES ---
// Definir luces ambientales y direccionales globales. Serán gestionadas por DayNightManager.
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6); // Intensidad inicial para el día
//scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xff0000, 0); // Intensidad inicial para el día
directionalLight.position.set(5, 5, 5); // Posición inicial para el día (ej. sol)
scene.add(directionalLight);

// Ayudante para la luz direccional (visualiza su dirección)
const directionalLightHelper = new THREE.DirectionalLightHelper(
    directionalLight,
    1
);
scene.add(directionalLightHelper);

// --- CURVA (Camino para el coche) ---
curva = crearCurva(); // Se asume que crearCurva() devuelve un objeto THREE.Curve
const puntosCurva = curva.getPoints(100); // Obtener puntos para visualizar la curva
const curvaGeometry = new THREE.BufferGeometry().setFromPoints(puntosCurva);
scene.add(new THREE.Line(curvaGeometry, new THREE.LineBasicMaterial({ color: 0xff0000 })));

// --- AUTO (Modelo GLB) ---
const loader = new GLTFLoader();
loader.load('/modelos/car_model.glb', (gltf) => {
    auto = gltf.scene;
    auto.scale.set(0.001, 0.001, 0.001); // Escalar el modelo del coche
    scene.add(auto);

    // Asumiendo que el modelo del coche tiene partes que deben ser identificadas como 'ruedas' para la animación
    auto.userData.ruedas = [];
    auto.traverse((child) => {
        // Ejemplo: si tus mallas de ruedas tienen nombres como "wheel_front_left"
        if (child.isMesh && child.name.includes("wheel")) { // Ajusta esta condición según la convención de nombres de tu modelo para las ruedas
             auto.userData.ruedas.push(child);
        }
        // Ajuste de rotación inicial para todo el modelo del coche si es necesario
        child.rotation.y = Math.PI / 2;
    });

}, undefined, (error) => {
    console.error("Error al cargar el modelo GLB:", error);
});

clock = new THREE.Clock(); // Se usa para seguir el tiempo transcurrido para las animaciones

// --- GESTOR DE CÁMARA ---
cameraManager = new CameraManager(renderer.domElement, camera);

// Alternar vista de cámara al pulsar la tecla 'C'
window.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'c') {
        cameraManager.toggleCamera();
    }
});

// --- LÁMPARAS A LO LARGO DE LA CURVA (alternando lados) ---
const puntosLamparas = curva.getSpacedPoints(14); // Distribuir las lámparas a lo largo de la curva

puntosLamparas.forEach((pos, i) => {
    const lampara = crearLamparaCalle(); // Se asume que crearLamparaCalle() devuelve un THREE.Group o Mesh para una lámpara
    lampara.scale.set(0.3, 0.3, 0.3); // Escalar el modelo de la lámpara

    lampara.position.copy(pos); // Posicionar la lámpara a lo largo de la curva

    // Calcular la tangente y la normal para colocar las lámparas al lado de la curva
    const tangente = curva.getTangent(i / puntosLamparas.length);
    const normal = new THREE.Vector3(-tangente.z, 0, tangente.x).normalize(); // Perpendicular a la tangente en el plano XZ

    // Alternar lados (izquierda/derecha) del camino para las lámparas
    const lado = i % 2 === 0 ? 1 : -1;
    lampara.position.add(normal.multiplyScalar(0.5 * lado)); // Desplazar la posición de la lámpara

    // Hacer que la lámpara mire hacia el centro del camino
    lampara.lookAt(pos);

    scene.add(lampara);

    // NUEVO: Encontrar cualquier hijo PointLight dentro del modelo de la lámpara y añadirlo a nuestra lista
    // Esto permite que el DayNightManager controle su intensidad.
    lampara.traverse((child) => {
        if (child.isPointLight) {
            streetPointLights.push(child);
            // Opcionalmente, establecer una intensidad inicial si no está ya establecida en crearLamparaCalle
            if (child.intensity === 0) child.intensity = 0.5; // Ejemplo de intensidad predeterminada
        }
    });
});

// --- INICIALIZACIÓN DEL GESTOR DÍA/NOCHE ---
// Inicializar el DayNightManager después de que todas las luces globales y las luces de las farolas estén configuradas.
dayNightManager = new DayNightManager(scene, renderer, directionalLight, ambientLight);
// Pasar todas las PointLights de las farolas recolectadas al gestor
streetPointLights.forEach(light => dayNightManager.addStreetLight(light));
// Establecer una hora inicial del día (0 = día, 1 = noche)
dayNightManager.dayNightFactor = 0; // Iniciar la escena durante el día

// --- UI para el Control del Ciclo Día/Noche ---
const dayNightSlider = document.createElement('input');
dayNightSlider.type = 'range';
dayNightSlider.min = '0';
dayNightSlider.max = '1';
dayNightSlider.step = '0.01';
dayNightSlider.value = '0'; // Posición inicial del deslizador (día)
dayNightSlider.style.cssText = `
    position: absolute;
    top: 10px;
    left: 10px;
    z-index: 1000;
    width: 200px;
    padding: 10px;
    background-color: rgba(255,255,255,0.7);
    border-radius: 8px;
    border: 1px solid #ccc;
    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    cursor: grab; /* Indica un elemento interactivo */
    -webkit-appearance: none; /* Eliminar estilos predeterminados de WebKit */
    height: 8px; /* Pista deslizante más delgada */
    outline: none; /* Sin contorno al enfocar */
`;

// Estilo del pulgar del deslizador (para mejor experiencia de usuario)
const styleSheet = document.head.appendChild(document.createElement("style"));
styleSheet.innerHTML = `
    input[type=range]::-webkit-slider-thumb {
        -webkit-appearance: none;
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background: #007bff;
        cursor: pointer;
        box-shadow: 0 0 2px rgba(0,0,0,0.5);
        margin-top: -5px; /* Ajustar posición vertical del pulgar */
    }
    input[type=range]::-moz-range-thumb {
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background: #007bff;
        cursor: pointer;
        box-shadow: 0 0 2px rgba(0,0,0,0.5);
    }
    input[type=range]::-ms-thumb {
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background: #007bff;
        cursor: pointer;
        box-shadow: 0 0 2px rgba(0,0,0,0.5);
    }
    input[type=range]::-webkit-slider-runnable-track {
        background: #ddd;
        border-radius: 5px;
        height: 8px;
    }
    input[type=range]::-moz-range-track {
        background: #ddd;
        border-radius: 5px;
        height: 8px;
    }
    input[type=range]::-ms-track {
        background: #ddd;
        border-radius: 5px;
        height: 8px;
    }
`;

document.body.appendChild(dayNightSlider);

// Etiqueta para el deslizador
const dayNightLabel = document.createElement('div');
dayNightLabel.style.cssText = `
    position: absolute;
    top: 45px;
    left: 10px;
    z-index: 1000;
    color: #333;
    font-family: 'Arial', sans-serif;
    font-size: 12px;
    background-color: rgba(255,255,255,0.5);
    padding: 2px 8px;
    border-radius: 4px;
`;
dayNightLabel.textContent = 'Día ------------------- Noche'; // Texto de la etiqueta en español
document.body.appendChild(dayNightLabel);

// Escucha de eventos para actualizar el DayNightManager cuando el deslizador cambie
dayNightSlider.addEventListener('input', (event) => {
    dayNightManager.dayNightFactor = parseFloat(event.target.value);
});


// --- BUCLE DE ANIMACIÓN ---
function animate() {
    requestAnimationFrame(animate); // Solicitar el siguiente cuadro de animación

    const tiempo = clock.getElapsedTime(); // Obtener el tiempo transcurrido para las animaciones

    // Mover el coche a lo largo de la curva
    if (auto && curva) {
        moverCuboSobreCurva(auto, curva, tiempo);
        // Rotar las ruedas del coche (asumiendo que el array 'ruedas' está poblado correctamente desde el modelo GLTF)
        if (auto.userData.ruedas && auto.userData.ruedas.length > 0) {
            auto.userData.ruedas.forEach(rueda => {
                rueda.rotation.y += 0.5; // Ajustar la velocidad de rotación según sea necesario
            });
        }

        // Actualizar la cámara en primera persona si está activa
        if (cameraManager.getActiveCameraType() === 'primeraPersona') {
            cameraManager.updatePrimeraPersonaCamera(auto.position);
        }
    }

    cameraManager.updateControls(); // Actualizar los controles de órbita si el amortiguamiento está habilitado
    directionalLightHelper.update(); // Actualizar el ayudante de luz para reflejar los cambios de posición de la luz direccional
    renderer.render(scene, cameraManager.getActiveCamera()); // Renderizar la escena con la cámara activa
}
animate(); // Iniciar el bucle de animación

// --- MANEJO DEL REDIMENSIONAMIENTO ---
window.addEventListener('resize', () => {
    cameraManager.onWindowResize(window.innerWidth, window.innerHeight); // Actualizar la relación de aspecto de la cámara
    renderer.setSize(window.innerWidth, window.innerHeight); // Actualizar el tamaño del renderizador
});

