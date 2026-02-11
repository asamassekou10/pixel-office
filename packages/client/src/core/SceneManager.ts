import * as THREE from 'three';

/**
 * Creates and configures the Three.js Scene for top-down pixel-art view.
 * No fog (2D scenes don't need depth fog).
 */
export class SceneManager {
  public readonly scene: THREE.Scene;

  constructor() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x2c2c3a);
  }
}
