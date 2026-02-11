export const SERVER_PORT = Number(process.env.PORT ?? 3001);
export const CORS_ORIGIN = process.env.CORS_ORIGIN ?? '*';

/**
 * API key for authenticating agent REST API requests.
 * Set via PIXEL_OFFICE_API_KEY env var. If empty, auth is disabled (dev mode).
 */
export const API_KEY = process.env.PIXEL_OFFICE_API_KEY ?? '';

/** How often the server broadcasts agent state to clients (ms). */
export const TICK_RATE_MS = 100;

/** Mock simulation: max agents alive at once. */
export const MAX_MOCK_AGENTS = 20;

/** Mock simulation: world bounds (cartesian). */
export const WORLD_WIDTH = 800;
export const WORLD_HEIGHT = 600;
