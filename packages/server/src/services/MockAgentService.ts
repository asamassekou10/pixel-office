import { AgentState, type IAgent, type IAgentTask } from '@pixel-office/shared';
import { AgentManager } from './AgentManager.js';
import { MAX_MOCK_AGENTS, WORLD_WIDTH, WORLD_HEIGHT } from '../config.js';

const JOB_TYPES = ['code-review', 'deploy', 'debug', 'test', 'refactor', 'docs', 'meeting'];
const TASK_NAMES = [
  'Reviewing PR #',
  'Deploying to ',
  'Debugging issue ',
  'Running tests for ',
  'Refactoring ',
  'Writing docs for ',
  'Meeting about ',
];
const SKILLS = [
  'typescript', 'javascript', 'react', 'node', 'python', 'go', 'rust',
  'testing', 'deployment', 'debugging', 'code-review', 'documentation',
  'api-design', 'database', 'security', 'performance',
];

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickRandom<T>(arr: readonly T[]): T {
  return arr[randomBetween(0, arr.length - 1)];
}

function pickRandomSkills(count: number = 3): string[] {
  const shuffled = [...SKILLS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

let agentCounter = 0;
let taskCounter = 0;

/**
 * Simulates agent traffic so the client has something to render
 * before the real OpenClaw backend is connected.
 */
export class MockAgentService {
  private intervalId: ReturnType<typeof setInterval> | null = null;

  constructor(private manager: AgentManager) {}

  start(intervalMs = 500): void {
    if (this.intervalId) return;

    this.intervalId = setInterval(() => this.tick(), intervalMs);
    console.log('[MockAgentService] simulation started');
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  // ── Internal ───────────────────────────────────────────

  private tick(): void {
    // Chance to spawn a new agent
    if (this.manager.count < MAX_MOCK_AGENTS && Math.random() < 0.3) {
      this.spawnAgent();
    }

    // Iterate existing agents and simulate behaviour
    for (const agent of this.manager.getAll()) {
      this.simulateAgent(agent);
    }

    // Chance to remove a random agent (simulates task completion)
    if (this.manager.count > 3 && Math.random() < 0.1) {
      const agents = this.manager.getAll();
      const victim = pickRandom(agents);
      this.manager.remove(victim.id);
    }
  }

  private spawnAgent(): void {
    agentCounter++;
    taskCounter++;

    const jobType = pickRandom(JOB_TYPES);
    const taskNamePrefix = TASK_NAMES[JOB_TYPES.indexOf(jobType)];
    const taskId = randomBetween(100, 999);

    const agent: IAgent = {
      id: `agent-${agentCounter}`,
      x: randomBetween(50, WORLD_WIDTH - 50),
      y: randomBetween(50, WORLD_HEIGHT - 50),
      state: AgentState.IDLE,
      jobType,
      currentTask: {
        id: `task-${taskCounter}`,
        name: `${taskNamePrefix}${taskId}`,
        type: jobType,
        progress: 0,
        startedAt: Date.now(),
        estimatedDuration: randomBetween(30000, 120000), // 30s-2min
      },
      skills: pickRandomSkills(randomBetween(2, 5)),
      metrics: {
        tasksCompleted: randomBetween(0, 50),
        tasksInProgress: 1,
        successRate: randomBetween(75, 100),
        averageTime: randomBetween(30000, 90000),
        activeTime: randomBetween(60000, 3600000),
      },
      connections: [], // Will be populated in simulateAgent
    };
    this.manager.upsert(agent);
  }

  private simulateAgent(agent: IAgent): void {
    const roll = Math.random();

    // Update task progress if working
    if (agent.currentTask && agent.state === AgentState.WORKING) {
      agent.currentTask.progress = Math.min(100, agent.currentTask.progress + randomBetween(1, 5));

      // Complete task if at 100%
      if (agent.currentTask.progress >= 100) {
        if (agent.metrics) {
          agent.metrics.tasksCompleted++;
        }
        // Start new task
        taskCounter++;
        const jobType = agent.jobType || pickRandom(JOB_TYPES);
        const taskNamePrefix = TASK_NAMES[JOB_TYPES.indexOf(jobType)];
        const taskId = randomBetween(100, 999);

        agent.currentTask = {
          id: `task-${taskCounter}`,
          name: `${taskNamePrefix}${taskId}`,
          type: jobType,
          progress: 0,
          startedAt: Date.now(),
          estimatedDuration: randomBetween(30000, 120000),
        };
      }
    }

    // Update state
    if (roll < 0.4) {
      // Move towards a random nearby position
      agent.state = AgentState.MOVING;
      agent.x = clamp(agent.x + randomBetween(-20, 20), 0, WORLD_WIDTH);
      agent.y = clamp(agent.y + randomBetween(-20, 20), 0, WORLD_HEIGHT);
    } else if (roll < 0.7) {
      agent.state = AgentState.WORKING;
    } else if (roll < 0.9) {
      agent.state = AgentState.IDLE;
    } else {
      agent.state = AgentState.ERROR;
    }

    // Simulate connections with nearby agents (within 150px)
    const allAgents = this.manager.getAll();
    const nearbyAgents = allAgents.filter((other) => {
      if (other.id === agent.id) return false;
      const dx = other.x - agent.x;
      const dy = other.y - agent.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      return dist < 150;
    });

    // Connect to 1-2 nearby agents randomly
    if (nearbyAgents.length > 0 && Math.random() < 0.3) {
      const count = Math.min(randomBetween(1, 2), nearbyAgents.length);
      agent.connections = nearbyAgents
        .sort(() => Math.random() - 0.5)
        .slice(0, count)
        .map((a) => a.id);
    } else {
      agent.connections = [];
    }

    this.manager.upsert(agent);
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
