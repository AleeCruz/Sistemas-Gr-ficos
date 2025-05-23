import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// --- ESCENA, CÁMARA Y RENDERER ---
//---------------------
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x330000);
scene.fog = new THREE.Fog(0x330000, 10, 50);

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.set(0, 10, 10);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// --- EJES, PLANO, GRILLA ---
const axesHelper = new THREE.AxesHelper(7);
scene.add(axesHelper);

const planeGeometry = new THREE.PlaneGeometry(10, 10);
const planeMaterial = new THREE.MeshBasicMaterial({
    color: 0xf08080,
    side: THREE.DoubleSide,
});
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -Math.PI / 2;
scene.add(plane);

const gridSize = 10;
const gridDivision = 10;
const grid = new THREE.GridHelper(gridSize, gridDivision, 0xaa0000, 0x550000);
scene.add(grid);

// --- CALLE: CURVA DE CATMULL-ROM Y EXTRUSIÓN ---
function buildCurveCatmullRom() {
    const points = [
        new THREE.Vector3(4, 0, 0),
        new THREE.Vector3(4, 0, 3),
        new THREE.Vector3(0, 0, 3),
        new THREE.Vector3(-3, 0, 4),
        new THREE.Vector3(-2, 0, 0),
        new THREE.Vector3(-4, 0, -3),
        new THREE.Vector3(0, 0, -3),
        new THREE.Vector3(1, 0, -1),
        new THREE.Vector3(3, 0, -2),
    ];

    const curve = new THREE.CatmullRomCurve3(points, true, 'catmullrom', 1);
    const curvePoints = curve.getPoints(500);

    const geometry = new THREE.BufferGeometry().setFromPoints(curvePoints);
    const material = new THREE.LineBasicMaterial({ color: 0x0000ff });

    const curveObject = new THREE.Line(geometry, material);
    curveObject.position.y = 0.02;
    scene.add(curveObject);

    return curve;
}

// 1. Forma 2D para extrusión
const Geometry2D = new THREE.Shape();
Geometry2D.moveTo(0, -0.25);
Geometry2D.lineTo(0, 0.25);
Geometry2D.lineTo(0, 0.25); // se puede simplificar, pero no afecta
Geometry2D.lineTo(0, -0.25);

// 2. Crear curva y extruirla
const catmullRomCurve = buildCurveCatmullRom();
const extrudeSettings = {
    steps: 400,
    bevelEnabled: false,
    extrudePath: catmullRomCurve,
};
const geometrySuperfieStreet = new THREE.ExtrudeGeometry(
    Geometry2D,
    extrudeSettings
);
const materialSuperficieStreet = new THREE.MeshStandardMaterial({
    color: 0x696969,
    wireframe: false,
});
const mallaSuperficie = new THREE.Mesh(
    geometrySuperfieStreet,
    materialSuperficieStreet
);
mallaSuperficie.position.y = 0.02;
scene.add(mallaSuperficie);

// --- FUNCION PARA VERIFICAR SI UN CUBO ESTÁ DENTRO DE LA CALLE ---
function isInsideStreetArea(x, z, curve, streetWidth, samples = 100) {
    let minDistanceSq = Infinity;
    const testPoint = new THREE.Vector3(x, 0, z);

    for (let i = 0; i <= samples; i++) {
        const pointOnCurve = curve.getPointAt(i / samples);
        const distanceSq = testPoint.distanceToSquared(pointOnCurve);
        if (distanceSq < minDistanceSq) {
            minDistanceSq = distanceSq;
        }
    }

    const distance = Math.sqrt(minDistanceSq);
    return distance < 0.4;
}

// --- CUBOS QUE EVITAN LA CALLE ---
const cubeGeometry = new THREE.BoxGeometry(0.3, 0.3, 0.3);
const cubeMaterial = new THREE.MeshBasicMaterial({ color: 0x87ceeb });

const step = gridSize / gridDivision;
const offset = gridSize / 2 - step / 2;
const streetWidth = 0.5; // debe coincidir con el ancho de la calle (0.25 + 0.25)

for (let i = 0; i < gridDivision; i++) {
    for (let j = 0; j < gridDivision; j++) {
        const x = -offset + i * step;
        const z = -offset + j * step;

        if (!isInsideStreetArea(x, z, catmullRomCurve, streetWidth)) {
            const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
            cube.position.set(x, 0.2, z);
            scene.add(cube);
        }
    }
}

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

// --- ANIMACIÓN Y RENDER ---
function animate() {
    requestAnimationFrame(animate);
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
