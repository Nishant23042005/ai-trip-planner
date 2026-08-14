import * as THREE from "three";

export function initRouteLines(scene: THREE.Scene, intensity: number) {
  const routeGroup = new THREE.Group();

  const paths: {
    curve: THREE.QuadraticBezierCurve3;
    line: THREE.Line;
    particles: THREE.Mesh[];
  }[] = [];

  const lineCount = 3;
  const pathMat = new THREE.LineBasicMaterial({
    color: 0x0ea5e9,
    transparent: true,
    opacity: 0.12,
  });

  const pMarkerGeo = new THREE.SphereGeometry(0.04, 8, 8);
  const pMarkerMat = new THREE.MeshBasicMaterial({
    color: 0xea580c,
    transparent: true,
    opacity: 0.7,
  });

  for (let i = 0; i < lineCount; i++) {
    // Generate curved bezier flight lines crossing screen
    const curve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(-6, -2 + i * 1.5, 0),
      new THREE.Vector3((Math.random() - 0.5) * 4, 3 - i * 0.8, -1.5),
      new THREE.Vector3(6, -1 - i * 0.5, 0)
    );

    const points = curve.getPoints(30);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(geometry, pathMat);
    routeGroup.add(line);

    // Spawn 2 traveling node particles along this route curve
    const particles: THREE.Mesh[] = [];
    for (let p = 0; p < 2; p++) {
      const pMesh = new THREE.Mesh(pMarkerGeo, pMarkerMat);
      routeGroup.add(pMesh);
      particles.push(pMesh);
    }

    paths.push({ curve, line, particles });
  }

  scene.add(routeGroup);

  return {
    update: (elapsedTime: number) => {
      paths.forEach((path) => {
        path.particles.forEach((part, pIdx) => {
          // Calculate percentage along path curve based on time offsets
          const tOffset = pIdx * 0.5;
          const percent = ((elapsedTime * 0.12 * intensity) + tOffset) % 1.0;
          
          const pos = path.curve.getPointAt(percent);
          part.position.copy(pos);
        });
      });
    },
    dispose: () => {
      pathMat.dispose();
      pMarkerGeo.dispose();
      pMarkerMat.dispose();
      paths.forEach((p) => p.line.geometry.dispose());
    },
  };
}
