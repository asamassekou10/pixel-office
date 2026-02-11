import * as THREE from 'three';

/**
 * Grid-friendly smooth movement controller for top-down agents.
 * Moves at constant speed toward target (no rotation).
 */
export class MovementController {
  private currentPos = new THREE.Vector3();
  private targetPos = new THREE.Vector3();
  private readonly speed = 4.0; // world units per second

  /** Last non-zero movement direction (normalized). */
  public readonly lastDirection = new THREE.Vector3();

  setPosition(pos: THREE.Vector3): void {
    this.currentPos.copy(pos);
    this.targetPos.copy(pos);
  }

  setTarget(target: THREE.Vector3): void {
    this.targetPos.copy(target);
  }

  update(delta: number, model: THREE.Group): void {
    const diff = new THREE.Vector3().subVectors(this.targetPos, this.currentPos);
    const dist = diff.length();

    if (dist > 0.05) {
      diff.normalize();
      this.lastDirection.copy(diff);
      const step = Math.min(this.speed * delta, dist);
      diff.multiplyScalar(step);
      this.currentPos.add(diff);
    } else {
      this.currentPos.copy(this.targetPos);
    }

    model.position.copy(this.currentPos);
  }

  get isMoving(): boolean {
    return this.currentPos.distanceToSquared(this.targetPos) > 0.01;
  }

  get position(): THREE.Vector3 {
    return this.currentPos;
  }
}
