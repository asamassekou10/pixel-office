import * as THREE from 'three';
import type { Agent3D } from '../agents/Agent3D.js';

/**
 * Renders glowing connection lines between collaborating agents.
 * Lines are drawn between agents that share connections[] IDs.
 */
export class ConnectionRenderer {
  public readonly group: THREE.Group;
  private lines: THREE.Line[] = [];
  private material: THREE.LineBasicMaterial;
  private elapsed = 0;

  constructor(scene: THREE.Scene) {
    this.group = new THREE.Group();
    this.group.name = 'ConnectionLines';
    scene.add(this.group);

    this.material = new THREE.LineBasicMaterial({
      color: 0x00d9ff,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
  }

  /**
   * Rebuild connection lines from current agent data.
   * Call this every few frames (not every frame) for performance.
   */
  updateConnections(agents: Agent3D[]): void {
    // Clear old lines
    for (const line of this.lines) {
      this.group.remove(line);
      line.geometry.dispose();
    }
    this.lines.length = 0;

    // Build map of agent positions by ID
    const posMap = new Map<string, THREE.Vector3>();
    const connMap = new Map<string, string[]>();

    for (const agent of agents) {
      const data = agent.getAgentData();
      posMap.set(data.id, agent.group.position.clone());
      if (data.connections && data.connections.length > 0) {
        connMap.set(data.id, data.connections);
      }
    }

    // Draw lines between connected agents (avoid duplicates)
    const drawn = new Set<string>();

    for (const [agentId, connections] of connMap) {
      const fromPos = posMap.get(agentId);
      if (!fromPos) continue;

      for (const targetId of connections) {
        const key = [agentId, targetId].sort().join('-');
        if (drawn.has(key)) continue;
        drawn.add(key);

        const toPos = posMap.get(targetId);
        if (!toPos) continue;

        // Fade by distance
        const dist = fromPos.distanceTo(toPos);
        if (dist > 15) continue;

        const points = [
          new THREE.Vector3(fromPos.x, 0.15, fromPos.z),
          new THREE.Vector3(toPos.x, 0.15, toPos.z),
        ];

        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(geometry, this.material);
        this.group.add(line);
        this.lines.push(line);
      }
    }
  }

  update(delta: number): void {
    // Pulse opacity for flowing effect
    this.elapsed += delta;
    const pulse = 0.25 + Math.sin(this.elapsed * 3) * 0.1;
    this.material.opacity = pulse;
  }

  dispose(): void {
    for (const line of this.lines) {
      line.geometry.dispose();
    }
    this.material.dispose();
  }
}
