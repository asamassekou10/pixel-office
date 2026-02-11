import type { IAgent } from '@pixel-office/shared';

/**
 * Central in-memory store for all active agents.
 * Single source of truth — every mutation goes through here.
 */
export class AgentManager {
  private agents: Map<string, IAgent> = new Map();

  /** Marks whether state has changed since last broadcast. */
  private dirty = false;

  // ── Queries ────────────────────────────────────────────

  getAll(): IAgent[] {
    return Array.from(this.agents.values());
  }

  get(id: string): IAgent | undefined {
    return this.agents.get(id);
  }

  get count(): number {
    return this.agents.size;
  }

  get isDirty(): boolean {
    return this.dirty;
  }

  clearDirty(): void {
    this.dirty = false;
  }

  // ── Mutations ──────────────────────────────────────────

  upsert(agent: IAgent): void {
    this.agents.set(agent.id, agent);
    this.dirty = true;
  }

  remove(id: string): boolean {
    const deleted = this.agents.delete(id);
    if (deleted) this.dirty = true;
    return deleted;
  }

  clear(): void {
    this.agents.clear();
    this.dirty = true;
  }
}
