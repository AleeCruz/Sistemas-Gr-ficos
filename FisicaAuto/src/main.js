// src/main.js
import { scene, camera, renderer, controls } from './scene.js';
import { PhysicsSimulator } from './physics/PhysicsSimulator.js';
import { defaultVehicleParams, defaultGroundParams } from './physics/VehicleConfig.js';
import { createCarModel } from './graphics/createCarModel.js';
import { RapierHelper } from 'three/addons/helpers/RapierHelper.js';

import * as THREE from 'three';

let physicsSimulator;
let chassisMesh;
const clock = new THREE.Clock();

(async function start() {
  physicsSimulator = new PhysicsSimulator(defaultVehicleParams, defaultGroundParams);
  await physicsSimulator.initSimulation();

  const helper = new RapierHelper(scene, physicsSimulator.physics.world);
  scene.add(helper);

  chassisMesh = await createCarModel(scene);

  renderer.setAnimationLoop(animate);
})();

function animate() {
  const deltaTime = clock.getDelta();

  if (physicsSimulator && physicsSimulator.initComplete) {
    physicsSimulator.update(deltaTime);
    const transform = physicsSimulator.getVehicleTransform();
    if (transform) {
      chassisMesh.position.copy(transform.position);
      chassisMesh.quaternion.copy(transform.quaternion);
    }
  }

  controls.update();
  renderer.render(scene, camera);
}
