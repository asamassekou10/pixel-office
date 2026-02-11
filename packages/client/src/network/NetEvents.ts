/**
 * Network event names emitted by NetworkManager.
 * Other modules subscribe to these via `networkManager.on(...)`.
 */
export const NetEvents = {
  WORLD_STATE: 'net:world-state',
  AGENT_UPDATE: 'net:agent-update',
  AGENT_REMOVE: 'net:agent-remove',
  CONNECTED: 'net:connected',
  DISCONNECTED: 'net:disconnected',
} as const;
