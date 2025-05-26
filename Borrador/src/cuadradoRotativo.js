import * as THREE from 'three';

/**
 * Crea y de
 */
export function crearCuadradoVertical(
    side = 0.7, // Lado del cuadrado
    altura = 2,
    heightSegments = 1, // Para una extrusión simple, 1 o pocos segmentos son suficientes
    color = 0xFF4500 // Mismo color azul cielo por defecto
) {
    // 1. Crear la forma 2D del cuadrado
    // Para centrar el cuadrado alrededor del origen (0,0) en el plano XY
    const halfSide = side / 2;
    const squareShape = new THREE.Shape();
    squareShape.moveTo(-halfSide, -halfSide);  // Esquina inferior izquierda
    squareShape.lineTo(halfSide, -halfSide);   // Esquina inferior derecha
    squareShape.lineTo(halfSide, halfSide);    // Esquina superior derecha
    squareShape.lineTo(-halfSide, halfSide);   // Esquina superior izquierda
    squareShape.closePath(); // Cierra la forma, conectando la última línea con la primera

    // 2. Definir el recorrido lineal vertical (a lo largo del eje Y)
    // Se extiende desde un punto inicial hasta un punto final.
    // Mantenemos tu offset inicial de -0.35 para la base del objeto.
    const startPoint = new THREE.Vector3(0, -0.35, 0);
    const endPoint = new THREE.Vector3(0, altura, 0);
    const path = new THREE.LineCurve3(startPoint, endPoint);

    // 3. Configuración para la extrusión
    const extrudeSettings = {
        steps: heightSegments,   // Número de "pasos" o segmentos a lo largo de la altura
        bevelEnabled: false,     // Sin biselado en los bordes por defecto
        extrudePath: path,       // El recorrido lineal vertical que seguirá el cuadrado
    };

    // 4. Crear la geometría de extrusión (la superficie de barrido)
    const geometry = new THREE.ExtrudeGeometry(
        squareShape, // ¡Aquí usamos la forma 2D del cuadrado!
        extrudeSettings
    );

    // Es buena práctica calcular las normales de los vértices para un sombreado correcto,
    // especialmente si el material interactúa con luces.
    geometry.computeVertexNormals();

    // 5. Crear el material
    const material = new THREE.MeshStandardMaterial({
        color: color,
        wireframe: false, // Por defecto, no mostrará el esqueleto de la malla
        side: THREE.DoubleSide // Renderiza ambos lados de la superficie
    });

    // 6. Crear la malla y devolverla
    const mesh = new THREE.Mesh(geometry, material);

    return mesh;
}