/**
 * Deterministic agent appearance based on agent ID.
 * Provides hair color, outfit color, and other visual variation.
 */

const HAIR_PALETTE = [
  '#f5d595', // blonde
  '#8B4513', // brown
  '#ff69b4', // pink
  '#2c1810', // dark brown
  '#c0392b', // red
  '#884dff', // purple
  '#ff8c00', // orange
  '#333333', // black
];

const OUTFIT_PALETTE = [
  '#4fc3f7', // light blue
  '#ba68c8', // purple
  '#81c784', // green
  '#ffb74d', // orange
  '#ef5350', // red
  '#7986cb', // indigo
  '#f06292', // pink
  '#4db6ac', // teal
];

function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

/** Deterministic hair color string for an agent. */
export function getAgentHairColor(agentId: string): string {
  const hash = simpleHash(agentId);
  return HAIR_PALETTE[hash % HAIR_PALETTE.length];
}

/** Deterministic outfit color string for an agent. */
export function getAgentOutfitColor(agentId: string): string {
  const hash = simpleHash(agentId);
  return OUTFIT_PALETTE[(hash >> 8) % OUTFIT_PALETTE.length];
}

/** Deterministic body color (hex number) for compatibility. */
export function getAgentColor(agentId: string): number {
  const hash = simpleHash(agentId);
  return [
    0x4fc3f7, 0xba68c8, 0x81c784, 0xffb74d, 0xef5350,
    0x7986cb, 0xf06292, 0x4db6ac, 0xa1887f, 0x90a4ae,
  ][hash % 10];
}

/** Deterministic scale factor for subtle size variation. */
export function getAgentScale(agentId: string): number {
  const hash = simpleHash(agentId);
  return 0.95 + ((hash >> 16) % 11) / 100;
}
