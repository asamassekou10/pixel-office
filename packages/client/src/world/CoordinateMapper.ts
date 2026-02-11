import * as THREE from 'three';
import { WORLD_3D_WIDTH, WORLD_3D_DEPTH, SERVER_WIDTH, SERVER_HEIGHT } from '../config.js';

/**
 * Maps between server coordinate space (0-800, 0-600) and
 * Three.js world space (0-40, 0, 0-30) on the XZ plane.
 */

export function serverToWorld(serverX: number, serverY: number): THREE.Vector3 {
  const worldX = (serverX / SERVER_WIDTH) * WORLD_3D_WIDTH;
  const worldZ = (serverY / SERVER_HEIGHT) * WORLD_3D_DEPTH;
  return new THREE.Vector3(worldX, 0, worldZ);
}

export function worldToServer(worldPos: THREE.Vector3): { x: number; y: number } {
  return {
    x: (worldPos.x / WORLD_3D_WIDTH) * SERVER_WIDTH,
    y: (worldPos.z / WORLD_3D_DEPTH) * SERVER_HEIGHT,
  };
}
