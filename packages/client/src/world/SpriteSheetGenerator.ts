import * as THREE from 'three';

/**
 * Generates animated sprite sheets for agents.
 * Each sheet is 128x128 (4x4 grid of 32x32 frames).
 *
 * Layout:
 *   Row 0: Idle      (frames 0-3, only 0-1 used, 2-3 mirror)
 *   Row 1: Walking   (frames 0-3)
 *   Row 2: Working   (frames 0-3, only 0-1 used, 2-3 mirror)
 *   Row 3: Error     (frames 0-3, only 0-1 used, 2-3 mirror)
 */

function ctx2d(w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const x = c.getContext('2d')!;
  x.imageSmoothingEnabled = false;
  return [c, x];
}

/**
 * Draw a single agent frame at (ox, oy) on the given context.
 * Params control per-frame variation for animation.
 */
function drawAgentFrame(
  g: CanvasRenderingContext2D,
  ox: number, oy: number,
  hairColor: string,
  outfitColor: string,
  opts: {
    bodyOffsetY?: number;   // vertical shift for bob
    leftArmY?: number;      // arm Y offset
    rightArmY?: number;
    leftLegX?: number;      // leg X offset for walk
    rightLegX?: number;
    leftLegY?: number;      // leg Y offset for walk
    rightLegY?: number;
    headShakeX?: number;    // horizontal head offset (error)
  } = {},
): void {
  const {
    bodyOffsetY = 0,
    leftArmY = 0,
    rightArmY = 0,
    leftLegX = 0,
    rightLegX = 0,
    leftLegY = 0,
    rightLegY = 0,
    headShakeX = 0,
  } = opts;

  const by = bodyOffsetY;

  // Ground shadow
  g.fillStyle = 'rgba(0,0,0,0.15)';
  g.fillRect(ox + 8, oy + 25, 16, 4);
  g.fillRect(ox + 9, oy + 29, 14, 2);

  // Left foot
  g.fillStyle = '#2a2a2a';
  g.fillRect(ox + 10 + leftLegX, oy + 24 + leftLegY, 4, 3);

  // Right foot
  g.fillStyle = '#2a2a2a';
  g.fillRect(ox + 18 + rightLegX, oy + 24 + rightLegY, 4, 3);

  // Body / outfit
  g.fillStyle = outfitColor;
  g.fillRect(ox + 9, oy + 14 + by, 14, 11);
  g.fillRect(ox + 10, oy + 13 + by, 12, 1);

  // Outfit shading
  g.fillStyle = 'rgba(0,0,0,0.15)';
  g.fillRect(ox + 9, oy + 14 + by, 2, 11);
  g.fillRect(ox + 21, oy + 14 + by, 2, 11);

  // Outfit highlight
  g.fillStyle = 'rgba(255,255,255,0.1)';
  g.fillRect(ox + 13, oy + 14 + by, 6, 8);

  // Collar
  g.fillStyle = 'rgba(255,255,255,0.2)';
  g.fillRect(ox + 13, oy + 13 + by, 6, 1);

  // Left arm
  g.fillStyle = outfitColor;
  g.fillRect(ox + 6, oy + 15 + by + leftArmY, 3, 8);
  g.fillStyle = 'rgba(0,0,0,0.12)';
  g.fillRect(ox + 6, oy + 15 + by + leftArmY, 1, 8);
  // Left hand
  g.fillStyle = '#f0c8a0';
  g.fillRect(ox + 6, oy + 22 + by + leftArmY, 3, 2);

  // Right arm
  g.fillStyle = outfitColor;
  g.fillRect(ox + 23, oy + 15 + by + rightArmY, 3, 8);
  g.fillStyle = 'rgba(0,0,0,0.12)';
  g.fillRect(ox + 25, oy + 15 + by + rightArmY, 1, 8);
  // Right hand
  g.fillStyle = '#f0c8a0';
  g.fillRect(ox + 23, oy + 22 + by + rightArmY, 3, 2);

  // Head
  const hx = headShakeX;
  g.fillStyle = '#f5d0a8';
  g.fillRect(ox + 10 + hx, oy + 6 + by, 12, 8);
  g.fillRect(ox + 11 + hx, oy + 5 + by, 10, 1);
  g.fillRect(ox + 11 + hx, oy + 14 + by, 10, 1);

  // Cheek blush
  g.fillStyle = '#f0a8a0';
  g.fillRect(ox + 10 + hx, oy + 10 + by, 2, 2);
  g.fillRect(ox + 20 + hx, oy + 10 + by, 2, 2);

  // Eyes
  g.fillStyle = '#222222';
  g.fillRect(ox + 12 + hx, oy + 9 + by, 2, 2);
  g.fillRect(ox + 18 + hx, oy + 9 + by, 2, 2);
  // Eye highlights
  g.fillStyle = '#ffffff';
  g.fillRect(ox + 12 + hx, oy + 9 + by, 1, 1);
  g.fillRect(ox + 18 + hx, oy + 9 + by, 1, 1);

  // Mouth
  g.fillStyle = '#cc8888';
  g.fillRect(ox + 14 + hx, oy + 12 + by, 4, 1);

  // Hair
  g.fillStyle = hairColor;
  g.fillRect(ox + 9 + hx, oy + 2 + by, 14, 7);
  g.fillRect(ox + 10 + hx, oy + 1 + by, 12, 1);
  g.fillRect(ox + 8 + hx, oy + 4 + by, 2, 6);
  g.fillRect(ox + 22 + hx, oy + 4 + by, 2, 6);

  // Hair highlight
  g.fillStyle = 'rgba(255,255,255,0.12)';
  g.fillRect(ox + 12 + hx, oy + 2 + by, 4, 3);

  // Hair shadow
  g.fillStyle = 'rgba(0,0,0,0.1)';
  g.fillRect(ox + 9 + hx, oy + 8 + by, 14, 1);
}

/**
 * Generate a 128x128 sprite sheet for one agent.
 * Returns a NearestFilter CanvasTexture.
 */
export function createAgentSpriteSheet(
  hairColor: string,
  outfitColor: string,
): THREE.CanvasTexture {
  const [canvas, g] = ctx2d(128, 128);

  // Row 0: Idle (gentle body bob)
  drawAgentFrame(g, 0, 0, hairColor, outfitColor, { bodyOffsetY: 0 });
  drawAgentFrame(g, 32, 0, hairColor, outfitColor, { bodyOffsetY: -1 });
  drawAgentFrame(g, 64, 0, hairColor, outfitColor, { bodyOffsetY: 0 });
  drawAgentFrame(g, 96, 0, hairColor, outfitColor, { bodyOffsetY: -1 });

  // Row 1: Walking (leg + arm swing)
  drawAgentFrame(g, 0, 32, hairColor, outfitColor, {
    leftLegX: -1, leftLegY: -1, rightLegX: 1, rightLegY: 0,
    leftArmY: -1, rightArmY: 1,
  });
  drawAgentFrame(g, 32, 32, hairColor, outfitColor, {
    leftLegX: 0, leftLegY: 0, rightLegX: 0, rightLegY: 0,
    leftArmY: 0, rightArmY: 0,
  });
  drawAgentFrame(g, 64, 32, hairColor, outfitColor, {
    leftLegX: 1, leftLegY: 0, rightLegX: -1, rightLegY: -1,
    leftArmY: 1, rightArmY: -1,
  });
  drawAgentFrame(g, 96, 32, hairColor, outfitColor, {
    leftLegX: 0, leftLegY: 0, rightLegX: 0, rightLegY: 0,
    leftArmY: 0, rightArmY: 0,
  });

  // Row 2: Working (typing hands)
  drawAgentFrame(g, 0, 64, hairColor, outfitColor, {
    leftArmY: 2, rightArmY: 2,
  });
  drawAgentFrame(g, 32, 64, hairColor, outfitColor, {
    leftArmY: 1, rightArmY: 3,
  });
  drawAgentFrame(g, 64, 64, hairColor, outfitColor, {
    leftArmY: 2, rightArmY: 2,
  });
  drawAgentFrame(g, 96, 64, hairColor, outfitColor, {
    leftArmY: 3, rightArmY: 1,
  });

  // Row 3: Error (head shake + arms out)
  drawAgentFrame(g, 0, 96, hairColor, outfitColor, {
    headShakeX: -2, leftArmY: -2, rightArmY: -2,
  });
  drawAgentFrame(g, 32, 96, hairColor, outfitColor, {
    headShakeX: 2, leftArmY: -1, rightArmY: -1,
  });
  drawAgentFrame(g, 64, 96, hairColor, outfitColor, {
    headShakeX: -2, leftArmY: -2, rightArmY: -2,
  });
  drawAgentFrame(g, 96, 96, hairColor, outfitColor, {
    headShakeX: 2, leftArmY: -1, rightArmY: -1,
  });

  const tex = new THREE.CanvasTexture(canvas);
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
