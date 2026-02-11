import * as THREE from 'three';

/**
 * Orthographic top-down camera for the 2D pixel-art office view.
 * Fixed angle looking straight down with zoom via scroll wheel.
 */
export class CameraController {
  public readonly camera: THREE.OrthographicCamera;

  private zoom = 22; // How many world units visible vertically
  private readonly minZoom = 10;
  private readonly maxZoom = 40;

  // Pan with middle-mouse or right-click drag
  private isPanning = false;
  private panStart = new THREE.Vector2();
  private targetX = 12;
  private targetZ = 9;

  constructor(canvas: HTMLCanvasElement) {
    const aspect = window.innerWidth / window.innerHeight;
    const halfH = this.zoom / 2;
    const halfW = halfH * aspect;

    this.camera = new THREE.OrthographicCamera(
      -halfW, halfW, halfH, -halfH, 0.1, 100,
    );
    // Slightly angled top-down for that pixel-RPG depth feel
    this.camera.position.set(this.targetX, 30, this.targetZ + 12);
    this.camera.lookAt(this.targetX, 0, this.targetZ);

    canvas.addEventListener('wheel', this.onWheel, { passive: false });
    canvas.addEventListener('pointerdown', this.onPointerDown);
    canvas.addEventListener('pointermove', this.onPointerMove);
    canvas.addEventListener('pointerup', this.onPointerUp);
    window.addEventListener('resize', this.onResize);
  }

  private updateProjection(): void {
    const aspect = window.innerWidth / window.innerHeight;
    const halfH = this.zoom / 2;
    const halfW = halfH * aspect;
    this.camera.left = -halfW;
    this.camera.right = halfW;
    this.camera.top = halfH;
    this.camera.bottom = -halfH;
    this.camera.updateProjectionMatrix();
  }

  private onResize = (): void => {
    this.updateProjection();
  };

  private onWheel = (e: WheelEvent): void => {
    e.preventDefault();
    this.zoom += e.deltaY * 0.02;
    this.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.zoom));
    this.updateProjection();
  };

  private onPointerDown = (e: PointerEvent): void => {
    if (e.button === 1 || e.button === 2) {
      this.isPanning = true;
      this.panStart.set(e.clientX, e.clientY);
    }
  };

  private onPointerMove = (e: PointerEvent): void => {
    if (!this.isPanning) return;
    const dx = (e.clientX - this.panStart.x) * this.zoom / window.innerHeight;
    const dy = (e.clientY - this.panStart.y) * this.zoom / window.innerHeight;
    this.targetX -= dx;
    this.targetZ -= dy;
    this.panStart.set(e.clientX, e.clientY);
  };

  private onPointerUp = (): void => {
    this.isPanning = false;
  };

  /** Smoothly pan the camera to center on a world position. */
  focusOnAgent(worldPos: THREE.Vector3): void {
    this.targetX = worldPos.x;
    this.targetZ = worldPos.z;
  }

  /** Return camera to the default overview position (center of office). */
  resetToOverview(): void {
    this.targetX = 12;
    this.targetZ = 9;
  }

  update(_delta: number): void {
    // Smooth camera follow
    this.camera.position.x += (this.targetX - this.camera.position.x) * 0.1;
    this.camera.position.z += (this.targetZ + 12 - this.camera.position.z) * 0.1;
    this.camera.lookAt(
      this.camera.position.x,
      0,
      this.camera.position.z - 12,
    );
  }

  dispose(): void {
    window.removeEventListener('resize', this.onResize);
  }
}
