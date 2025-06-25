import * as THREE from 'three'; 
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export function cargarAuto(ruta, onLoad) {
  const loader = new GLTFLoader();

  loader.load(
    ruta,
    (gltf) => {
      const auto = gltf.scene;
      auto.scale.set(0.01, 0.01, 0.01); // Escalá si es necesario
      auto.traverse(obj => {
        if (obj.isMesh) {
          obj.castShadow = true;
          obj.receiveShadow = true;
        }
      });
      onLoad(auto); // callback para usar el auto en tu escena
    },
    undefined,
    (error) => {
      console.error('Error al cargar el modelo:', error);
    }
  );
}
