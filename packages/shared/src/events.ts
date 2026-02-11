/**
 * Socket.io event constants shared between client and server.
 * Using a const object instead of an enum so the values are literal strings
 * at runtime, making debugging easier in Socket.io inspector tools.
 */
export const SocketEvents = {
  // ── Server → Client ──────────────────────────────────────
  /** Batch update of all agents (delta or full). Payload: IAgent[] */
  SERVER_AGENT_UPDATE: 'server:agent:update',

  /** Full world snapshot on first connect. Payload: IWorldState */
  SERVER_WORLD_STATE: 'server:world:state',

  /** A single agent was removed. Payload: { id: string } */
  SERVER_AGENT_REMOVE: 'server:agent:remove',

  // ── Client → Server ──────────────────────────────────────
  /** Client requests to join a named room. Payload: { room: string } */
  CLIENT_JOIN_ROOM: 'client:join:room',
} as const;

/** Helper type to extract event name union. */
export type SocketEvent = (typeof SocketEvents)[keyof typeof SocketEvents];
