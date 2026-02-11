import express from 'express';
import cors from 'cors';
import { createServer } from 'node:http';
import { Server as IOServer } from 'socket.io';

import { SERVER_PORT, CORS_ORIGIN, API_KEY } from './config.js';
import { AgentManager } from './services/AgentManager.js';
import { MockAgentService } from './services/MockAgentService.js';
import { SocketController } from './controllers/SocketController.js';
import { createAgentRouter } from './controllers/AgentRouter.js';

// ── Express ──────────────────────────────────────────────
const app = express();
app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json());
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// ── HTTP + Socket.io ─────────────────────────────────────
const httpServer = createServer(app);
const io = new IOServer(httpServer, {
  cors: { origin: CORS_ORIGIN, methods: ['GET', 'POST'] },
});

// ── Services ─────────────────────────────────────────────
const agentManager = new AgentManager();
const socketController = new SocketController(io, agentManager);
const mockService = new MockAgentService(agentManager);

// ── REST API for external agent integration ──────────────
app.use('/api/agents', createAgentRouter(agentManager));

// ── Start ────────────────────────────────────────────────
httpServer.listen(SERVER_PORT, () => {
  console.log(`[PixelOffice] server listening on http://localhost:${SERVER_PORT}`);
  console.log(`[PixelOffice] REST API:  http://localhost:${SERVER_PORT}/api/agents`);
  console.log(`[PixelOffice] Auth:      ${API_KEY ? 'API key required' : 'open (set PIXEL_OFFICE_API_KEY to secure)'}`);

  socketController.startBroadcast();

  // Only start mock agents if no API key is configured (dev mode)
  if (!API_KEY) {
    mockService.start();
    console.log('[PixelOffice] Mock agents active (dev mode)');
  } else {
    console.log('[PixelOffice] Production mode — waiting for agents via REST API');
  }
});
