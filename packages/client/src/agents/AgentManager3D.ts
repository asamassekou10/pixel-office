import * as THREE from 'three';
import { AgentState, type IAgent, type IWorldState } from '@pixel-office/shared';
import { NetworkManager, NetEvents } from '../network/NetworkManager.js';
import { Agent3D } from './Agent3D.js';
import type { ParticleSystem } from '../effects/ParticleSystem.js';

/**
 * Manages the lifecycle of 3D agent representations.
 * Subscribes to network events and creates/updates/removes Agent3D instances.
 */
export class AgentManager3D {
  private agents: Map<string, Agent3D> = new Map();
  public readonly group: THREE.Group;
  private network: NetworkManager;
  private particles: ParticleSystem | null;

  /** All raycast-targetable meshes (for InputManager). */
  private raycastTargets: THREE.Object3D[] = [];

  /** Track previous states for particle emission on transitions. */
  private prevStates: Map<string, AgentState> = new Map();

  private sparkleTimer = 0;

  constructor(scene: THREE.Scene, particles?: ParticleSystem) {
    this.group = new THREE.Group();
    this.group.name = 'Agents';
    scene.add(this.group);

    this.particles = particles ?? null;

    this.network = NetworkManager.getInstance();
    this.network.on(NetEvents.WORLD_STATE, this.onWorldState, this);
    this.network.on(NetEvents.AGENT_UPDATE, this.onAgentUpdate, this);
    this.network.on(NetEvents.AGENT_REMOVE, this.onAgentRemove, this);
  }

  // ── Network handlers ──────────────────────────────────

  private onWorldState(data: IWorldState): void {
    for (const [, agent] of this.agents) {
      agent.dispose();
      this.group.remove(agent.group);
    }
    this.agents.clear();
    this.raycastTargets.length = 0;
    this.prevStates.clear();

    for (const agentData of data.agents) {
      this.upsertAgent(agentData);
    }
  }

  private onAgentUpdate(agents: IAgent[]): void {
    for (const agentData of agents) {
      this.upsertAgent(agentData);
    }
  }

  private onAgentRemove(id: string): void {
    const agent = this.agents.get(id);
    if (agent) {
      for (const target of agent.getRaycastTargets()) {
        const idx = this.raycastTargets.indexOf(target);
        if (idx >= 0) this.raycastTargets.splice(idx, 1);
      }

      agent.dispose();
      this.group.remove(agent.group);
      this.agents.delete(id);
      this.prevStates.delete(id);
    }
  }

  // ── Helpers ───────────────────────────────────────────

  private upsertAgent(agentData: IAgent): void {
    let agent = this.agents.get(agentData.id);
    if (agent) {
      // Check for state transitions -> emit particles
      const prevState = this.prevStates.get(agentData.id);
      if (prevState && prevState !== agentData.state && this.particles) {
        const pos = agent.group.position;
        if (agentData.state === AgentState.ERROR) {
          this.particles.emitErrorBurst(pos.x, pos.z);
        }
      }
      this.prevStates.set(agentData.id, agentData.state);
      agent.syncWithServer(agentData);
    } else {
      try {
        agent = new Agent3D(agentData);
        this.agents.set(agentData.id, agent);
        this.group.add(agent.group);
        this.raycastTargets.push(...agent.getRaycastTargets());
        this.prevStates.set(agentData.id, agentData.state);
      } catch (err) {
        console.error('[AgentManager3D] Failed to create Agent3D:', err);
      }
    }
  }

  // ── Public API ────────────────────────────────────────

  update(delta: number): void {
    for (const agent of this.agents.values()) {
      agent.update(delta);
    }

    // Emit work sparkles for WORKING agents periodically
    if (this.particles) {
      this.sparkleTimer += delta;
      if (this.sparkleTimer > 0.3) {
        this.sparkleTimer = 0;
        for (const agent of this.agents.values()) {
          const data = agent.getAgentData();
          if (data.state === AgentState.WORKING) {
            const pos = agent.group.position;
            this.particles.emitWorkSparkle(pos.x, pos.z);
          }
        }
      }
    }
  }

  get count(): number {
    return this.agents.size;
  }

  getAgent(id: string): Agent3D | undefined {
    return this.agents.get(id);
  }

  getAllAgents(): Agent3D[] {
    return Array.from(this.agents.values());
  }

  getRaycastTargets(): THREE.Object3D[] {
    return this.raycastTargets;
  }

  dispose(): void {
    this.network.off(NetEvents.WORLD_STATE, this.onWorldState, this);
    this.network.off(NetEvents.AGENT_UPDATE, this.onAgentUpdate, this);
    this.network.off(NetEvents.AGENT_REMOVE, this.onAgentRemove, this);

    for (const [, agent] of this.agents) {
      agent.dispose();
    }
    this.agents.clear();
  }
}
