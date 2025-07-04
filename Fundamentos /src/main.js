import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as dat from "dat.gui";


//acabamoms de crear una escena y una camara  para su uso posterior
//Ademas vamos crear una actualizacion de la camara para movernos en la escena 
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75,
     window.innerWidth / window.innerHeight, 0.1, 1000 );
const controls = new OrbitControls(camera,document.body);

//Acabamos de crear el renderer para un uso posterior en la funcion animate 
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setAnimationLoop(animate);
document.body.appendChild(renderer.domElement);
//----------------------------------------------------------------------
//---------------Vamos a habilitar el uso de las sombras

renderer.shadowMap.enabled = true;


//------------------------------------------------------------------------------
//----------------------------------------------------------------------------
//Se crea y agrega una ayuda visual  de coordenada XYZ
const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

//Se realiza un cambio de posicion de la camra y su enfoque hacia la posicion 0,0,0
camera.position.set(15,15,15);
camera.lookAt(0,0,0);
camera.updateProjectionMatrix();
//Aca estamos creando una geometria de cubo y un material basico para el mismo
//Luego se crea un mesh(malla) que combina la geometria y el material, y se agrega
// a la escena para que sea visible
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

/**
 * Por ahora lo unico que hicimos fue realizar un agregado de esfera, cubo ,
 * plano y una grilla cuadriculada en la escena 
 */
//Vamos a agregar una nueva geometria que nos permita crear un plano
const planeGeometry = new THREE.PlaneGeometry(20,20);
const planeMaterial = new THREE.MeshStandardMaterial({ color: 0xfff000, side: THREE.DoubleSide });
const plane = new THREE.Mesh(planeGeometry,planeMaterial);
scene.add(plane ); 
plane.rotation.x = -Math.PI / 2; // Rotar el plano para que esté horizontal
plane.receiveShadow = true;

const gridHelper = new THREE.GridHelper(20);
scene.add(gridHelper);

const sphereGeometry = new THREE.SphereGeometry(4,50,50);
const sphereMaterial = new THREE.MeshStandardMaterial({color : 0x0000ff,
    wireframe:false
});
const sphere = new THREE.Mesh(sphereGeometry,sphereMaterial);
sphere.position.set(-5,5,0);
scene.add(sphere);
sphere.castShadow = true;
/**hasta acá termino el agregado de los elementos geometricos que nosotros 
 * necesitamos para la escena 
*/
//------------------------------------------------------------------------------

//------------------------------------------------------------------------------
//------------Vamos a agregar un par de luces a nuestra escena dado que 
//-----------Empezamos a usar un tipo de material standard que necesita luz
const ambientLight = new THREE.AmbientLight(0x333333);
scene.add(ambientLight)

/*

const directionalLight = new THREE.DirectionalLight(0xFFFFFF,0.8);
scene.add(directionalLight);
directionalLight.position.set(-10,10,10);
directionalLight.castShadow = true;
directionalLight.shadow.camera.bottom = -12;
directionalLight.shadow.camera.right = 12;
directionalLight.shadow.camera.left = -12;
directionalLight.shadow.camera.top = 12;


const dLightHelper = new THREE.DirectionalLightHelper(directionalLight,10);
scene.add(dLightHelper);
*/

//------------Vamos a agregar luces que tienen que ver con spothlight ---------

const spotLight = new THREE.SpotLight(0xffffff, 5, 100, 0.4, 0.9, 0.5);
scene.add(spotLight);
spotLight.position.set(0,20,0);
spotLight.castShadow = true;


const sLightHelper = new THREE.SpotLightHelper(spotLight);
scene.add(sLightHelper);






//--------Vamos a usar un helper de lacamra de sombras 
/*const dLightShadowHelper = new THREE.CameraHelper(directionalLight.shadow.camera);
scene.add(dLightShadowHelper);
*/

//------------------------------------------------------------------------------

/**A partir de aca vamos a crear una interfaz de usuario que nos permita 
 * cambiar valores o parametros a nuestra escena 
 */
const gui = new dat.GUI();
const options = {
    sphereColor: "#ffea00",
    wireframe:sphereMaterial.wireframe,
    speed : 0.01,
    angle: 0.2,
    penumbra: 0,
    intensity: 1
}
gui.addColor(options,"sphereColor").onChange(function(e){
    sphere.material.color.set(e);
});

gui.add(options,"wireframe").onChange(function(e){
    sphere.material.wireframe = e;
});

gui.add(options, "speed",0,0.5);
gui.add(options, "angle",0,1);
gui.add(options, "penumbra",0,1);
gui.add(options, "intensity",0,0.5);

let step =0;
/**-------------------------------------------------------------------- */
/**-------------------------------------------------------------------- */




// Esta función se llama en cada frame para actualizar la escena
// En este caso, simplemente rota el cubo y renderiza la escena
function animate() {
    cube.rotation.y += 0.01;
   
    step += options.speed ;
    sphere.position.y = 10*Math.abs(Math.sin(step));


    spotLight.angle = options.angle;
    spotLight.penumbra = options.penumbra;
    spotLight.intensity = options.intensity;

    sLightHelper.update();

    // Render the scene from the perspective of the camera
    renderer.render(scene, camera);
}
