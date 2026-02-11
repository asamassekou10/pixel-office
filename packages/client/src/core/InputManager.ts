import * as THREE from 'three';
import EventEmitter from 'eventemitter3';

/**
 * Raycaster-based input manager for clicking/hovering agents.
 * Emits 'agent-clicked', 'agent-hovered', and 'background-clicked' events.
 */
export class InputManager extends EventEmitter {
  private raycaster = new THREE.Raycaster();
  private pointer = new THREE.Vector2();
  private camera: THREE.Camera;
  private targets: THREE.Object3D[] = [];
  private canvas: HTMLCanvasElement;

  private hoveredId: string | null = null;

  constructor(canvas: HTMLCanvasElement, camera: THREE.Camera) {
    super();
    this.canvas = canvas;
    this.camera = camera;

    canvas.addEventListener('pointerdown', this.onPointerDown);
    canvas.addEventListener('pointermove', this.onPointerMove);
  }

  setTargets(targets: THREE.Object3D[]): void {
    this.targets = targets;
  }

  private updatePointer(e: PointerEvent): void {
    const rect = this.canvas.getBoundingClientRect();
    this.pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  }

  private raycast(): string | null {
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const hits = this.raycaster.intersectObjects(this.targets, false);
    if (hits.length > 0) {
      return hits[0].object.userData.agentId ?? null;
    }
    return null;
  }

  private onPointerDown = (e: PointerEvent): void => {
    if (e.button !== 0) return; // left click only
    this.updatePointer(e);
    const agentId = this.raycast();
    if (agentId) {
      this.emit('agent-clicked', agentId);
    } else {
      this.emit('background-clicked');
    }
  };

  private onPointerMove = (e: PointerEvent): void => {
    this.updatePointer(e);
    const agentId = this.raycast();

    if (agentId !== this.hoveredId) {
      this.hoveredId = agentId;
      this.emit('agent-hovered', agentId);
      this.canvas.style.cursor = agentId ? 'pointer' : 'default';
    }
  };

  dispose(): void {
    this.canvas.removeEventListener('pointerdown', this.onPointerDown);
    this.canvas.removeEventListener('pointermove', this.onPointerMove);
    this.removeAllListeners();
  }
}
