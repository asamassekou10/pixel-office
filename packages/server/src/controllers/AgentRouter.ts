import { Router, type Request, type Response } from 'express';
import { AgentState, type IAgent } from '@pixel-office/shared';
import type { AgentManager } from '../services/AgentManager.js';
import { API_KEY, WORLD_WIDTH, WORLD_HEIGHT } from '../config.js';

/**
 * REST API for external agent integration.
 *
 * POST   /api/agents      → Create or update an agent
 * GET    /api/agents      → List all agents
 * GET    /api/agents/:id  → Get a single agent
 * DELETE /api/agents/:id  → Remove an agent
 *
 * If PIXEL_OFFICE_API_KEY is set, all requests require:
 *   Authorization: Bearer <key>
 */
export function createAgentRouter(agentManager: AgentManager): Router {
  const router = Router();

  // ── Auth middleware ────────────────────────────────────
  router.use((_req: Request, res: Response, next) => {
    if (!API_KEY) return next(); // no key configured = open access
    const header = _req.headers.authorization;
    if (header === `Bearer ${API_KEY}`) return next();
    res.status(401).json({ error: 'Invalid or missing API key' });
  });

  // ── GET /api/agents ───────────────────────────────────
  router.get('/', (_req: Request, res: Response) => {
    res.json({ agents: agentManager.getAll(), count: agentManager.count });
  });

  // ── GET /api/agents/:id ───────────────────────────────
  router.get('/:id', (req: Request, res: Response) => {
    const agent = agentManager.get(String(req.params.id));
    if (!agent) {
      res.status(404).json({ error: 'Agent not found' });
      return;
    }
    res.json(agent);
  });

  // ── POST /api/agents ──────────────────────────────────
  router.post('/', (req: Request, res: Response) => {
    const body = req.body;

    // Validate required fields
    if (!body || typeof body.id !== 'string' || !body.id.trim()) {
      res.status(400).json({ error: 'Missing required field: id (string)' });
      return;
    }

    const validStates = Object.values(AgentState);
    const state = validStates.includes(body.state) ? body.state : AgentState.IDLE;

    const agent: IAgent = {
      id: body.id.trim(),
      x: clamp(Number(body.x) || 0, 0, WORLD_WIDTH),
      y: clamp(Number(body.y) || 0, 0, WORLD_HEIGHT),
      state,
      jobType: body.jobType,
      currentTask: body.currentTask,
      skills: Array.isArray(body.skills) ? body.skills : undefined,
      metrics: body.metrics,
      connections: Array.isArray(body.connections) ? body.connections : undefined,
    };

    agentManager.upsert(agent);
    res.status(200).json(agent);
  });

  // ── DELETE /api/agents/:id ────────────────────────────
  router.delete('/:id', (req: Request, res: Response) => {
    const id = String(req.params.id);
    const deleted = agentManager.remove(id);
    if (!deleted) {
      res.status(404).json({ error: 'Agent not found' });
      return;
    }
    res.json({ deleted: id });
  });

  return router;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
