import * as THREE from 'three';

/**
 * Crea y devuelve una malla de una superficie de barrido lineal vertical
 * a partir de una figura 2D con forma de elipse.
 *
 * @param {number} [radiusX=0.5] El radio de la elipse a lo largo del eje X (horizontal en el perfil 2D).
 * @param {number} [radiusY=0.3] El radio de la elipse a lo largo del eje Y (vertical en el perfil 2D).
 * @param {number} [altura=2] La altura del objeto extruido (longitud del barrido vertical).
 * @param {number} [heightSegments=30] El número de pasos a lo largo de la altura del barrido.
 * @param {number} [color=0x87CEEB] El color del material del objeto.
 * @returns {THREE.Mesh} La malla del objeto extruido.
 */
export function crearElipse_2(
    radiusX = 0.45,
    radiusY = 0.28,
    altura = 2,
    heightSegments = 30,
    color = 0x7FFFD4
) {
    // 1. Crear la forma 2D de la Elipse
    const ellipseShape = new THREE.Shape();
    // absellipse(x, y, radiusX, radiusY, startAngle, endAngle, clockwiseRotation)
    // x, y: centro de la elipse (0,0 para que esté centrada en la extrusión)
    // radiusX, radiusY: radios de la elipse
    // startAngle, endAngle: 0 a 2 * Math.PI para un círculo completo
    // clockwiseRotation: Si la rotación es en sentido horario (true) o antihorario (false)
    ellipseShape.absellipse(0, 0, radiusX, radiusY, 0, Math.PI * 2, false, 0);

    // 2. Definir el recorrido lineal vertical (a lo largo del eje Y)
    // El objeto se extenderá desde su posición inicial hasta (0, altura, 0)
    // Mantengo tu offset inicial de -0.35 si es para que la base quede a una cierta altura.
    // Si quieres que el objeto empiece en 0,0,0 y vaya hacia arriba, cambia startPoint a (0,0,0).
    const startPoint = new THREE.Vector3(0, -0.35, 0); // Ajusta según necesites la base
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
        ellipseShape, // ¡Aquí usamos la forma de la elipse!
        extrudeSettings
    );

    // Es buena práctica calcular las normales para un sombreado correcto
    geometry.computeVertexNormals();

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