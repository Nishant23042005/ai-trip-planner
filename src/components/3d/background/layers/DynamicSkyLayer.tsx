import * as THREE from "three";

export function initDynamicSky(scene: THREE.Scene) {
  // Create a large background plane to act as our animated sky dome
  const geometry = new THREE.PlaneGeometry(30, 20);
  
  // Custom shader material for smooth, slow color-shifting gradient transitions
  const material = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec2 vUv;
      uniform float uTime;
      void main() {
        // Shift base colors over time
        float t = uTime * 0.08;
        
        // Brand color vectors
        vec3 skyBlue = vec3(0.88, 0.95, 1.0);  // #e0f2fe
        vec3 lightTeal = vec3(0.80, 0.98, 0.95); // #ccfbf1
        vec3 sunsetPeach = vec3(1.0, 0.93, 0.83); // #ffedd5
        
        // Color interpolation
        float mixVal1 = sin(vUv.x * 2.0 + t) * 0.5 + 0.5;
        float mixVal2 = cos(vUv.y * 2.0 - t * 0.8) * 0.5 + 0.5;
        
        vec3 finalColor = mix(skyBlue, lightTeal, mixVal1);
        finalColor = mix(finalColor, sunsetPeach, mixVal2 * 0.4);
        
        gl_FragColor = vec4(finalColor, 0.85); // High opacity sky base
      }
    `,
    depthWrite: false,
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.z = -5; // Sits at the back of the camera perspective
  scene.add(mesh);

  return {
    update: (elapsedTime: number, speedMultiplier: number) => {
      material.uniforms.uTime.value = elapsedTime * speedMultiplier;
    },
    dispose: () => {
      geometry.dispose();
      material.dispose();
    },
  };
}
