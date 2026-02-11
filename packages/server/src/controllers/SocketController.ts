import { Server as IOServer, type Socket } from 'socket.io';
import { SocketEvents, type IWorldState } from '@pixel-office/shared';
import type { AgentManager } from '../services/AgentManager.js';
import { TICK_RATE_MS } from '../config.js';

/**
 * Owns the Socket.io server instance.
 * Handles client lifecycle and broadcasts agent state at a fixed tick rate.
 */
export class SocketController {
  private tickTimer: ReturnType<typeof setInterval> | null = null;
  private tick = 0;

  constructor(
    private io: IOServer,
    private agentManager: AgentManager,
  ) {
    this.io.on('connection', (socket) => this.onConnection(socket));
  }

  /** Start the broadcast loop. */
  startBroadcast(): void {
    if (this.tickTimer) return;

    this.tickTimer = setInterval(() => {
      this.tick++;
      this.broadcastState();
    }, TICK_RATE_MS);

    console.log(`[SocketController] broadcasting every ${TICK_RATE_MS}ms`);
  }

  stopBroadcast(): void {
    if (this.tickTimer) {
      clearInterval(this.tickTimer);
      this.tickTimer = null;
    }
  }

  // ── Connection lifecycle ───────────────────────────────

  private onConnection(socket: Socket): void {
    console.log(`[SocketController] client connected: ${socket.id}`);

    // Send full world snapshot immediately
    const snapshot: IWorldState = {
      agents: this.agentManager.getAll(),
      tick: this.tick,
    };
    socket.emit(SocketEvents.SERVER_WORLD_STATE, snapshot);

    // Handle room join requests
    socket.on(SocketEvents.CLIENT_JOIN_ROOM, (payload: { room: string }) => {
      if (typeof payload?.room === 'string' && payload.room.length < 64) {
        void socket.join(payload.room);
        console.log(`[SocketController] ${socket.id} joined room "${payload.room}"`);
      }
    });

    socket.on('disconnect', () => {
      console.log(`[SocketController] client disconnected: ${socket.id}`);
    });
  }

  // ── Broadcast ──────────────────────────────────────────

  private broadcastState(): void {
    if (!this.agentManager.isDirty) return;

    const agents = this.agentManager.getAll();
    this.io.emit(SocketEvents.SERVER_AGENT_UPDATE, agents);
    this.agentManager.clearDirty();
  }
}
