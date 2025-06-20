import {
  BufferGeometry,
  Float32BufferAttribute,
  Vector3
} from "./chunk-G7DZY5DB.js";

// Borrador/node_modules/three/examples/jsm/geometries/ParametricGeometry.js
var ParametricGeometry = class extends BufferGeometry {
  /**
   * Constructs a new parametric geometry.
   *
   * @param {ParametricGeometry~Func} func - The parametric function. Default is a function that generates a curved plane surface.
   * @param {number} [slices=8] - The number of slices to use for the parametric function.
   * @param {number} [stacks=8] - The stacks of slices to use for the parametric function.
   */
  constructor(func = (u, v, target) => target.set(u, v, Math.cos(u) * Math.sin(v)), slices = 8, stacks = 8) {
    super();
    this.type = "ParametricGeometry";
    this.parameters = {
      func,
      slices,
      stacks
    };
    const indices = [];
    const vertices = [];
    const normals = [];
    const uvs = [];
    const EPS = 1e-5;
    const normal = new Vector3();
    const p0 = new Vector3(), p1 = new Vector3();
    const pu = new Vector3(), pv = new Vector3();
    const sliceCount = slices + 1;
    for (let i = 0; i <= stacks; i++) {
      const v = i / stacks;
      for (let j = 0; j <= slices; j++) {
        const u = j / slices;
        func(u, v, p0);
        vertices.push(p0.x, p0.y, p0.z);
        if (u - EPS >= 0) {
          func(u - EPS, v, p1);
          pu.subVectors(p0, p1);
        } else {
          func(u + EPS, v, p1);
          pu.subVectors(p1, p0);
        }
        if (v - EPS >= 0) {
          func(u, v - EPS, p1);
          pv.subVectors(p0, p1);
        } else {
          func(u, v + EPS, p1);
          pv.subVectors(p1, p0);
        }
        normal.crossVectors(pu, pv).normalize();
        normals.push(normal.x, normal.y, normal.z);
        uvs.push(u, v);
      }
    }
    for (let i = 0; i < stacks; i++) {
      for (let j = 0; j < slices; j++) {
        const a = i * sliceCount + j;
        const b = i * sliceCount + j + 1;
        const c = (i + 1) * sliceCount + j + 1;
        const d = (i + 1) * sliceCount + j;
        indices.push(a, b, d);
        indices.push(b, c, d);
      }
    }
    this.setIndex(indices);
    this.setAttribute("position", new Float32BufferAttribute(vertices, 3));
    this.setAttribute("normal", new Float32BufferAttribute(normals, 3));
    this.setAttribute("uv", new Float32BufferAttribute(uvs, 2));
  }
  copy(source) {
    super.copy(source);
    this.parameters = Object.assign({}, source.parameters);
    return this;
  }
};
export {
  ParametricGeometry
};
//# sourceMappingURL=three_examples_jsm_geometries_ParametricGeometry__js.js.map
