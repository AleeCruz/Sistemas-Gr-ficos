import * as THREE from 'three';
import {scene} from "./scene.js";



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


export {Geometry2D,catmullRomCurve,extrudeSettings,
    mallaSuperficie
};