import * as THREE from 'three';

export interface DeskSpot {
  position: THREE.Vector3;  // World position of the chair (where agent sits)
  monitorDir: 'up' | 'down' | 'left' | 'right'; // Direction agent faces
  occupied: boolean;
}

/**
 * Grid-based office layout.
 * The office is 24 columns x 18 rows, each cell = 1 world unit.
 * (0,0) is top-left, +X is right, +Z is down (from top-down camera).
 */
export const GRID_COLS = 24;
export const GRID_ROWS = 18;

/**
 * Desk spots where agents can sit and "work".
 * Position is where the agent stands/sits (the chair).
 */
export const DESK_SPOTS: DeskSpot[] = [
  // Row 1 - top desk cluster (facing down)
  { position: new THREE.Vector3(6, 0, 5), monitorDir: 'up', occupied: false },
  { position: new THREE.Vector3(8, 0, 5), monitorDir: 'up', occupied: false },
  { position: new THREE.Vector3(10, 0, 5), monitorDir: 'up', occupied: false },

  // Row 2 - second cluster (facing up)
  { position: new THREE.Vector3(6, 0, 8), monitorDir: 'down', occupied: false },
  { position: new THREE.Vector3(8, 0, 8), monitorDir: 'down', occupied: false },
  { position: new THREE.Vector3(10, 0, 8), monitorDir: 'down', occupied: false },

  // Row 3 - third cluster (facing down)
  { position: new THREE.Vector3(6, 0, 11), monitorDir: 'up', occupied: false },
  { position: new THREE.Vector3(8, 0, 11), monitorDir: 'up', occupied: false },
  { position: new THREE.Vector3(10, 0, 11), monitorDir: 'up', occupied: false },

  // Row 4 - fourth cluster (facing up)
  { position: new THREE.Vector3(6, 0, 14), monitorDir: 'down', occupied: false },
  { position: new THREE.Vector3(8, 0, 14), monitorDir: 'down', occupied: false },
  { position: new THREE.Vector3(10, 0, 14), monitorDir: 'down', occupied: false },

  // Right side desks
  { position: new THREE.Vector3(16, 0, 5), monitorDir: 'up', occupied: false },
  { position: new THREE.Vector3(18, 0, 5), monitorDir: 'up', occupied: false },
  { position: new THREE.Vector3(16, 0, 8), monitorDir: 'down', occupied: false },
  { position: new THREE.Vector3(18, 0, 8), monitorDir: 'down', occupied: false },

  // Solo desks near meeting room
  { position: new THREE.Vector3(16, 0, 12), monitorDir: 'up', occupied: false },
  { position: new THREE.Vector3(18, 0, 12), monitorDir: 'up', occupied: false },
  { position: new THREE.Vector3(20, 0, 12), monitorDir: 'up', occupied: false },
  { position: new THREE.Vector3(16, 0, 15), monitorDir: 'down', occupied: false },
];

/** Claim an empty desk for an agent. Returns the desk spot or undefined. */
export function claimDesk(): DeskSpot | undefined {
  const free = DESK_SPOTS.find(d => !d.occupied);
  if (free) free.occupied = true;
  return free;
}

/** Release a desk spot. */
export function releaseDesk(desk: DeskSpot): void {
  desk.occupied = false;
}
