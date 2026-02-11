import { AgentState, type IAgent, type IWorldState } from '@pixel-office/shared';
import { NetworkManager } from './NetworkManager.js';
import { NetEvents } from './NetEvents.js';
import { DESK_SPOTS } from '../world/OfficeLayout.js';
import { WORLD_3D_WIDTH, WORLD_3D_DEPTH, SERVER_WIDTH, SERVER_HEIGHT } from '../config.js';

/** Grid position → server coordinate conversion. */
function gridToServer(gridX: number, gridZ: number): { x: number; y: number } {
  return {
    x: (gridX / WORLD_3D_WIDTH) * SERVER_WIDTH,
    y: (gridZ / WORLD_3D_DEPTH) * SERVER_HEIGHT,
  };
}

const NAMES = [
  'Alice', 'Bob', 'Charlie', 'Diana', 'Eve',
  'Frank', 'Grace', 'Hank', 'Ivy', 'Jack',
];

const JOB_TYPES = ['developer', 'designer', 'analyst', 'manager', 'tester', 'devops'];

const SKILLS: Record<string, string[]> = {
  developer: ['TypeScript', 'React', 'Node.js'],
  designer: ['Figma', 'CSS', 'UI/UX'],
  analyst: ['Python', 'SQL', 'Tableau'],
  manager: ['Agile', 'Jira', 'Roadmap'],
  tester: ['Jest', 'Cypress', 'QA'],
  devops: ['Docker', 'AWS', 'CI/CD'],
};

const TASKS = [
  'Reviewing PR #42', 'Fixing login bug', 'Writing unit tests',
  'Deploying v2.1', 'Code review', 'Architecture doc',
  'Sprint planning', 'CI/CD pipeline', 'Database migration',
  'API refactor', 'Performance audit', 'Design system update',
];

/**
 * Client-side demo agent simulation.
 * Creates realistic agents at desk spots when the server is not available,
 * so the visualization always shows active, interactive agents.
 */
export class DemoService {
  private network: NetworkManager;
  private agents: Map<string, IAgent> = new Map();
  private timer: number | null = null;
  private running = false;
  private tickCount = 0;

  constructor() {
    this.network = NetworkManager.getInstance();
  }

  start(): void {
    if (this.running) return;
    this.running = true;

    this.createAgents();

    // Emit initial world state (same event the server would emit)
    const state: IWorldState = {
      agents: Array.from(this.agents.values()),
      tick: 0,
    };
    this.network.emit(NetEvents.WORLD_STATE, state);

    // Simulate behavior every 500ms
    this.timer = window.setInterval(() => this.simulate(), 500);
  }

  stop(): void {
    if (!this.running) return;
    this.running = false;
    if (this.timer !== null) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.agents.clear();
  }

  get isRunning(): boolean {
    return this.running;
  }

  private createAgents(): void {
    const count = Math.min(NAMES.length, DESK_SPOTS.length);

    for (let i = 0; i < count; i++) {
      const spot = DESK_SPOTS[i];
      const pos = gridToServer(spot.position.x, spot.position.z);
      const jobType = JOB_TYPES[i % JOB_TYPES.length];

      const agent: IAgent = {
        id: NAMES[i],
        x: pos.x,
        y: pos.y,
        state: AgentState.WORKING,
        jobType,
        currentTask: {
          id: `task-${i}`,
          name: TASKS[i % TASKS.length],
          type: jobType,
          progress: Math.floor(Math.random() * 70) + 10,
          startedAt: Date.now() - Math.random() * 300_000,
        },
        skills: SKILLS[jobType] || ['General'],
        metrics: {
          tasksCompleted: Math.floor(Math.random() * 25) + 5,
          tasksInProgress: Math.floor(Math.random() * 3) + 1,
          successRate: Math.floor(Math.random() * 15) + 85,
          averageTime: Math.floor(Math.random() * 15_000) + 5_000,
          activeTime: Math.floor(Math.random() * 3_600_000),
        },
        connections: [],
      };

      this.agents.set(agent.id, agent);
    }

    // Wire up connections between nearby agents (pairs)
    const list = Array.from(this.agents.values());
    for (let i = 0; i < list.length - 1; i += 2) {
      list[i].connections = [list[i + 1].id];
      list[i + 1].connections = [list[i].id];
    }
  }

  private simulate(): void {
    this.tickCount++;

    for (const agent of this.agents.values()) {
      this.simulateAgent(agent);
    }

    // Broadcast update (same event the server would emit)
    this.network.emit(
      NetEvents.AGENT_UPDATE,
      Array.from(this.agents.values()),
    );
  }

  private simulateAgent(agent: IAgent): void {
    // Progress current task
    if (agent.state === AgentState.WORKING && agent.currentTask) {
      agent.currentTask.progress = Math.min(
        100,
        agent.currentTask.progress + 1 + Math.random() * 2,
      );

      if (agent.currentTask.progress >= 100) {
        // Task complete — update metrics, assign new task
        if (agent.metrics) {
          agent.metrics.tasksCompleted++;
        }
        agent.currentTask = {
          id: `task-${Date.now()}-${agent.id}`,
          name: TASKS[Math.floor(Math.random() * TASKS.length)],
          type: agent.jobType || 'developer',
          progress: 0,
          startedAt: Date.now(),
        };
        agent.state = AgentState.IDLE;
        return;
      }
    }

    // State transitions (low probability to keep the scene stable)
    const roll = Math.random();
    if (roll < 0.02) {
      // Briefly move to a nearby desk
      agent.state = AgentState.MOVING;
      const spot = DESK_SPOTS[Math.floor(Math.random() * DESK_SPOTS.length)];
      const pos = gridToServer(spot.position.x, spot.position.z);
      agent.x = pos.x;
      agent.y = pos.y;
    } else if (roll < 0.03) {
      agent.state = AgentState.IDLE;
    } else if (roll < 0.035) {
      agent.state = AgentState.ERROR;
    } else if (agent.state !== AgentState.WORKING) {
      // Return to working after brief idle/moving/error
      if (Math.random() < 0.2) {
        agent.state = AgentState.WORKING;
      }
    }
  }
}
