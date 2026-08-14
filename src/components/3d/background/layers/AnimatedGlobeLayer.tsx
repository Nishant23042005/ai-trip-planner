import * as THREE from "three";

export function initAnimatedGlobe(scene: THREE.Scene) {
  const globeGroup = new THREE.Group();
  globeGroup.position.set(-2.8, -1.2, -1.5); // Placed slightly left/down to frame hero text

  // 1. Dotted low-poly sphere
  const globeGeo = new THREE.IcosahedronGeometry(1.6, 1);
  const globeMat = new THREE.MeshPhongMaterial({
    color: 0x0ea5e9,
    wireframe: true,
    transparent: true,
    opacity: 0.15,
  });
  const globeMesh = new THREE.Mesh(globeGeo, globeMat);
  globeGroup.add(globeMesh);

  // 2. Pulse Marker Points at cities
  const markerGeo = new THREE.SphereGeometry(0.06, 8, 8);
  const markerMat = new THREE.MeshBasicMaterial({ color: 0x0f766e });
  const pulseMat = new THREE.MeshBasicMaterial({
    color: 0x0ea5e9,
    transparent: true,
    opacity: 0.5,
  });

  const cityPositions = [
    new THREE.Vector3(1.1, 0.8, 1.0),
    new THREE.Vector3(-0.3, 1.3, 0.8),
    new THREE.Vector3(-1.1, 0.9, 0.9),
    new THREE.Vector3([-0.8, -0.9, 1.1][0], [-0.8, -0.9, 1.1][1], [-0.8, -0.9, 1.1][2]),
  ];

  const pulseMeshes: THREE.Mesh[] = [];

  cityPositions.forEach((pos) => {
    const marker = new THREE.Mesh(markerGeo, markerMat);
    marker.position.copy(pos);
    globeGroup.add(marker);

    // Glowing shell for pulsing effect
    const pulse = new THREE.Mesh(markerGeo, pulseMat);
    pulse.position.copy(pos);
    globeGroup.add(pulse);
    pulseMeshes.push(pulse);
  });

  // 3. Glowing Route Arcs (curves connecting cities)
  const routeGroup = new THREE.Group();
  const lineMat = new THREE.LineBasicMaterial({
    color: 0x0ea5e9,
    transparent: true,
    opacity: 0.25,
  });

  for (let i = 0; i < cityPositions.length - 1; i++) {
    const p1 = cityPositions[i];
    const p2 = cityPositions[i + 1];

    // Create curve midpoint floating above sphere surface
    const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
    mid.normalize().multiplyScalar(1.9); // arc peak height

    const curve = new THREE.QuadraticBezierCurve3(p1, mid, p2);
    const points = curve.getPoints(25);
    const routeGeo = new THREE.BufferGeometry().setFromPoints(points);
    const routeLine = new THREE.Line(routeGeo, lineMat);
    routeGroup.add(routeLine);
  }

  globeGroup.add(routeGroup);
  scene.add(globeGroup);

  return {
    update: (elapsedTime: number, speedMultiplier: number) => {
      // Rotate the globe
      globeGroup.rotation.y = elapsedTime * 0.08 * speedMultiplier;
      globeGroup.rotation.x = elapsedTime * 0.04 * speedMultiplier;

      // Pulse city markers
      const scale = 1.0 + Math.sin(elapsedTime * 4) * 0.5;
      pulseMeshes.forEach((pulse) => {
        pulse.scale.set(scale, scale, scale);
      });
    },
    dispose: () => {
      globeGeo.dispose();
      globeMat.dispose();
      markerGeo.dispose();
      markerMat.dispose();
      pulseMat.dispose();
      lineMat.dispose();
      routeGroup.children.forEach((child) => {
        if (child instanceof THREE.Line) child.geometry.dispose();
      });
    },
  };
}
