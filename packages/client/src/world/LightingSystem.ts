import * as THREE from 'three';

/**
 * Simple even lighting for top-down pixel-art view.
 * No dramatic shadows or point lights — just bright, flat illumination.
 */
export class LightingSystem {
  constructor(scene: THREE.Scene) {
    // Bright ambient so all colors are visible
    const ambient = new THREE.AmbientLight(0xffffff, 1.8);
    scene.add(ambient);

    // Subtle directional from above for very mild depth cues
    const directional = new THREE.DirectionalLight(0xffffff, 0.3);
    directional.position.set(0, 20, 5);
    scene.add(directional);
  }

  update(_delta: number): void {
    // No dynamic lighting in pixel-art mode
  }
}
