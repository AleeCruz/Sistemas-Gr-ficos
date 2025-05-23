import * as THREE from 'three';
import { loadModels } from './loader.js';
//import { armarSolucion } from './solucion.ignore.js';

const modelPaths = [
	'/models/antebrazo.dae',
	'/models/brazo.dae',
	'/models/cabina.dae',
	'/models/chasis.dae',
	'/models/cubierta.dae',
	'/models/eje.dae',
	'/models/llanta.dae',
	'/models/pala.dae',
	'/models/tuerca.dae',
];

const ADD_HELPERS = true;

export class SceneManager {
	path;
	vehiculo;

	camaraVehiculo;
	camaraConductor;

	ready = false;

	constructor(scene) {
		this.scene = scene;
		const light = new THREE.DirectionalLight(0xffffff, 2);

		light.position.set(1, 1, 1);
		scene.add(light);

		const hemiLight = new THREE.HemisphereLight(0xffffbb, 0x080820, 1);
		scene.add(hemiLight);

		const grid = new THREE.GridHelper(2000, 20);
		scene.add(grid);

		const axes = new THREE.AxesHelper(100);
		scene.add(axes);
		this.buildPath();
		this.prepareScene();

		loadModels(modelPaths, (models) => {
			models.forEach((model, i) => {
				if (ADD_HELPERS) {
					model.add(new THREE.AxesHelper(20)); // Debugging helpers
				}
				// model.rotation.set(0, 0, 0); // Arreglamos la rotación de los modelos
				model.position.setZ(i * 100 - (models.length * 100) / 2); // Distribuimos las piezas en el eje X para una linda presentación (?)
				model.rotation.set(0, 0, 0);
				scene.add(model);
			});

			this.cabina = this.scene.getObjectByName('cabina');
			this.brazo = this.scene.getObjectByName('brazo');
			this.antebrazo = this.scene.getObjectByName('antebrazo');
			this.pala = this.scene.getObjectByName('pala');
			this.chasis = this.scene.getObjectByName('chasis');
			this.eje = this.scene.getObjectByName('eje');
			this.llanta = this.scene.getObjectByName('llanta');
			this.cubierta = this.scene.getObjectByName('cubierta');
			this.tuerca = this.scene.getObjectByName('tuerca');

			this.eje.geometry.rotateZ(Math.PI / 2);
			this.eje.geometry.rotateY(Math.PI / 2);
			this.llanta.geometry.rotateZ(Math.PI / 2);
			this.llanta.geometry.rotateY(Math.PI / 2);
			this.cubierta.geometry.rotateZ(Math.PI / 2);
			this.cubierta.geometry.rotateY(Math.PI / 2);

			this.tuerca.geometry.rotateZ(Math.PI / 2);
			this.tuerca.geometry.rotateY(Math.PI / 2);

			//this.pala.geometry.rotateY(Math.PI);

			this.camaraConductor.position.set(50, 40, -40);

			this.camaraConductor.lookAt(0, 40, 0);
			this.cabina.add(this.camaraConductor);
			this.construirVehiculo();
			this.ready = true;
		});
	}

	prepareScene() {
		this.vehiculo = new THREE.Group();
		let axesHelper = new THREE.AxesHelper(20);
		this.vehiculo.add(axesHelper);
		this.scene.add(this.vehiculo);
		this.camaraVehiculo = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
		this.camaraVehiculo.position.set(-200, 100, 200);
		this.camaraVehiculo.lookAt(0, 0, 0);
		this.vehiculo.add(this.camaraVehiculo);

		this.camaraConductor = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
	}

	buildPath() {
		this.path = new THREE.CatmullRomCurve3([
			new THREE.Vector3(100, 0, 0),
			new THREE.Vector3(700, 0, 0),
			new THREE.Vector3(600, 0, 600),
			new THREE.Vector3(0, 0, 700),
			new THREE.Vector3(-600, 0, 600),
			new THREE.Vector3(-700, 0, 0),
			new THREE.Vector3(-600, 0, -600),
			new THREE.Vector3(0, 0, -700),
			new THREE.Vector3(600, 0, -600),
			new THREE.Vector3(700, 0, 0),
			new THREE.Vector3(100, 0, 0),
		]);

		const points = this.path.getPoints(100);
		const geometry = new THREE.BufferGeometry().setFromPoints(points);
		const material = new THREE.LineBasicMaterial({ color: 0x990000 });
		const line = new THREE.Line(geometry, material);

		this.scene.add(line);
	}

	onResize(aspect) {
		this.camaraVehiculo.aspect = aspect;
		this.camaraVehiculo.updateProjectionMatrix();
		this.camaraConductor.aspect = aspect;
		this.camaraConductor.updateProjectionMatrix();
	}

	construirVehiculo() {
		this.cabina;
		this.brazo;
		this.antebrazo;
		this.pala;
		this.chasis;
		this.eje;
		this.llanta;
		this.cubierta;
		this.tuerca;

		// **************************************************************
		// Ejercicio: ensamblar la excavadora
		// **************************************************************
		//
		// Desplazamientos relativos entre piezas:
		//
		// vehiculo     >>      cabina        0,25,0
		// cabina       >>      brazo         20, 20, -10
		// brazo        >>      antebrazo     -102,0,0
		// antebrazo    >>      pala          -60,0,0
		// vehiculo     >>      eje            20,5,0
		// eje          >>      rueda          0,+-27,0
		// rueda        >>      cubierta       0,0,0
		// rueda        >>      llanta         0,0,0
		// rueda        >>      tuerca         *,*,3  (xz depende de la ubicacion de la tuerca)
		//
		// ***************************************************************

		// IMPORTANTE: no olvidar se setear position y rotation de cada pieza
		// ya que por defecto tienen un valor no nulo
		// los modelos estan disponibles para ser clonados bajo estos atributos
		// this.cabina;
		// this.brazo;
		// this.antebrazo;
		// this.pala;
		// this.chasis;
		// this.eje;
		// this.llanta;
		// this.cubierta;
		// this.tuerca;

		// para clonarlos hacer: let tuerca=this.tuerca.clone(); 

		// completar a partir de aca ...
	
		this.scene.remove(this.tuerca);
		this.scene.remove(this.llanta);
		this.scene.remove(this.cubierta);
		




// Ensamblaje de la rueda (llanta, cubierta ,tuercas)
		let rueda = new THREE.Group();

		// Cubierta y llanta en el centro de la rueda
		let cubierta = this.cubierta.clone();
		cubierta.position.set(0, 0, 0);
		rueda.add(cubierta);

		let llanta = this.llanta.clone();
		llanta.position.set(0, 0, 0);
		rueda.add(llanta);
		
		const radio = 6; // radio del círculo donde van las tuercas
		
		for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
			let tuerca = this.tuerca.clone(); // usar modelo original
		
			tuerca.position.set(radio * Math.cos(a), radio * Math.sin(a), 3); // z fija	
			rueda.add(tuerca);
		}
		

		let ruedaIzquierda = rueda.clone();
		ruedaIzquierda.position.set(0,0,27);
		this.eje.add(ruedaIzquierda);
		this.ruedaIzquierda = ruedaIzquierda;
		
		let ruedaDerecha = rueda.clone();
		ruedaDerecha.position.set(0,0,-27);
		ruedaDerecha.rotation.x = Math.PI;
		ruedaDerecha.rotation.z = Math.PI;
		this.eje.add(ruedaDerecha);
		this.ruedaDerecha = ruedaDerecha;
		
				

		//------Ensamblaje de la parte   superior 
		//chasis,brazo,antebrazo y la pala .

		let vehiculo = new THREE.Group();

		this.chasis.position.set(0,0,0);
		this.vehiculo.add(this.chasis);

		this.cabina.position.set(0,25,0);
		this.vehiculo.add(this.cabina);

		this.brazo.position.set(20,20,-10);
		this.cabina.add(this.brazo);

		this.antebrazo.position.set(-102,0,0);
		this.brazo.add(this.antebrazo);
		
		this.pala.position.set(-60,0,0);
		this.antebrazo.add(this.pala);

		
		//Ensamblaje del eje con respecto al vehiculo 
		
		this.eje.position.set(20,5,0);
		this.vehiculo.add(this.eje);
	
		let ejeDelantero = this.eje.clone();
		ejeDelantero.position.set(-20,5,0);
		this.vehiculo.add(ejeDelantero);
		

		/*let vehiculo = new THREE.Group();
		
		let chasis = this.chasis.clone();
		chasis.position.set(0,0,0);
		this.vehiculo.add(chasis);

		let ejeTrasero = this.eje.clone();
		ejeTrasero.position.set(20,5,0);
		this.vehiculo.add(ejeTrasero);

		let ejeDelantero = this.eje.clone();
		ejeDelantero.position.set(-20,5,0);
		this.vehiculo.add(ejeDelantero);

		let cabina = this.cabina.clone();
		cabina.position.set(0,25,0);
		this.vehiculo.add(cabina);

		let brazo = this.brazo.clone();
		brazo.position.set(20,20,-10);
		cabina.add(brazo);

		let anteBrazo = this.antebrazo.clone();
		anteBrazo.position.set(-102,0,0);
		brazo.add(anteBrazo);


*/

		// ... hasta aca

		//this._solve();
	}

	_solve() {
		armarSolucion({
			chasis: this.chasis,
			cabina: this.cabina,
			brazo: this.brazo,
			antebrazo: this.antebrazo,
			pala: this.pala,
			eje: this.eje,
			llanta: this.llanta,
			cubierta: this.cubierta,
			tuerca: this.tuerca,
			vehiculo: this.vehiculo,
		});
	}

	animate(params) {
		if (!this.ready) return;
		/*
		 params contiene:
			posicionSobreRecorrido
			anguloCabina
			anguloBrazo
			anguloAntebrazo
			anguloPala
		
		*/
		// actualizar angulos
		this.cabina.rotation.y = (params.anguloCabina * Math.PI) / 180;
		this.brazo.rotation.z = -Math.PI / 2 + (params.anguloBrazo * Math.PI) / 180;
		this.antebrazo.rotation.z = (params.anguloAntebrazo * Math.PI) / 180;
		this.pala.rotation.z = -Math.PI / 2 + (params.anguloPala * Math.PI) / 180;
		this.eje.rotation.z = params.posicionSobreRecorrido * 0.01;

		// ubicar vehiculo en el recorrido
		this._ubicarVehiculo(params.posicionSobreRecorrido);
	}

	_ubicarVehiculo(u) {
		let pos = this.path.getPointAt(Math.min(0.98, u));
		pos.y += 10;
		this.vehiculo.position.set(pos.x, pos.y, pos.z);
		let target = this.path.getPointAt((u + 0.01) % 1);
		target.y += 10;
		let tangente = new THREE.Vector3();
		tangente.subVectors(target, pos).normalize();
		let yAxis = new THREE.Vector3(0, 1, 0);

		let normal = new THREE.Vector3();
		normal.crossVectors(yAxis, tangente).normalize();
		let target2 = new THREE.Vector3();
		target2.addVectors(pos, normal);
		this.vehiculo.lookAt(target2);
	}
}
