import * as THREE from 'three';

/**
 * Crea y devuelve una malla de un cilindro vertical extruido
 * a partir de una circunferencia.
 */


export function crearCilindroVertical(
    radius = 0.33,
    altura = 2,
    heightSegments = 30,
    color = 0x87CEEB
) {
    // 1. Crear la forma 2D de la circunferencia
    const circleShape = new THREE.Shape();
    // absarc(x, y, radius, startAngle, endAngle, clockwise)
    circleShape.absarc(0, 0, radius, 0, Math.PI * 2, false);

    // 2. Definir el recorrido lineal vertical (a lo largo del eje Y)
    // El cilindro se extenderá desde (0,0,0) hasta (0, height, 0)
    const startPoint = new THREE.Vector3(0, -0.35, 0);
    const endPoint = new THREE.Vector3(0, altura, 0);
    const path = new THREE.LineCurve3(startPoint, endPoint);

    // 3. Configuración para la extrusión
    const extrudeSettings = {
        steps: heightSegments,   // Número de pasos a lo largo del recorrido (altura)
        bevelEnabled: false,     // Sin biselado en los bordes
        extrudePath: path,       // El recorrido lineal vertical
    };

    // 4. Crear la geometría de extrusión
    const geometry = new THREE.ExtrudeGeometry(
        circleShape,
        extrudeSettings
    );

    // 5. Crear el material
    const material = new THREE.MeshStandardMaterial({
        color: color,
        wireframe: false,
        side: THREE.DoubleSide // Renderiza ambos lados de la superficie
    });

    // 6. Crear la malla y devolverla
    const mesh = new THREE.Mesh(geometry, material);


    return mesh;
}