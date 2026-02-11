import * as THREE from 'three';
import { GRID_COLS, GRID_ROWS, DESK_SPOTS } from './OfficeLayout.js';
import * as Tex from './PixelTextures.js';
import { AnimatedTexture, createAnimatedMonitor, createAnimatedSign } from '../effects/AnimatedTexture.js';

interface TileInstance {
  cx: number;
  cz: number;
  w: number;
  h: number;
  y: number;
}

/** Quaternion for laying a plane flat on the XZ ground. */
const FLAT_QUAT = new THREE.Quaternion().setFromEuler(
  new THREE.Euler(-Math.PI / 2, 0, 0),
);

/**
 * Detailed 2D pixel-art office environment.
 * Uses InstancedMesh for repeated furniture to minimize draw calls.
 * Monitors and neon sign remain individual meshes (animated textures).
 */
export class OfficeEnvironment {
  public readonly group: THREE.Group;

  /** Animated textures that need per-frame updates. */
  private animatedTextures: AnimatedTexture[] = [];

  /** Plant meshes for sway animation. */
  private plantMeshes: THREE.Mesh[] = [];
  private plantPhases: number[] = [];

  constructor(scene: THREE.Scene) {
    this.group = new THREE.Group();
    this.group.name = 'OfficeEnvironment';

    this.createFloor();
    this.createCarpetZones();
    this.createWalls();
    this.createSign();
    this.createDesks();
    this.createBreakArea();
    this.createLounge();
    this.createPlants();
    this.createOfficeEquipment();
    this.createDecorations();

    scene.add(this.group);
  }

  /** Per-frame update for animated textures and plant sway. */
  update(delta: number): void {
    // Animated textures (monitors, sign)
    for (const anim of this.animatedTextures) {
      anim.update(delta);
    }

    // Plant sway
    for (let i = 0; i < this.plantMeshes.length; i++) {
      this.plantPhases[i] += delta * (1.5 + (i % 3) * 0.3);
      const sway = Math.sin(this.plantPhases[i]) * 0.015;
      this.plantMeshes[i].position.x += sway;
    }
  }

  // ── Instancing helper ──────────────────────────────────────

  /**
   * Create an InstancedMesh of textured planes flat on the XZ ground.
   * Each instance can have its own position and size via the matrix.
   */
  private createInstanced(
    texture: THREE.CanvasTexture,
    instances: TileInstance[],
  ): THREE.InstancedMesh {
    const geo = new THREE.PlaneGeometry(1, 1);
    const mat = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
    const mesh = new THREE.InstancedMesh(geo, mat, instances.length);

    const m = new THREE.Matrix4();
    const p = new THREE.Vector3();
    const s = new THREE.Vector3();

    for (let i = 0; i < instances.length; i++) {
      const inst = instances[i];
      p.set(inst.cx, inst.y, inst.cz);
      s.set(inst.w, inst.h, 1);
      m.compose(p, FLAT_QUAT, s);
      mesh.setMatrixAt(i, m);
    }

    mesh.instanceMatrix.needsUpdate = true;
    return mesh;
  }

  /** Place a single textured plane flat on the ground (for non-instanced items). */
  private tile(
    texture: THREE.CanvasTexture,
    cx: number, cz: number,
    w = 1, h = 1,
    y = 0.01,
  ): THREE.Mesh {
    const geo = new THREE.PlaneGeometry(w, h);
    const mat = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(cx, y, cz);
    return mesh;
  }

  // ── Floor ────────────────────────────────────────────────

  private createFloor(): void {
    const floorTex = Tex.createFloorTexture();
    floorTex.wrapS = THREE.RepeatWrapping;
    floorTex.wrapT = THREE.RepeatWrapping;
    floorTex.repeat.set(GRID_COLS, GRID_ROWS);

    const geo = new THREE.PlaneGeometry(GRID_COLS, GRID_ROWS);
    const mat = new THREE.MeshBasicMaterial({ map: floorTex });
    const floor = new THREE.Mesh(geo, mat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(GRID_COLS / 2, 0, GRID_ROWS / 2);
    this.group.add(floor);
  }

  // ── Carpet zones under work areas ────────────────────────

  private createCarpetZones(): void {
    const carpetTex = Tex.createCarpetTexture();
    carpetTex.wrapS = THREE.RepeatWrapping;
    carpetTex.wrapT = THREE.RepeatWrapping;

    // Left desk cluster area
    const leftCarpet = carpetTex.clone();
    leftCarpet.wrapS = THREE.RepeatWrapping;
    leftCarpet.wrapT = THREE.RepeatWrapping;
    leftCarpet.repeat.set(6, 12);
    const leftGeo = new THREE.PlaneGeometry(6, 12);
    const leftMat = new THREE.MeshBasicMaterial({ map: leftCarpet });
    const leftMesh = new THREE.Mesh(leftGeo, leftMat);
    leftMesh.rotation.x = -Math.PI / 2;
    leftMesh.position.set(8, 0.005, 9.5);
    this.group.add(leftMesh);

    // Right desk cluster area
    const rightCarpet = carpetTex.clone();
    rightCarpet.wrapS = THREE.RepeatWrapping;
    rightCarpet.wrapT = THREE.RepeatWrapping;
    rightCarpet.repeat.set(6, 12);
    const rightGeo = new THREE.PlaneGeometry(6, 12);
    const rightMat = new THREE.MeshBasicMaterial({ map: rightCarpet });
    const rightMesh = new THREE.Mesh(rightGeo, rightMat);
    rightMesh.rotation.x = -Math.PI / 2;
    rightMesh.position.set(17, 0.005, 9.5);
    this.group.add(rightMesh);
  }

  // ── Walls (InstancedMesh: ~80 tiles → 1 draw call) ──────

  private createWalls(): void {
    const wallTex = Tex.createWallTexture();
    const instances: TileInstance[] = [];

    // Top and bottom rows
    for (let x = 0; x < GRID_COLS; x++) {
      instances.push({ cx: x + 0.5, cz: 0.5, w: 1, h: 1, y: 0.01 });
      instances.push({ cx: x + 0.5, cz: GRID_ROWS - 0.5, w: 1, h: 1, y: 0.01 });
    }
    // Left and right columns
    for (let z = 1; z < GRID_ROWS - 1; z++) {
      instances.push({ cx: 0.5, cz: z + 0.5, w: 1, h: 1, y: 0.01 });
      instances.push({ cx: GRID_COLS - 0.5, cz: z + 0.5, w: 1, h: 1, y: 0.01 });
    }

    this.group.add(this.createInstanced(wallTex, instances));
  }

  // ── Sign (animated neon) ────────────────────────────────

  private createSign(): void {
    const animSign = createAnimatedSign();
    this.animatedTextures.push(animSign);
    this.group.add(this.tile(animSign.texture, GRID_COLS / 2, 0.5, 6, 1, 0.02));
  }

  // ── Desks with animated monitors (InstancedMesh for desks + chairs) ──

  private createDesks(): void {
    const deskTex = Tex.createDeskTexture();
    const chairTex = Tex.createChairTexture();

    const deskInstances: TileInstance[] = [];
    const chairInstances: TileInstance[] = [];

    for (const spot of DESK_SPOTS) {
      const sx = spot.position.x;
      const sz = spot.position.z;

      // Desk surface one tile in the monitor direction
      let deskZ = sz;
      if (spot.monitorDir === 'up') deskZ = sz - 1;
      else if (spot.monitorDir === 'down') deskZ = sz + 1;

      // Desk surface (instanced)
      deskInstances.push({ cx: sx, cz: deskZ, w: 1, h: 1, y: 0.02 });

      // Animated monitor (individual mesh - each has unique animation)
      const animMon = createAnimatedMonitor();
      this.animatedTextures.push(animMon);
      const monOffset = spot.monitorDir === 'up' ? -0.15 : 0.15;
      this.group.add(this.tile(animMon.texture, sx, deskZ + monOffset, 0.6, 0.6, 0.03));

      // Chair (instanced)
      chairInstances.push({ cx: sx, cz: sz, w: 0.8, h: 0.8, y: 0.015 });
    }

    this.group.add(this.createInstanced(deskTex, deskInstances));
    this.group.add(this.createInstanced(chairTex, chairInstances));
  }

  // ── Break Area ───────────────────────────────────────────

  private createBreakArea(): void {
    const coffeeTex = Tex.createCoffeeMachineTexture();
    const tableTex = Tex.createTableTexture();
    const waterTex = Tex.createWaterCoolerTexture();
    const trashTex = Tex.createTrashCanTexture();

    this.group.add(this.tile(coffeeTex, 21, 2.5, 1, 1, 0.02));
    this.group.add(this.tile(tableTex, 20, 4, 1, 1, 0.02));
    this.group.add(this.tile(waterTex, 22, 4, 0.8, 0.8, 0.02));
    this.group.add(this.tile(trashTex, 19, 2.5, 0.5, 0.5, 0.02));
  }

  // ── Lounge ───────────────────────────────────────────────

  private createLounge(): void {
    const sofaTex = Tex.createSofaTexture();
    const tableTex = Tex.createTableTexture();
    const rugTex = Tex.createRugTexture();

    const rugGeo = new THREE.PlaneGeometry(4, 2);
    const rugMat = new THREE.MeshBasicMaterial({ map: rugTex, transparent: true });
    const rug = new THREE.Mesh(rugGeo, rugMat);
    rug.rotation.x = -Math.PI / 2;
    rug.position.set(21, 0.008, 8.5);
    this.group.add(rug);

    const sofaGeo = new THREE.PlaneGeometry(2, 1);
    const sofaMat = new THREE.MeshBasicMaterial({ map: sofaTex, transparent: true });
    const sofa = new THREE.Mesh(sofaGeo, sofaMat);
    sofa.rotation.x = -Math.PI / 2;
    sofa.position.set(21, 0.02, 7.8);
    this.group.add(sofa);

    this.group.add(this.tile(tableTex, 21, 9.2, 1, 1, 0.02));
  }

  // ── Plants (individual meshes for sway animation) ──────

  private createPlants(): void {
    const plantTex = Tex.createPlantTexture();

    const positions = [
      [2, 2.5],
      [2, 9],
      [2, 15],
      [4.5, 6.5],
      [4.5, 9.5],
      [13, 2.5],
      [13, 9],
      [13, 15],
      [22, 6],
      [22, 15],
    ];

    for (const [px, pz] of positions) {
      const mesh = this.tile(plantTex, px, pz, 0.9, 0.9, 0.02);
      this.group.add(mesh);
      this.plantMeshes.push(mesh);
      this.plantPhases.push(Math.random() * Math.PI * 2);
    }
  }

  // ── Office Equipment (InstancedMesh for file cabinets) ──

  private createOfficeEquipment(): void {
    const printerTex = Tex.createPrinterTexture();
    const fileCabinetTex = Tex.createFileCabinetTexture();
    const trashTex = Tex.createTrashCanTexture();

    // Printer (single)
    this.group.add(this.tile(printerTex, 4, 6.5, 0.9, 0.9, 0.02));

    // File cabinets (instanced: 4 → 1 draw call)
    this.group.add(this.createInstanced(fileCabinetTex, [
      { cx: 1.5, cz: 5, w: 0.8, h: 0.8, y: 0.02 },
      { cx: 1.5, cz: 6, w: 0.8, h: 0.8, y: 0.02 },
      { cx: 1.5, cz: 12, w: 0.8, h: 0.8, y: 0.02 },
      { cx: 1.5, cz: 13, w: 0.8, h: 0.8, y: 0.02 },
    ]));

    // Trash cans (instanced: 3 → 1 draw call)
    this.group.add(this.createInstanced(trashTex, [
      { cx: 11.5, cz: 6, w: 0.45, h: 0.45, y: 0.02 },
      { cx: 11.5, cz: 10, w: 0.45, h: 0.45, y: 0.02 },
      { cx: 11.5, cz: 14, w: 0.45, h: 0.45, y: 0.02 },
    ]));
  }

  // ── Decorations (InstancedMesh for bookshelves) ─────────

  private createDecorations(): void {
    const whiteboardTex = Tex.createWhiteboardTexture();
    const bookshelfTex = Tex.createBookshelfTexture();

    // Whiteboards (only 2, individual meshes)
    this.group.add(this.tile(whiteboardTex, 5, 1.2, 1.2, 1.2, 0.02));
    this.group.add(this.tile(whiteboardTex, 19, 1.2, 1.2, 1.2, 0.02));

    // Bookshelves (instanced: 6 → 1 draw call)
    this.group.add(this.createInstanced(bookshelfTex, [
      { cx: 4, cz: GRID_ROWS - 1.5, w: 1, h: 1, y: 0.02 },
      { cx: 5, cz: GRID_ROWS - 1.5, w: 1, h: 1, y: 0.02 },
      { cx: 10, cz: GRID_ROWS - 1.5, w: 1, h: 1, y: 0.02 },
      { cx: 11, cz: GRID_ROWS - 1.5, w: 1, h: 1, y: 0.02 },
      { cx: GRID_COLS - 1.5, cz: 11, w: 1, h: 1, y: 0.02 },
      { cx: GRID_COLS - 1.5, cz: 12, w: 1, h: 1, y: 0.02 },
    ]));
  }
}
