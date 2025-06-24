import * as THREE from 'three';
import { ParametricGeometry } from 'three/examples/jsm/geometries/ParametricGeometry.js';

/**
 * Crea un cilindro vertical mediante una superficie paramétrica, incluyendo tapas superior e inferior.
 */
export function crearCilindroVertical_1(
    radius = 0.33,
    altura = 2.35,
    heightSegments = 30,
    radialSegments = 20,
    color = 0x87CEEB
) {
    // 1. Superficie lateral paramétrica
    const cilindroParametrico = (u, v, target) => {
        const angle = 2 * Math.PI * v;
        const x = radius * Math.cos(angle);
        const y = u * altura - 0.35;
        const z = radius * Math.sin(angle);
        target.set(x, y, z);
    };

    const cuerpoGeometry = new ParametricGeometry(cilindroParametrico, radialSegments, heightSegments);
    const material = new THREE.MeshStandardMaterial({ color, side: THREE.DoubleSide , wireframe: false });

    const cuerpo = new THREE.Mesh(cuerpoGeometry, material);

    // 2. Tapa inferior
    const tapaInferiorGeom = new THREE.CircleGeometry(radius, radialSegments);
    tapaInferiorGeom.rotateX(-Math.PI / 2); // orientación hacia arriba
    tapaInferiorGeom.translate(0, -0.35, 0);
    const tapaInferior = new THREE.Mesh(tapaInferiorGeom, material);

    // 3. Tapa superior
    const tapaSuperiorGeom = new THREE.CircleGeometry(radius, radialSegments);
    tapaSuperiorGeom.rotateX(Math.PI / 2); // orientación hacia abajo
    tapaSuperiorGeom.translate(0, altura - 0.35, 0);
    const tapaSuperior = new THREE.Mesh(tapaSuperiorGeom, material);

    // 4. Crear un grupo con el cilindro completo
    const grupo = new THREE.Group();
    grupo.add(cuerpo, tapaInferior, tapaSuperior);

    return grupo;
}
