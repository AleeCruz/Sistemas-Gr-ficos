//segunda version mejorada
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

/**Aqui dentro esta todo lo relacionado a la camara, escenea, el render y
 * el orbits control
 * ------------------------------------------------
*/
// Escena y cámara
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x330000); // Fondo rojo oscuro
scene.fog = new THREE.Fog(0x330000, 10, 50); // (Opcional) niebla apocalíptica

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.set(0, 10, 10); // Ajusté la posición de la cámara para ver mejor la superficie
camera.lookAt(0, 0, 0);

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // para un movimiento suave
/**------------------------------------------------------------ */



/*Aqui esta el codigo necesario para ingresar objetos en la escena
------------------------------------------------*/

//Ejes coordenados
const axesHelper = new THREE.AxesHelper(7); // el número define el largo de los ejes
scene.add(axesHelper);

// Plano
const planeGeometry = new THREE.PlaneGeometry(10, 10);
const planeMaterial = new THREE.MeshBasicMaterial({color: 0xf08080,side: THREE.DoubleSide,});
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -Math.PI / 2;
scene.add(plane);

// Grilla
const gridSize = 10;
const gridDivision = 10;
const grid = new THREE.GridHelper(gridSize, gridDivision, 0xaa0000, 0x550000);
scene.add(grid);



const cubeGeometry = new THREE.BoxGeometry(0.3,0.3,0.3);
const cubeMaterial = new THREE.MeshBasicMaterial({color: 0x87CEEB})

const step  = gridSize/gridDivision;
const offset = gridSize/2 - step/2;

for (let i=0;i<gridDivision;i++){
    for(let j=0; j<gridDivision;j++){
        const cube  = new THREE.Mesh(cubeGeometry,cubeMaterial);

        const x = -offset+i*step;
        const z = -offset+j*step;
        cube.position.set(x,0.2,z);
        scene.add(cube);
    }
}





/**A partir de aca se trabaja sobre la calle, los parametros necesarios para 
 * simular un recorrido 
 */

function buildCurveCatmullRoom() {
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

    const curve = new THREE.CatmullRomCurve3(points, true , 'catmullrom', 1);
    const curvePoints = curve.getPoints(500); // más puntos = curva más suave

    const geometry = new THREE.BufferGeometry().setFromPoints(curvePoints);
    const material = new THREE.LineBasicMaterial({ color: 0x0000ff });

    const curveObject = new THREE.Line(geometry, material);
    curveObject.position.y = 0.02;
    scene.add(curveObject);

    return curve; // Devolvemos la curva para usarla en la extrusión
}

// 1. Definir la forma 2D (un rectángulo delgado)
const Geometry2D = new THREE.Shape();
Geometry2D.moveTo(0, -0.25);
Geometry2D.lineTo(0, -0.25);
Geometry2D.lineTo(0, 0.25);
Geometry2D.lineTo(0, 0.25);
Geometry2D.lineTo(0, -0.25);

// 2. Obtener la curva de Catmull-Rom
const catmullRomCurve = buildCurveCatmullRoom();


// 3. Definir la configuración de la extrusión
const extrudeSettings = {
    steps: 400,
    bevelEnabled: false,
    extrudePath: catmullRomCurve,
};
// 4. Crear la geometría de barrido
const geometrySuperfieStreet = new THREE.ExtrudeGeometry(Geometry2D, extrudeSettings);
// 5. Crear un material para la superficie de barrido
const materialSuperficieStreet = new THREE.MeshStandardMaterial({ color: 0x696969, wireframe: false });
// 6. Crear la malla de la superficie de barrido
const mallaSuperficie = new THREE.Mesh(geometrySuperfieStreet, materialSuperficieStreet);
mallaSuperficie.position.y =0.02;
scene.add(mallaSuperficie);

// ------------------ Luces --------------------------------------------------
const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

// Opcional: Ayudante para visualizar la dirección de la luz direccional
const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight, 1);
 scene.add(directionalLightHelper);
// --- Fin de Luces ---

// Animación
function animate() {
    requestAnimationFrame(animate);
    controls.update(); // Necesario si enableDamping = true
    renderer.render(scene, camera);
}

animate();

// Responsivo
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

