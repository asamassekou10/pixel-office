import * as THREE from 'three';
import { AgentState } from '@pixel-office/shared';

/**
 * UV-offset sprite animation controller.
 * Operates on a 4x4 sprite sheet (128x128, each frame 32x32).
 *
 * Rows: 0=Idle, 1=Walking, 2=Working, 3=Error
 * Each row has 4 frames played at a pixel-art-friendly frame rate.
 */
export class SpriteAnimationController {
  private currentRow = 0;
  private currentFrame = 0;
  private elapsed = 0;
  private frameRate = 6; // FPS for pixel-art feel
  private frameCount = 4;
  private flippedX = false;

  private material: THREE.SpriteMaterial;

  constructor(material: THREE.SpriteMaterial) {
    this.material = material;

    // Set initial UV repeat to show 1/4 of the sheet in each axis
    material.map!.repeat.set(0.25, 0.25);
    this.applyUV();
  }

  /** Switch animation state. */
  setState(state: AgentState): void {
    const row = this.stateToRow(state);
    if (row !== this.currentRow) {
      this.currentRow = row;
      this.currentFrame = 0;
      this.elapsed = 0;
      this.frameRate = state === AgentState.ERROR ? 10 : 6;
      this.applyUV();
    }
  }

  /** Set horizontal flip for directional facing. */
  setFacing(facingLeft: boolean): void {
    if (this.flippedX !== facingLeft) {
      this.flippedX = facingLeft;
      this.applyUV();
    }
  }

  update(delta: number): void {
    this.elapsed += delta;
    const frameDuration = 1 / this.frameRate;

    if (this.elapsed >= frameDuration) {
      this.elapsed -= frameDuration;
      this.currentFrame = (this.currentFrame + 1) % this.frameCount;
      this.applyUV();
    }
  }

  private applyUV(): void {
    const map = this.material.map;
    if (!map) return;

    // In the texture, row 0 is at the TOP of the image = UV v=0.75
    // UV v goes bottom->top, but canvas y goes top->bottom
    const u = this.currentFrame * 0.25;
    const v = 1 - (this.currentRow + 1) * 0.25;

    if (this.flippedX) {
      map.repeat.set(-0.25, 0.25);
      map.offset.set(u + 0.25, v);
    } else {
      map.repeat.set(0.25, 0.25);
      map.offset.set(u, v);
    }
  }

  private stateToRow(state: AgentState): number {
    switch (state) {
      case AgentState.IDLE: return 0;
      case AgentState.MOVING: return 1;
      case AgentState.WORKING: return 2;
      case AgentState.ERROR: return 3;
      default: return 0;
    }
  }
}
