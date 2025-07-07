import * as THREE from 'three';
import { ParametricGeometry } from 'three/examples/jsm/geometries/ParametricGeometry.js';

// Cargar la textura de ventanas (asegurate de que esté en public/textures/)
const texturaVentanas = new THREE.TextureLoader().load('textures/image.png');
texturaVentanas.wrapS = THREE.RepeatWrapping;
texturaVentanas.wrapT = THREE.RepeatWrapping;
texturaVentanas.repeat.set(5, 3); // Ajustá esto a gusto

// Material con textura para el cuerpo
const materialCuerpo = new THREE.MeshStandardMaterial({
    map: texturaVentanas,
    side: THREE.DoubleSide,
});

// Material liso para las tapas
const materialTapa = new THREE.MeshStandardMaterial({
    color: 0x555555, // gris oscuro o el que prefieras
    side: THREE.DoubleSide,
});

export function crearCilindroVertical_1(
    radius = 0.33,
    altura = 2.75,
    heightSegments = 30,
    radialSegments = 20
) {
    const cilindroParametrico = (u, v, target) => {
        const angle = 2 * Math.PI * v;
        const x = radius * Math.cos(angle);
        const y = u * altura - 0.35;
        const z = radius * Math.sin(angle);
        target.set(x, y, z);
    };

    const cuerpoGeometry = new ParametricGeometry(cilindroParametrico, radialSegments, heightSegments);
    const cuerpo = new THREE.Mesh(cuerpoGeometry, materialCuerpo);

    // Tapas con material plano
    const tapaInferiorGeom = new THREE.CircleGeometry(radius, radialSegments);
    tapaInferiorGeom.rotateX(-Math.PI / 2).translate(0, -0.35, 0);
    const tapaInferior = new THREE.Mesh(tapaInferiorGeom, materialTapa);

    const tapaSuperiorGeom = new THREE.CircleGeometry(radius, radialSegments);
    tapaSuperiorGeom.rotateX(Math.PI / 2).translate(0, altura - 0.35, 0);
    const tapaSuperior = new THREE.Mesh(tapaSuperiorGeom, materialTapa);

    const grupo = new THREE.Group();
    grupo.add(cuerpo, tapaInferior, tapaSuperior);

    return grupo;
}
