import * as THREE from 'three';
import { AgentState, type IAgent } from '@pixel-office/shared';
import { CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { serverToWorld } from '../world/CoordinateMapper.js';
import { MovementController } from './MovementController.js';
import { SpriteAnimationController } from './SpriteAnimationController.js';
import { getAgentHairColor, getAgentOutfitColor } from './AgentCustomizer.js';
import { createNameplate, updateNameplate } from './NameplateSystem.js';
import { createAgentSpriteSheet } from '../world/SpriteSheetGenerator.js';
import { Colors } from '../design/tokens.js';

const STATE_RING_COLORS: Record<AgentState, number> = {
  [AgentState.IDLE]: Colors.States.Idle,
  [AgentState.WORKING]: Colors.States.Working,
  [AgentState.MOVING]: Colors.States.Moving,
  [AgentState.ERROR]: Colors.States.Error,
};

/**
 * Top-down chibi pixel-art sprite for a single agent.
 * Uses animated sprite sheet with UV-offset animation.
 * Includes a colored status ring on the ground.
 */
export class Agent3D {
  public readonly group: THREE.Group;
  public readonly id: string;

  private movement: MovementController;
  private animController: SpriteAnimationController;
  private currentState: AgentState;
  private agentData: IAgent;

  private sprite: THREE.Sprite;
  private nameplate: CSS2DObject;
  private statusRing: THREE.Mesh;
  private ringPulsePhase = Math.random() * Math.PI * 2;

  constructor(agent: IAgent) {
    this.id = agent.id;
    this.agentData = agent;
    this.currentState = agent.state;

    this.group = new THREE.Group();
    this.group.name = `Agent_${agent.id}`;
    this.group.userData.agentId = agent.id;

    this.movement = new MovementController();

    const worldPos = serverToWorld(agent.x, agent.y);
    this.movement.setPosition(worldPos);
    this.group.position.copy(worldPos);

    // ── Status ring (flat circle on ground) ─────────────
    const ringGeo = new THREE.RingGeometry(0.45, 0.55, 24);
    const ringMat = new THREE.MeshBasicMaterial({
      color: STATE_RING_COLORS[agent.state],
      transparent: true,
      opacity: 0.6,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    this.statusRing = new THREE.Mesh(ringGeo, ringMat);
    this.statusRing.rotation.x = -Math.PI / 2;
    this.statusRing.position.y = 0.02;
    this.group.add(this.statusRing);

    // ── Animated chibi sprite ─────────────────────────────
    const hairColor = getAgentHairColor(agent.id);
    const outfitColor = getAgentOutfitColor(agent.id);
    const tex = createAgentSpriteSheet(hairColor, outfitColor);

    const mat = new THREE.SpriteMaterial({ map: tex, transparent: true });
    this.sprite = new THREE.Sprite(mat);
    this.sprite.scale.set(1.4, 1.4, 1);
    this.sprite.position.y = 0.7;
    this.sprite.userData.agentId = agent.id;
    this.group.add(this.sprite);

    this.animController = new SpriteAnimationController(mat);

    // ── Nameplate ───────────────────────────────────────
    this.nameplate = createNameplate(agent);
    this.nameplate.position.y = 1.8;
    this.group.add(this.nameplate);

    this.setState(agent.state);
  }

  // ── Public API ──────────────────────────────────────────

  syncWithServer(agent: IAgent): void {
    this.agentData = agent;

    const worldPos = serverToWorld(agent.x, agent.y);
    this.movement.setTarget(worldPos);

    if (agent.state !== this.currentState) {
      this.setState(agent.state);
    }

    updateNameplate(this.nameplate, agent);
  }

  setState(state: AgentState): void {
    this.currentState = state;
    this.animController.setState(state);

    // Update status ring color
    const ringMat = this.statusRing.material as THREE.MeshBasicMaterial;
    ringMat.color.setHex(STATE_RING_COLORS[state]);

    if (state === AgentState.ERROR) {
      this.sprite.material.color.setHex(0xff6666);
    } else {
      this.sprite.material.color.setHex(0xffffff);
    }
  }

  getAgentData(): IAgent {
    return this.agentData;
  }

  update(delta: number): void {
    this.movement.update(delta, this.group);

    // Update sprite animation
    this.animController.update(delta);

    // Directional facing based on movement
    const dir = this.movement.lastDirection;
    if (dir.x !== 0) {
      this.animController.setFacing(dir.x < 0);
    }

    // Pulse status ring
    this.ringPulsePhase += delta * 3;
    const pulse = 0.5 + Math.sin(this.ringPulsePhase) * 0.15;
    const scale = 0.95 + Math.sin(this.ringPulsePhase) * 0.05;
    (this.statusRing.material as THREE.MeshBasicMaterial).opacity = pulse;
    this.statusRing.scale.set(scale, scale, 1);
  }

  /** Toggle nameplate visibility (used for zoom-based culling). */
  setNameplateVisible(visible: boolean): void {
    this.nameplate.visible = visible;
  }

  /** Meshes for raycasting. */
  getRaycastTargets(): THREE.Object3D[] {
    return [this.sprite];
  }

  dispose(): void {
    const mat = this.sprite.material as THREE.SpriteMaterial;
    mat.map?.dispose();
    mat.dispose();

    const ringMat = this.statusRing.material as THREE.MeshBasicMaterial;
    this.statusRing.geometry.dispose();
    ringMat.dispose();

    if (this.nameplate.element.parentNode) {
      this.nameplate.element.parentNode.removeChild(this.nameplate.element);
    }
  }
}
