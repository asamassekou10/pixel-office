export enum AgentState {
  IDLE = 'IDLE',
  WORKING = 'WORKING',
  MOVING = 'MOVING',
  ERROR = 'ERROR',
}

export interface IAgentTask {
  id: string;
  name: string;           // e.g., "Reviewing PR #123"
  type: string;           // e.g., "code-review"
  progress: number;       // 0-100
  startedAt: number;      // timestamp
  estimatedDuration?: number; // milliseconds
}

export interface IAgentMetrics {
  tasksCompleted: number;
  tasksInProgress: number;
  successRate: number;    // 0-100
  averageTime: number;    // milliseconds
  activeTime: number;     // total active milliseconds
}

export interface IAgent {
  id: string;
  x: number;
  y: number;
  state: AgentState;
  jobType?: string;

  // Rich visualization data
  currentTask?: IAgentTask;
  skills?: string[];        // e.g., ["typescript", "react", "testing"]
  metrics?: IAgentMetrics;
  connections?: string[];   // IDs of agents collaborating with
}

/** Full snapshot of the office world sent on initial connection. */
export interface IWorldState {
  agents: IAgent[];
  tick: number;
}
