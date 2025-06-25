import * as THREE from 'three';
import { scene, camera, renderer, controls } from './scene.js';
import { catmullRomCurve } from './caminoCurva.js';
import { generarObjetosSinSuperposicion } from './gridObjects.js';
import { crearAuto } from './auto.js';
import { moverCuboSobreCurva } from './movimientoSobreCurva.js';
import {crearCurva} from "./curva.js"

generarObjetosSinSuperposicion({
    curve: catmullRomCurve,
    streetWidth: 0.5,
    gridSize: 15,
    gridDivision: 15,
});
let auto,curva,clock;

// --- LUCES ---
const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

const directionalLightHelper = new THREE.DirectionalLightHelper(
    directionalLight,
    1
);
scene.add(directionalLightHelper);


/**
 * Se agrego un auto  y se le asigno una curva para que se mueva sobre ella.
 * El auto se mueve a lo largo de la curva y rota suavemente para seguir la dirección
 */
curva = crearCurva();
const puntos = curva.getPoints(200);
const curvaGeometry = new THREE.BufferGeometry().setFromPoints(puntos);
scene.add(curva);

auto = crearAuto();
scene.add(auto);
clock = new THREE.Clock();



// --- ANIMACIÓN Y RENDER ---
function animate() {
    requestAnimationFrame(animate);
    const tiempo = clock.getElapsedTime();
    if (auto && curva){
        moverCuboSobreCurva(auto, curva, tiempo);
        // Rotar las ruedas del auto
        auto.userData.ruedas.forEach(rueda => {
            rueda.rotation.y += 0.3; // Ajusta la velocidad de rotación según sea necesario
        });
    }

    controls.update();
    renderer.render(scene, camera);
}
animate();

// --- RESPONSIVE ---
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
