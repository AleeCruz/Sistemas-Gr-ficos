import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {GUI} from "dat.gui"



const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

camera.position.set(5,5,5);
camera.lookAt(0,0,0);
const controls = new OrbitControls(camera,document.body);

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setAnimationLoop( animate );
document.body.appendChild( renderer.domElement );


const boxGeometry = new THREE.BoxGeometry(2,2,2);
const boxMaterial = new THREE.MeshBasicMaterial({color: 0x333333});
const boxMesh = new THREE.Mesh(boxGeometry,boxMaterial);
scene.add(boxMesh);









const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

function animate() {



  renderer.render( scene, camera );

}