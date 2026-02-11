import { io, type Socket } from 'socket.io-client';
import EventEmitter from 'eventemitter3';
import { SocketEvents, type IAgent, type IWorldState } from '@pixel-office/shared';
import { SERVER_URL } from '../config.js';
import { NetEvents } from './NetEvents.js';

export { NetEvents };

/**
 * Singleton bridge between Socket.io and the application event system.
 * Uses eventemitter3 for the familiar `.on()` / `.off()` API.
 */
export class NetworkManager extends EventEmitter {
  private static instance: NetworkManager | null = null;
  private socket: Socket | null = null;

  private constructor() {
    super();
  }

  static getInstance(): NetworkManager {
    if (!NetworkManager.instance) {
      NetworkManager.instance = new NetworkManager();
    }
    return NetworkManager.instance;
  }

  // ── Lifecycle ──────────────────────────────────────────

  connect(): void {
    if (this.socket?.connected) return;

    this.socket = io(SERVER_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      console.log('[NetworkManager] connected:', this.socket!.id);
      this.emit(NetEvents.CONNECTED);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('[NetworkManager] disconnected:', reason);
      this.emit(NetEvents.DISCONNECTED, reason);
    });

    // ── Server events → App events ──────────────────────
    this.socket.on(SocketEvents.SERVER_WORLD_STATE, (data: IWorldState) => {
      this.emit(NetEvents.WORLD_STATE, data);
    });

    this.socket.on(SocketEvents.SERVER_AGENT_UPDATE, (agents: IAgent[]) => {
      this.emit(NetEvents.AGENT_UPDATE, agents);
    });

    this.socket.on(SocketEvents.SERVER_AGENT_REMOVE, (payload: { id: string }) => {
      this.emit(NetEvents.AGENT_REMOVE, payload.id);
    });
  }

  disconnect(): void {
    this.socket?.disconnect();
    this.socket = null;
  }

  // ── Outbound ───────────────────────────────────────────

  joinRoom(room: string): void {
    this.socket?.emit(SocketEvents.CLIENT_JOIN_ROOM, { room });
  }

  get isConnected(): boolean {
    return this.socket?.connected ?? false;
  }
}
