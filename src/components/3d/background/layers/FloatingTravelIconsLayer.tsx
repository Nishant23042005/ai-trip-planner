import * as THREE from "three";

export function initFloatingTravelIcons(scene: THREE.Scene, intensity: number) {
  const iconGroup = new THREE.Group();

  // Create simple representations of travel items using low-poly geometries:
  // 1. PIN (Cone)
  const pinGeo = new THREE.ConeGeometry(0.2, 0.4, 4);
  const pinMat = new THREE.MeshPhongMaterial({
    color: 0xea580c,
    flatShading: true,
    transparent: true,
    opacity: 0.28,
  });

  // 2. SUITCASE (Box)
  const caseGeo = new THREE.BoxGeometry(0.4, 0.3, 0.15);
  const caseMat = new THREE.MeshPhongMaterial({
    color: 0x0f766e,
    flatShading: true,
    transparent: true,
    opacity: 0.25,
  });

  // 3. AIRPLANE / paper plane (Tetrahedron)
  const planeGeo = new THREE.ConeGeometry(0.1, 0.5, 3);
  const planeMat = new THREE.MeshPhongMaterial({
    color: 0x0ea5e9,
    flatShading: true,
    transparent: true,
    opacity: 0.28,
  });

  const icons: {
    mesh: THREE.Mesh;
    baseX: number;
    baseY: number;
    driftSpeedX: number;
    driftSpeedY: number;
    rotSpeedX: number;
    rotSpeedY: number;
  }[] = [];

  const count = 7;
  for (let i = 0; i < count; i++) {
    let mesh: THREE.Mesh;
    if (i % 3 === 0) {
      mesh = new THREE.Mesh(pinGeo, pinMat);
    } else if (i % 3 === 1) {
      mesh = new THREE.Mesh(caseGeo, caseMat);
    } else {
      mesh = new THREE.Mesh(planeGeo, planeMat);
    }

    // Place across viewport coordinates
    mesh.position.x = (Math.random() - 0.5) * 10;
    mesh.position.y = (Math.random() - 0.5) * 6;
    mesh.position.z = (Math.random() - 0.5) * 3; // depth variance

    iconGroup.add(mesh);

    icons.push({
      mesh,
      baseX: mesh.position.x,
      baseY: mesh.position.y,
      driftSpeedX: (0.012 + Math.random() * 0.015) * (Math.random() > 0.5 ? 1 : -1) * intensity,
      driftSpeedY: (0.012 + Math.random() * 0.015) * (Math.random() > 0.5 ? 1 : -1) * intensity,
      rotSpeedX: (0.01 + Math.random() * 0.02) * intensity,
      rotSpeedY: (0.01 + Math.random() * 0.02) * intensity,
    });
  }

  scene.add(iconGroup);

  return {
    update: () => {
      icons.forEach((icon) => {
        // Move icons
        icon.mesh.position.x += icon.driftSpeedX;
        icon.mesh.position.y += icon.driftSpeedY;
        
        // Rotate icons
        icon.mesh.rotation.x += icon.rotSpeedX;
        icon.mesh.rotation.y += icon.rotSpeedY;

        // Wrap around boundaries
        if (icon.mesh.position.x > 6) {
          icon.mesh.position.x = -6;
        } else if (icon.mesh.position.x < -6) {
          icon.mesh.position.x = 6;
        }

        if (icon.mesh.position.y > 4) {
          icon.mesh.position.y = -4;
        } else if (icon.mesh.position.y < -4) {
          icon.mesh.position.y = 4;
        }
      });
    },
    dispose: () => {
      pinGeo.dispose();
      pinMat.dispose();
      caseGeo.dispose();
      caseMat.dispose();
      planeGeo.dispose();
      planeMat.dispose();
    },
  };
}
