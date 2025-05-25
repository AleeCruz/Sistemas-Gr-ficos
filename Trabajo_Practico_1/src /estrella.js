import * as THREE from 'three';

/**
 * Crea una estrella 3D como una forma extruida desde un shape 2D
 * @param {number} outerRadius - radio exterior de la estrella
 * @param {number} innerRadius - radio interior de la estrella
 * @param {number} depth - profundidad de extrusión
 * @param {number} points - número de puntas de la estrella
 * @param {THREE.Material} material - material opcional (MeshStandardMaterial por defecto)
 * @returns {THREE.Mesh} malla de la estrella 3D
 */
function createStar(outerRadius = 0.3, innerRadius = 0.15, depth = 0.34, points = 5, material = null) {
    const shape = new THREE.Shape();
    const step = Math.PI / points;

    shape.moveTo(outerRadius, 0);

    for (let i = 1; i <= points * 2; i++) {
        const r = i % 2 === 0 ? outerRadius : innerRadius;
        const a = i * step;
        shape.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }

    shape.closePath();

    const extrudeSettings = {
        depth: depth,
        bevelEnabled: false,
    };

    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    if (!material) {
        material = new THREE.MeshStandardMaterial({ color: 0xffff00 }); // amarillo
    }

    const starMesh = new THREE.Mesh(geometry, material);
    starMesh.rotation.x = Math.PI / 2;
    return starMesh;
}

export { createStar };
