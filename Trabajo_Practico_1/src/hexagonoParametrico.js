import * as THREE from 'three';
import { ParametricGeometry } from 'three/examples/jsm/geometries/ParametricGeometry.js';

/**
 * Crea un hexágono que asciende en Y y cambia de escala durante el recorrido,
 * usando geometría paramétrica. Incluye tapas superior e inferior.
 */
export function crearHexagonoEscaladoBarridoParametrico(
  radio = 0.35,
  altura = 2.35,
  pasosAltura = 40,
  pasosContorno = 10,
  escalaMaxima = 0.68,
  color = 0xff4500,
  wireframe = false
) {
  const lados = 6;
  const anguloPaso = (2 * Math.PI) / lados;

  // Función paramétrica: u (0 a 1 en altura), v (0 a 1 en contorno)
  const superficieParametrica = (u, v, target) => {
    const t = u;
    const y = t * altura - 0.35;
    const scale = 1 - (1 - escalaMaxima) * Math.sin(Math.PI * t);

    const ang = v * 2 * Math.PI;
    const sector = Math.floor(ang / anguloPaso);
    const local = (ang % anguloPaso) / anguloPaso;

    const a1 = sector * anguloPaso;
    const a2 = (sector + 1) * anguloPaso;

    const x1 = Math.cos(a1) * radio * scale;
    const z1 = Math.sin(a1) * radio * scale;
    const x2 = Math.cos(a2) * radio * scale;
    const z2 = Math.sin(a2) * radio * scale;

    const x = (1 - local) * x1 + local * x2;
    const z = (1 - local) * z1 + local * z2;

    target.set(x, y, z);
  };

  const cuerpo = new ParametricGeometry(superficieParametrica, pasosContorno, pasosAltura);

  const material = new THREE.MeshStandardMaterial({
    color,
    side: THREE.DoubleSide,
    flatShading: true,
    metalness: 0.4,
    roughness: 0.5,
    wireframe
  });

  const mallaCuerpo = new THREE.Mesh(cuerpo, material);

  // 🔽 Crear tapas (inferior y superior)
  const crearTapa = (y, scale, invertida = false) => {
    const vertices = [];
    const center = new THREE.Vector3(0, y, 0);
    for (let i = 0; i < lados; i++) {
      const ang = i * anguloPaso;
      const x = Math.cos(ang) * radio * scale;
      const z = Math.sin(ang) * radio * scale;
      vertices.push(new THREE.Vector3(x, y, z));
    }

    const geometry = new THREE.BufferGeometry();
    const posiciones = [];

    // Agregar centro
    posiciones.push(center.x, center.y, center.z);

    // Agregar contorno
    vertices.forEach(v => posiciones.push(v.x, v.y, v.z));

    // Crear índices
    const indices = [];
    for (let i = 1; i <= lados; i++) {
      const a = 0;
      const b = i;
      const c = i % lados + 1;
      if (invertida) {
        indices.push(a, c, b);
      } else {
        indices.push(a, b, c);
      }
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(posiciones, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();

    return new THREE.Mesh(geometry, material);
  };

  const tapaInferior = crearTapa(-0.35, 1, true);
  const tapaSuperior = crearTapa(altura - 0.35, 1, false);

  // Agrupar cuerpo y tapas
  const grupo = new THREE.Group();
  grupo.add(mallaCuerpo);
  grupo.add(tapaInferior);
  grupo.add(tapaSuperior);

  return grupo;
}
