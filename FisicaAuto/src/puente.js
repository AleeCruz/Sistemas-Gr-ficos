// puente/crearPuenteAutopista.js

import * as THREE from 'three';

export function crearPuenteAutopista() {
    const bridgeGroup = new THREE.Group();

    const BRIDGE_LENGTH = 150;
    const BRIDGE_WIDTH = 30;
    const DECK_HEIGHT = 40;
    const ARCH_HEIGHT = 50;
    const ARCH_THICKNESS = 8;

    const concreteMaterial = new THREE.MeshStandardMaterial({ color: 0x909090, roughness: 0.7, metalness: 0.1 });
    const asphaltMaterial = new THREE.MeshStandardMaterial({ color: 0x303030, roughness: 0.9, metalness: 0.0 });
    const whiteLineMaterial = new THREE.MeshStandardMaterial({ color: 0xFFFFFF, roughness: 0.5, metalness: 0.0 });

    const deckGeometry = new THREE.BoxGeometry(BRIDGE_LENGTH, 1.5, BRIDGE_WIDTH);
    const deck = new THREE.Mesh(deckGeometry, asphaltMaterial);
    deck.position.y = DECK_HEIGHT;
    deck.castShadow = true;
    deck.receiveShadow = true;
    bridgeGroup.add(deck);

    const laneLineGeometry = new THREE.BoxGeometry(BRIDGE_LENGTH - 2, 0.1, 0.5);
    const centerline = new THREE.Mesh(laneLineGeometry, whiteLineMaterial);
    centerline.position.set(0, DECK_HEIGHT + 0.8, 0);
    bridgeGroup.add(centerline);

    const laneOffset = BRIDGE_WIDTH / 4;
    const laneLine1 = new THREE.Mesh(laneLineGeometry, whiteLineMaterial);
    laneLine1.position.set(0, DECK_HEIGHT + 0.8, laneOffset);
    bridgeGroup.add(laneLine1);

    const laneLine2 = new THREE.Mesh(laneLineGeometry, whiteLineMaterial);
    laneLine2.position.set(0, DECK_HEIGHT + 0.8, -laneOffset);
    bridgeGroup.add(laneLine2);

    const arcPoints = [];
    const numArcSegments = 50;
    for (let i = 0; i <= numArcSegments; i++) {
        const t = (i / numArcSegments) * Math.PI;
        const x = (BRIDGE_LENGTH / 2) * Math.cos(t);
        const y = ARCH_HEIGHT * Math.sin(t);
        arcPoints.push(new THREE.Vector3(x, y - ARCH_HEIGHT / 2 + 1, 0));
    }
    const arcCurve = new THREE.CatmullRomCurve3(arcPoints);

    const arcProfileShape = new THREE.Shape();
    arcProfileShape.moveTo(0, -ARCH_THICKNESS / 2);
    arcProfileShape.lineTo(ARCH_THICKNESS, -ARCH_THICKNESS / 2);
    arcProfileShape.lineTo(ARCH_THICKNESS, ARCH_THICKNESS / 2);
    arcProfileShape.lineTo(0, ARCH_THICKNESS / 2);
    arcProfileShape.lineTo(0, -ARCH_THICKNESS / 2);

    const arcGeometry = new THREE.ExtrudeGeometry(arcProfileShape, {
        steps: numArcSegments * 2,
        bevelEnabled: false,
        extrudePath: arcCurve
    });

    const mainArch = new THREE.Mesh(arcGeometry, concreteMaterial);
    mainArch.position.set(0, ARCH_HEIGHT / 2 - 2, 0);
    mainArch.castShadow = true;
    mainArch.receiveShadow = true;
    bridgeGroup.add(mainArch);

    const numVerticalSupports = 10;
    const supportRadius = 1.0;

    for (let i = 0; i <= numVerticalSupports; i++) {
        const t = (i / numVerticalSupports);
        const xPosition = -BRIDGE_LENGTH / 2 + (t * BRIDGE_LENGTH);
        const archY = ARCH_HEIGHT * Math.sin(Math.acos(xPosition / (BRIDGE_LENGTH / 2))) - ARCH_HEIGHT / 2;
        const pilarHeight = (DECK_HEIGHT - archY);

        if (pilarHeight > supportRadius * 2) {
            const currentSupportGeometry = new THREE.CylinderGeometry(supportRadius, supportRadius, pilarHeight, 16);
            const support = new THREE.Mesh(currentSupportGeometry, concreteMaterial);
            support.position.set(xPosition, archY + pilarHeight / 2, 0);
            support.castShadow = true;
            support.receiveShadow = true;
            bridgeGroup.add(support);
        }
    }

    const abutmentWidth = 20;
    const abutmentDepth = 15;
    const abutmentHeight = DECK_HEIGHT + 5;
    const abutmentGeometry = new THREE.BoxGeometry(abutmentWidth, abutmentHeight, abutmentDepth);

    const abutment1 = new THREE.Mesh(abutmentGeometry, concreteMaterial);
    abutment1.position.set(-BRIDGE_LENGTH / 2 - abutmentWidth / 2 + 5, abutmentHeight / 2 - 5, 0);
    abutment1.castShadow = true;
    abutment1.receiveShadow = true;
    bridgeGroup.add(abutment1);

    const abutment2 = new THREE.Mesh(abutmentGeometry, concreteMaterial);
    abutment2.position.set(BRIDGE_LENGTH / 2 + abutmentWidth / 2 - 5, abutmentHeight / 2 - 5, 0);
    abutment2.castShadow = true;
    abutment2.receiveShadow = true;
    bridgeGroup.add(abutment2);

    const railHeight = 2.5;
    const railThickness = 0.5;
    const railLength = BRIDGE_LENGTH + 10;
    const railGeometry = new THREE.BoxGeometry(railLength, railHeight, railThickness);
    const railMaterial = new THREE.MeshStandardMaterial({ color: 0x555555, roughness: 0.6, metalness: 0.3 });

    const railOffset = BRIDGE_WIDTH / 2 + railThickness / 2;

    const guardrail1 = new THREE.Mesh(railGeometry, railMaterial);
    guardrail1.position.set(0, DECK_HEIGHT + railHeight / 2, railOffset);
    guardrail1.castShadow = true;
    guardrail1.receiveShadow = true;
    bridgeGroup.add(guardrail1);

    const guardrail2 = new THREE.Mesh(railGeometry, railMaterial);
    guardrail2.position.set(0, DECK_HEIGHT + railHeight / 2, -railOffset);
    guardrail2.castShadow = true;
    guardrail2.receiveShadow = true;
    bridgeGroup.add(guardrail2);

    return bridgeGroup;
}
