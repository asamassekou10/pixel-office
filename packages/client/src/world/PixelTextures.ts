import * as THREE from 'three';

/**
 * High-detail canvas pixel-art texture generator (32x32 base).
 * Stardew Valley / Pokémon quality top-down art.
 */

function makeTexture(canvas: HTMLCanvasElement): THREE.CanvasTexture {
  const tex = new THREE.CanvasTexture(canvas);
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function ctx2d(w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const x = c.getContext('2d')!;
  x.imageSmoothingEnabled = false;
  return [c, x];
}

/** Helper: draw a filled pixel-circle. */
function pixelCircle(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, r: number, color: string,
): void {
  ctx.fillStyle = color;
  for (let y = -r; y <= r; y++) {
    for (let x = -r; x <= r; x++) {
      if (x * x + y * y <= r * r) {
        ctx.fillRect(cx + x, cy + y, 1, 1);
      }
    }
  }
}

// ═══════════════════════════════════════════════════════════
//  FLOOR & WALLS
// ═══════════════════════════════════════════════════════════

/** 32x32 warm wood floor with planks, grain, and knots. */
export function createFloorTexture(): THREE.CanvasTexture {
  const [c, g] = ctx2d(32, 32);

  // Base warm wood
  g.fillStyle = '#5c4033';
  g.fillRect(0, 0, 32, 32);

  // Two horizontal planks
  // Top plank
  g.fillStyle = '#6b4c3b';
  g.fillRect(0, 0, 32, 15);

  // Plank gap
  g.fillStyle = '#3a2518';
  g.fillRect(0, 15, 32, 1);

  // Bottom plank (slightly different tone)
  g.fillStyle = '#5e422f';
  g.fillRect(0, 16, 32, 15);
  g.fillStyle = '#3a2518';
  g.fillRect(0, 31, 32, 1);

  // Vertical stagger line (planks offset like real wood)
  g.fillStyle = '#3a2518';
  g.fillRect(18, 0, 1, 15);
  g.fillRect(10, 16, 1, 15);

  // Wood grain lines (top plank)
  g.fillStyle = '#755540';
  g.fillRect(2, 3, 8, 1);
  g.fillRect(4, 7, 12, 1);
  g.fillRect(20, 5, 6, 1);
  g.fillRect(22, 10, 8, 1);

  // Wood grain lines (bottom plank)
  g.fillStyle = '#6d4e38';
  g.fillRect(1, 20, 7, 1);
  g.fillRect(12, 23, 10, 1);
  g.fillRect(3, 27, 5, 1);
  g.fillRect(18, 26, 8, 1);

  // Knot on top plank
  g.fillStyle = '#4a3020';
  g.fillRect(8, 5, 2, 2);
  g.fillStyle = '#3d2618';
  g.fillRect(9, 5, 1, 1);

  // Knot on bottom plank
  g.fillStyle = '#4a3020';
  g.fillRect(24, 22, 2, 2);
  g.fillStyle = '#3d2618';
  g.fillRect(25, 22, 1, 1);

  // Highlight sheen (wax reflection)
  g.fillStyle = 'rgba(255,255,255,0.04)';
  g.fillRect(0, 2, 32, 4);
  g.fillRect(0, 18, 32, 4);

  return makeTexture(c);
}

/** 32x32 wall tile with crown molding and baseboard. */
export function createWallTexture(): THREE.CanvasTexture {
  const [c, g] = ctx2d(32, 32);

  // Main wall colour
  g.fillStyle = '#6b6b7a';
  g.fillRect(0, 0, 32, 32);

  // Subtle texture noise
  g.fillStyle = '#636373';
  g.fillRect(5, 8, 3, 2);
  g.fillRect(18, 14, 4, 2);
  g.fillRect(10, 22, 3, 1);
  g.fillStyle = '#737385';
  g.fillRect(12, 6, 4, 1);
  g.fillRect(22, 20, 3, 2);
  g.fillRect(2, 16, 2, 1);

  // Crown molding (top 3 rows)
  g.fillStyle = '#888899';
  g.fillRect(0, 0, 32, 1);
  g.fillStyle = '#7d7d8e';
  g.fillRect(0, 1, 32, 1);
  g.fillStyle = '#74748a';
  g.fillRect(0, 2, 32, 1);

  // Baseboard (bottom 4 rows)
  g.fillStyle = '#555563';
  g.fillRect(0, 28, 32, 4);
  g.fillStyle = '#4d4d5b';
  g.fillRect(0, 29, 32, 1);
  g.fillStyle = '#606070';
  g.fillRect(0, 28, 32, 1); // baseboard top edge highlight

  return makeTexture(c);
}

/** Carpet tile (soft blue-grey loop texture). */
export function createCarpetTexture(): THREE.CanvasTexture {
  const [c, g] = ctx2d(32, 32);

  g.fillStyle = '#4a5568';
  g.fillRect(0, 0, 32, 32);

  // Loop pattern (tiny dots arranged in grid)
  for (let y = 0; y < 32; y += 4) {
    for (let x = 0; x < 32; x += 4) {
      const shade = ((x + y) % 8 === 0) ? '#515e72' : '#44516a';
      g.fillStyle = shade;
      g.fillRect(x + 1, y + 1, 2, 2);
    }
  }

  // Slight edge highlight
  g.fillStyle = 'rgba(255,255,255,0.03)';
  g.fillRect(0, 0, 32, 1);
  g.fillRect(0, 0, 1, 32);

  return makeTexture(c);
}

// ═══════════════════════════════════════════════════════════
//  FURNITURE
// ═══════════════════════════════════════════════════════════

/** 32x32 desk with keyboard, mouse-pad, and coffee cup. */
export function createDeskTexture(): THREE.CanvasTexture {
  const [c, g] = ctx2d(32, 32);

  // Shadow under desk edge
  g.fillStyle = 'rgba(0,0,0,0.15)';
  g.fillRect(1, 30, 30, 2);

  // Desk surface (warm grey laminate)
  g.fillStyle = '#7a9bb5';
  g.fillRect(0, 0, 32, 30);

  // Beveled edge
  g.fillStyle = '#6888a0';
  g.fillRect(0, 0, 32, 1);
  g.fillRect(0, 0, 1, 30);
  g.fillStyle = '#8aabcf';
  g.fillRect(1, 29, 30, 1);
  g.fillRect(31, 1, 1, 29);

  // Surface highlight
  g.fillStyle = 'rgba(255,255,255,0.06)';
  g.fillRect(2, 2, 28, 12);

  // Keyboard (dark rectangle with key grid)
  g.fillStyle = '#2a2a3a';
  g.fillRect(8, 17, 16, 8);
  // Key rows
  g.fillStyle = '#3a3a4a';
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 7; col++) {
      g.fillRect(9 + col * 2, 18 + row * 2, 1, 1);
    }
  }
  // Space bar
  g.fillStyle = '#3a3a4a';
  g.fillRect(12, 24, 8, 1);

  // Mouse pad (right side)
  g.fillStyle = '#3d5a6e';
  g.fillRect(26, 16, 5, 7);
  // Mouse
  g.fillStyle = '#cccccc';
  g.fillRect(27, 17, 3, 4);
  g.fillStyle = '#aaaaaa';
  g.fillRect(28, 17, 1, 2);

  // Coffee cup (top-left)
  g.fillStyle = '#ffffff';
  pixelCircle(g, 4, 7, 2, '#ffffff');
  g.fillStyle = '#8B4513';
  pixelCircle(g, 4, 7, 1, '#8B4513');
  // Cup handle
  g.fillStyle = '#dddddd';
  g.fillRect(7, 7, 1, 1);

  // Sticky note (yellow)
  g.fillStyle = '#f5e642';
  g.fillRect(2, 18, 4, 4);
  g.fillStyle = '#d4c537';
  g.fillRect(3, 19, 2, 1);

  return makeTexture(c);
}

/** 32x32 monitor from top-down (shows screen with code). */
export function createMonitorTexture(): THREE.CanvasTexture {
  const [c, g] = ctx2d(32, 32);
  g.clearRect(0, 0, 32, 32);

  // Monitor shadow
  g.fillStyle = 'rgba(0,0,0,0.12)';
  g.fillRect(3, 5, 26, 22);

  // Monitor bezel (dark frame)
  g.fillStyle = '#1a1a2a';
  g.fillRect(2, 2, 28, 22);

  // Screen area
  g.fillStyle = '#0d1117';
  g.fillRect(4, 4, 24, 18);

  // Code lines on screen (realistic terminal look)
  const codeColors = ['#79c0ff', '#ff7b72', '#7ee787', '#d2a8ff', '#ffa657', '#79c0ff'];
  for (let line = 0; line < 7; line++) {
    const y = 5 + line * 2;
    const indent = (line === 2 || line === 3 || line === 5) ? 3 : 0;
    const width = 6 + (line * 3 + 7) % 12;
    g.fillStyle = codeColors[line % codeColors.length];
    g.fillRect(5 + indent, y, Math.min(width, 22 - indent), 1);
  }

  // Cursor blink
  g.fillStyle = '#e6edf3';
  g.fillRect(5, 19, 1, 1);

  // Power LED (bright for bloom)
  g.fillStyle = '#66ff99';
  g.fillRect(15, 23, 2, 1);

  // Stand
  g.fillStyle = '#2a2a3a';
  g.fillRect(13, 24, 6, 2);
  g.fillStyle = '#222233';
  g.fillRect(11, 26, 10, 2);

  // Screen edge glow (bright for bloom)
  g.fillStyle = 'rgba(0,220,255,0.2)';
  g.fillRect(3, 3, 26, 1);
  g.fillRect(3, 21, 26, 1);

  return makeTexture(c);
}

/** 32x32 office chair (seat + backrest + star base). */
export function createChairTexture(): THREE.CanvasTexture {
  const [c, g] = ctx2d(32, 32);
  g.clearRect(0, 0, 32, 32);

  // Star base (5 legs)
  g.fillStyle = '#333340';
  // Center
  g.fillRect(14, 14, 4, 4);
  // 5 radiating legs
  g.fillRect(8, 15, 6, 2);
  g.fillRect(18, 15, 6, 2);
  g.fillRect(15, 8, 2, 6);
  g.fillRect(15, 18, 2, 6);
  g.fillRect(10, 10, 3, 2);
  g.fillRect(19, 10, 3, 2);
  g.fillRect(10, 20, 3, 2);
  g.fillRect(19, 20, 3, 2);

  // Caster wheels
  g.fillStyle = '#222230';
  g.fillRect(7, 15, 2, 2);
  g.fillRect(23, 15, 2, 2);
  g.fillRect(15, 7, 2, 2);
  g.fillRect(15, 23, 2, 2);

  // Seat cushion
  g.fillStyle = '#444458';
  g.fillRect(9, 9, 14, 14);
  g.fillRect(10, 8, 12, 16);
  g.fillRect(8, 10, 16, 12);

  // Seat padding highlight
  g.fillStyle = '#52526a';
  g.fillRect(11, 10, 10, 10);

  // Seat center stitch line
  g.fillStyle = '#3e3e52';
  g.fillRect(16, 10, 1, 12);
  g.fillRect(10, 16, 12, 1);

  // Backrest (visible above seat, towards "up")
  g.fillStyle = '#3e3e55';
  g.fillRect(10, 5, 12, 6);
  g.fillRect(11, 4, 10, 1);
  g.fillStyle = '#484868';
  g.fillRect(12, 5, 8, 4);

  // Armrests
  g.fillStyle = '#3a3a50';
  g.fillRect(8, 9, 2, 12);
  g.fillRect(22, 9, 2, 12);

  return makeTexture(c);
}

/** 32x32 potted plant with leaves and flower. */
export function createPlantTexture(): THREE.CanvasTexture {
  const [c, g] = ctx2d(32, 32);
  g.clearRect(0, 0, 32, 32);

  // Pot shadow
  g.fillStyle = 'rgba(0,0,0,0.12)';
  g.fillRect(9, 26, 14, 4);

  // Leaves — layered foliage
  // Back layer (darker)
  g.fillStyle = '#1a7a2a';
  g.fillRect(10, 2, 4, 3);
  g.fillRect(18, 3, 5, 3);
  g.fillRect(6, 6, 6, 4);
  g.fillRect(20, 5, 5, 4);

  // Middle layer
  g.fillStyle = '#228B22';
  g.fillRect(8, 4, 6, 5);
  g.fillRect(14, 3, 6, 5);
  g.fillRect(6, 8, 20, 6);
  g.fillRect(8, 14, 16, 4);
  g.fillRect(10, 18, 12, 2);

  // Front layer (brighter highlights)
  g.fillStyle = '#2db542';
  g.fillRect(10, 5, 4, 3);
  g.fillRect(16, 6, 4, 3);
  g.fillRect(8, 10, 5, 3);
  g.fillRect(19, 10, 4, 3);
  g.fillRect(12, 13, 6, 3);

  // Light leaf tips
  g.fillStyle = '#45d45a';
  g.fillRect(9, 4, 2, 1);
  g.fillRect(20, 5, 2, 1);
  g.fillRect(7, 8, 2, 1);
  g.fillRect(23, 9, 2, 1);
  g.fillRect(13, 2, 2, 1);

  // Small flower
  g.fillStyle = '#ff69b4';
  g.fillRect(18, 4, 2, 2);
  g.fillStyle = '#ffaa00';
  g.fillRect(19, 4, 1, 1);

  // Pot
  g.fillStyle = '#b05a30';
  g.fillRect(10, 20, 12, 8);
  g.fillRect(11, 28, 10, 2);

  // Pot rim
  g.fillStyle = '#c06a3a';
  g.fillRect(9, 20, 14, 2);

  // Pot highlight
  g.fillStyle = '#c87a48';
  g.fillRect(11, 22, 3, 5);

  // Pot shadow side
  g.fillStyle = '#8a4420';
  g.fillRect(19, 22, 2, 5);

  // Soil visible at top
  g.fillStyle = '#3a2515';
  g.fillRect(11, 20, 10, 1);

  return makeTexture(c);
}

/** 32x32 coffee machine with counter. */
export function createCoffeeMachineTexture(): THREE.CanvasTexture {
  const [c, g] = ctx2d(32, 32);
  g.clearRect(0, 0, 32, 32);

  // Counter surface
  g.fillStyle = '#8a8a9a';
  g.fillRect(0, 14, 32, 18);
  g.fillStyle = '#7a7a8a';
  g.fillRect(0, 14, 32, 1);

  // Machine body
  g.fillStyle = '#3a3a48';
  g.fillRect(4, 0, 18, 16);

  // Machine top
  g.fillStyle = '#444458';
  g.fillRect(5, 1, 16, 3);

  // Water tank (translucent blue)
  g.fillStyle = '#5588aa';
  g.fillRect(6, 4, 6, 8);
  g.fillStyle = '#6699bb';
  g.fillRect(7, 5, 4, 4);

  // Drip area
  g.fillStyle = '#2a2a35';
  g.fillRect(13, 8, 8, 6);

  // Grate
  g.fillStyle = '#333340';
  for (let i = 0; i < 3; i++) {
    g.fillRect(14, 9 + i * 2, 6, 1);
  }

  // Cup under drip
  g.fillStyle = '#ffffff';
  g.fillRect(15, 10, 4, 3);
  g.fillStyle = '#8B4513';
  g.fillRect(16, 10, 2, 2);

  // Buttons
  g.fillStyle = '#00cc66';
  g.fillRect(6, 13, 2, 2);
  g.fillStyle = '#ff6644';
  g.fillRect(9, 13, 2, 2);

  // Power indicator
  g.fillStyle = '#00ff66';
  g.fillRect(20, 2, 1, 1);

  // Donut box on counter
  g.fillStyle = '#ff8899';
  g.fillRect(24, 18, 6, 5);
  g.fillStyle = '#ffaabb';
  g.fillRect(25, 19, 4, 3);
  // Donuts (tiny circles)
  g.fillStyle = '#ddaa55';
  g.fillRect(25, 19, 2, 2);
  g.fillRect(27, 20, 2, 2);

  // Napkin stack
  g.fillStyle = '#eeeeee';
  g.fillRect(1, 18, 4, 5);
  g.fillStyle = '#dddddd';
  g.fillRect(1, 18, 4, 1);

  return makeTexture(c);
}

/** 64x32 sofa with cushions and throw pillow. */
export function createSofaTexture(): THREE.CanvasTexture {
  const [c, g] = ctx2d(64, 32);

  // Shadow
  g.fillStyle = 'rgba(0,0,0,0.12)';
  g.fillRect(2, 28, 60, 4);

  // Frame
  g.fillStyle = '#5B3216';
  g.fillRect(0, 2, 64, 28);

  // Back rest (darker top section)
  g.fillStyle = '#4a2810';
  g.fillRect(0, 0, 64, 8);
  g.fillStyle = '#533016';
  g.fillRect(2, 1, 60, 5);

  // Left cushion
  g.fillStyle = '#7B5236';
  g.fillRect(4, 8, 26, 18);
  g.fillStyle = '#8B6246';
  g.fillRect(6, 10, 22, 10);
  // Cushion shadow
  g.fillStyle = '#6a4228';
  g.fillRect(4, 24, 26, 2);

  // Right cushion
  g.fillStyle = '#7B5236';
  g.fillRect(34, 8, 26, 18);
  g.fillStyle = '#8B6246';
  g.fillRect(36, 10, 22, 10);
  g.fillStyle = '#6a4228';
  g.fillRect(34, 24, 26, 2);

  // Cushion seam line
  g.fillStyle = '#6a4228';
  g.fillRect(30, 8, 4, 18);

  // Throw pillow (accent colour)
  g.fillStyle = '#c9854a';
  g.fillRect(8, 10, 8, 8);
  g.fillStyle = '#d99555';
  g.fillRect(9, 11, 6, 6);
  // Pillow pattern
  g.fillStyle = '#c08040';
  g.fillRect(11, 13, 2, 2);

  // Armrests
  g.fillStyle = '#4a2810';
  g.fillRect(0, 4, 4, 24);
  g.fillRect(60, 4, 4, 24);
  g.fillStyle = '#553418';
  g.fillRect(1, 6, 2, 18);
  g.fillRect(61, 6, 2, 18);

  // Wooden legs (visible at bottom corners)
  g.fillStyle = '#3a2010';
  g.fillRect(1, 28, 3, 2);
  g.fillRect(60, 28, 3, 2);

  return makeTexture(c);
}

/** 32x32 round coffee table. */
export function createTableTexture(): THREE.CanvasTexture {
  const [c, g] = ctx2d(32, 32);
  g.clearRect(0, 0, 32, 32);

  // Shadow
  g.fillStyle = 'rgba(0,0,0,0.1)';
  pixelCircle(g, 16, 17, 10, 'rgba(0,0,0,0.1)');

  // Table surface (oval from top-down)
  pixelCircle(g, 16, 15, 9, '#6B4226');
  pixelCircle(g, 16, 15, 8, '#7B5236');
  pixelCircle(g, 16, 15, 6, '#856040');

  // Wood grain ring
  g.fillStyle = '#725030';
  for (let angle = 0; angle < 360; angle += 30) {
    const rad = (angle * Math.PI) / 180;
    const x = Math.round(16 + Math.cos(rad) * 5);
    const y = Math.round(15 + Math.sin(rad) * 5);
    g.fillRect(x, y, 1, 1);
  }

  // Center highlight
  g.fillStyle = 'rgba(255,255,255,0.08)';
  pixelCircle(g, 15, 13, 3, 'rgba(255,255,255,0.08)');

  // Magazine on table
  g.fillStyle = '#dd4444';
  g.fillRect(10, 12, 5, 6);
  g.fillStyle = '#ee5555';
  g.fillRect(11, 13, 3, 1);

  return makeTexture(c);
}

/** Whiteboard with scribbles. */
export function createWhiteboardTexture(): THREE.CanvasTexture {
  const [c, g] = ctx2d(32, 32);
  g.clearRect(0, 0, 32, 32);

  // Board frame
  g.fillStyle = '#aaaaaa';
  g.fillRect(1, 1, 30, 30);

  // White surface
  g.fillStyle = '#f0f0f0';
  g.fillRect(3, 3, 26, 26);

  // Scribble lines (marker)
  g.fillStyle = '#2255cc';
  g.fillRect(5, 6, 14, 1);
  g.fillRect(5, 8, 10, 1);
  g.fillRect(5, 10, 18, 1);

  g.fillStyle = '#cc2233';
  g.fillRect(5, 14, 12, 1);
  g.fillRect(5, 16, 8, 1);

  g.fillStyle = '#22aa44';
  g.fillRect(5, 20, 16, 1);
  g.fillRect(5, 22, 11, 1);

  // Box drawn around something
  g.fillStyle = '#ff6600';
  g.fillRect(20, 14, 6, 1);
  g.fillRect(20, 20, 6, 1);
  g.fillRect(20, 14, 1, 7);
  g.fillRect(25, 14, 1, 7);

  // Marker tray at bottom
  g.fillStyle = '#888888';
  g.fillRect(3, 28, 26, 2);
  // Markers
  g.fillStyle = '#2255cc';
  g.fillRect(6, 28, 3, 1);
  g.fillStyle = '#cc2233';
  g.fillRect(11, 28, 3, 1);
  g.fillStyle = '#222222';
  g.fillRect(16, 28, 3, 1);

  return makeTexture(c);
}

/** 32x32 bookshelf from top-down (book spines visible). */
export function createBookshelfTexture(): THREE.CanvasTexture {
  const [c, g] = ctx2d(32, 32);

  // Shelf frame (dark wood)
  g.fillStyle = '#4a3020';
  g.fillRect(0, 0, 32, 32);

  // Shelf interior
  g.fillStyle = '#5a3828';
  g.fillRect(2, 2, 28, 28);

  // Book spines (top row)
  const colors = ['#cc3333', '#3366cc', '#339944', '#cc9933', '#9933cc', '#cc6633', '#3399cc', '#666666'];
  let x = 3;
  for (let i = 0; i < 8; i++) {
    const w = 2 + (i % 3);
    g.fillStyle = colors[i];
    g.fillRect(x, 3, w, 12);
    // Spine detail
    g.fillStyle = 'rgba(255,255,255,0.15)';
    g.fillRect(x, 3, w, 1);
    g.fillStyle = 'rgba(0,0,0,0.15)';
    g.fillRect(x, 14, w, 1);
    x += w + 1;
    if (x > 27) break;
  }

  // Bottom shelf books (different arrangement)
  x = 3;
  const colors2 = ['#996633', '#336699', '#993366', '#669933', '#cc6600', '#663399', '#339966'];
  for (let i = 0; i < 7; i++) {
    const w = 2 + ((i + 1) % 3);
    g.fillStyle = colors2[i];
    g.fillRect(x, 17, w, 12);
    g.fillStyle = 'rgba(255,255,255,0.15)';
    g.fillRect(x, 17, w, 1);
    g.fillStyle = 'rgba(0,0,0,0.15)';
    g.fillRect(x, 28, w, 1);
    x += w + 1;
    if (x > 27) break;
  }

  // Shelf divider
  g.fillStyle = '#4a3020';
  g.fillRect(2, 15, 28, 2);

  return makeTexture(c);
}

/** 32x32 water cooler. */
export function createWaterCoolerTexture(): THREE.CanvasTexture {
  const [c, g] = ctx2d(32, 32);
  g.clearRect(0, 0, 32, 32);

  // Shadow
  g.fillStyle = 'rgba(0,0,0,0.1)';
  g.fillRect(8, 28, 16, 3);

  // Base unit
  g.fillStyle = '#e0e0e0';
  g.fillRect(8, 14, 16, 16);
  g.fillStyle = '#cccccc';
  g.fillRect(9, 15, 14, 14);

  // Water bottle on top (blue)
  g.fillStyle = '#5599dd';
  g.fillRect(11, 2, 10, 14);
  g.fillStyle = '#66aaee';
  g.fillRect(12, 3, 8, 10);
  // Water level line
  g.fillStyle = '#4488cc';
  g.fillRect(12, 8, 8, 1);
  // Bottle cap
  g.fillStyle = '#dddddd';
  g.fillRect(13, 1, 6, 2);

  // Tap buttons
  g.fillStyle = '#3399ff';
  g.fillRect(11, 20, 4, 3);
  g.fillStyle = '#ff4444';
  g.fillRect(17, 20, 4, 3);

  // Drip tray
  g.fillStyle = '#999999';
  g.fillRect(10, 26, 12, 2);

  // Cup stack beside cooler
  g.fillStyle = '#ffffff';
  g.fillRect(25, 20, 5, 3);
  g.fillRect(26, 18, 3, 2);

  return makeTexture(c);
}

/** 16x16 small trash can. */
export function createTrashCanTexture(): THREE.CanvasTexture {
  const [c, g] = ctx2d(16, 16);
  g.clearRect(0, 0, 16, 16);

  // Shadow
  g.fillStyle = 'rgba(0,0,0,0.1)';
  pixelCircle(g, 8, 10, 4, 'rgba(0,0,0,0.1)');

  // Can body
  g.fillStyle = '#555566';
  g.fillRect(4, 4, 8, 9);
  g.fillRect(5, 3, 6, 1);
  g.fillRect(5, 13, 6, 1);

  // Rim
  g.fillStyle = '#666677';
  g.fillRect(4, 3, 8, 2);

  // Highlight
  g.fillStyle = '#6a6a7a';
  g.fillRect(5, 5, 2, 7);

  // Trash visible
  g.fillStyle = '#ffffff';
  g.fillRect(6, 4, 2, 1);
  g.fillStyle = '#f5e642';
  g.fillRect(9, 5, 1, 1);

  return makeTexture(c);
}

/** Decorative rug (warm colours). */
export function createRugTexture(): THREE.CanvasTexture {
  const [c, g] = ctx2d(64, 32);

  // Rug body
  g.fillStyle = '#8b5e3c';
  g.fillRect(0, 0, 64, 32);

  // Border pattern
  g.fillStyle = '#a06b40';
  g.fillRect(2, 2, 60, 28);

  // Inner border
  g.fillStyle = '#704828';
  g.fillRect(2, 2, 60, 2);
  g.fillRect(2, 28, 60, 2);
  g.fillRect(2, 2, 2, 28);
  g.fillRect(60, 2, 2, 28);

  // Centre pattern (diamond)
  g.fillStyle = '#c08850';
  g.fillRect(28, 12, 8, 8);
  g.fillStyle = '#8b5e3c';
  g.fillRect(30, 14, 4, 4);

  // Geometric repeating pattern
  g.fillStyle = '#704828';
  for (let x = 10; x < 54; x += 8) {
    g.fillRect(x, 8, 2, 2);
    g.fillRect(x, 22, 2, 2);
  }
  for (let y = 10; y < 22; y += 6) {
    g.fillRect(6, y, 2, 2);
    g.fillRect(56, y, 2, 2);
  }

  // Fringe on short edges
  g.fillStyle = '#a06b40';
  for (let x = 4; x < 60; x += 3) {
    g.fillRect(x, 0, 1, 2);
    g.fillRect(x, 30, 1, 2);
  }

  return makeTexture(c);
}

/** "PIXEL OFFICE" neon sign for the wall. */
export function createSignTexture(): THREE.CanvasTexture {
  const [c, g] = ctx2d(128, 24);

  // Sign backing
  g.fillStyle = '#1a1a2e';
  g.fillRect(0, 0, 128, 24);

  // Neon border glow (bright for bloom)
  g.fillStyle = 'rgba(0,255,255,0.25)';
  g.fillRect(0, 0, 128, 24);

  // Sharp border (extra bright for bloom threshold)
  g.fillStyle = '#44ffff';
  g.fillRect(0, 0, 128, 2);
  g.fillRect(0, 22, 128, 2);
  g.fillRect(0, 0, 2, 24);
  g.fillRect(126, 0, 2, 24);

  // Inner glow
  g.fillStyle = 'rgba(0,255,255,0.15)';
  g.fillRect(3, 3, 122, 18);

  // Text (super bright for bloom)
  g.fillStyle = '#88ffff';
  g.font = 'bold 14px monospace';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillText('PIXEL OFFICE', 64, 13);

  // Glow behind text
  g.globalCompositeOperation = 'destination-over';
  g.fillStyle = 'rgba(0,255,255,0.35)';
  g.fillRect(20, 4, 88, 16);
  g.globalCompositeOperation = 'source-over';

  return makeTexture(c);
}

/** 32x32 printer / copier. */
export function createPrinterTexture(): THREE.CanvasTexture {
  const [c, g] = ctx2d(32, 32);
  g.clearRect(0, 0, 32, 32);

  // Shadow
  g.fillStyle = 'rgba(0,0,0,0.1)';
  g.fillRect(4, 26, 24, 4);

  // Body
  g.fillStyle = '#e8e8e8';
  g.fillRect(3, 8, 26, 18);

  // Top paper tray
  g.fillStyle = '#d0d0d0';
  g.fillRect(5, 4, 22, 6);
  g.fillStyle = '#ffffff';
  g.fillRect(7, 5, 18, 4);

  // Paper output slot
  g.fillStyle = '#333333';
  g.fillRect(6, 14, 20, 2);

  // Paper coming out
  g.fillStyle = '#ffffff';
  g.fillRect(8, 13, 16, 2);

  // Control panel
  g.fillStyle = '#333344';
  g.fillRect(18, 18, 8, 4);
  // Small screen
  g.fillStyle = '#00aa44';
  g.fillRect(19, 19, 4, 2);
  // Button
  g.fillStyle = '#44dd44';
  g.fillRect(24, 19, 1, 1);

  // Brand stripe
  g.fillStyle = '#3366cc';
  g.fillRect(3, 8, 26, 1);

  return makeTexture(c);
}

/** 32x32 filing cabinet. */
export function createFileCabinetTexture(): THREE.CanvasTexture {
  const [c, g] = ctx2d(32, 32);
  g.clearRect(0, 0, 32, 32);

  // Shadow
  g.fillStyle = 'rgba(0,0,0,0.1)';
  g.fillRect(5, 28, 22, 3);

  // Cabinet body
  g.fillStyle = '#888899';
  g.fillRect(4, 2, 24, 28);

  // Top drawer
  g.fillStyle = '#9999aa';
  g.fillRect(6, 4, 20, 12);
  g.fillStyle = '#aaaabb';
  g.fillRect(7, 5, 18, 10);
  // Handle
  g.fillStyle = '#cccccc';
  g.fillRect(14, 9, 4, 2);
  // Label
  g.fillStyle = '#ffffff';
  g.fillRect(9, 6, 6, 3);

  // Bottom drawer
  g.fillStyle = '#9999aa';
  g.fillRect(6, 18, 20, 10);
  g.fillStyle = '#aaaabb';
  g.fillRect(7, 19, 18, 8);
  // Handle
  g.fillStyle = '#cccccc';
  g.fillRect(14, 22, 4, 2);
  // Label
  g.fillStyle = '#ffffff';
  g.fillRect(9, 20, 6, 3);

  // Drawer gap line
  g.fillStyle = '#777788';
  g.fillRect(6, 16, 20, 2);

  return makeTexture(c);
}

// ═══════════════════════════════════════════════════════════
//  AGENT SPRITES
// ═══════════════════════════════════════════════════════════

/** 32x32 top-down chibi agent with body detail. */
export function createAgentTexture(hairColor: string, outfitColor: string): THREE.CanvasTexture {
  const [c, g] = ctx2d(32, 32);
  g.clearRect(0, 0, 32, 32);

  // Ground shadow
  g.fillStyle = 'rgba(0,0,0,0.15)';
  g.fillRect(8, 25, 16, 4);
  g.fillRect(9, 29, 14, 2);
  g.fillRect(10, 27, 12, 1);

  // Feet / shoes
  g.fillStyle = '#2a2a2a';
  g.fillRect(10, 24, 4, 3);
  g.fillRect(18, 24, 4, 3);

  // Body / outfit
  g.fillStyle = outfitColor;
  g.fillRect(9, 14, 14, 11);
  g.fillRect(10, 13, 12, 1);

  // Outfit shading (darker sides)
  g.fillStyle = 'rgba(0,0,0,0.15)';
  g.fillRect(9, 14, 2, 11);
  g.fillRect(21, 14, 2, 11);

  // Outfit highlight (center)
  g.fillStyle = 'rgba(255,255,255,0.1)';
  g.fillRect(13, 14, 6, 8);

  // Collar / neckline
  g.fillStyle = 'rgba(255,255,255,0.2)';
  g.fillRect(13, 13, 6, 1);

  // Arms
  g.fillStyle = outfitColor;
  g.fillRect(6, 15, 3, 8);
  g.fillRect(23, 15, 3, 8);
  // Arm shading
  g.fillStyle = 'rgba(0,0,0,0.12)';
  g.fillRect(6, 15, 1, 8);
  g.fillRect(25, 15, 1, 8);

  // Hands (skin tone)
  g.fillStyle = '#f0c8a0';
  g.fillRect(6, 22, 3, 2);
  g.fillRect(23, 22, 3, 2);

  // Head / face (skin)
  g.fillStyle = '#f5d0a8';
  g.fillRect(10, 6, 12, 8);
  g.fillRect(11, 5, 10, 1);
  g.fillRect(11, 14, 10, 1);

  // Cheek blush
  g.fillStyle = '#f0a8a0';
  g.fillRect(10, 10, 2, 2);
  g.fillRect(20, 10, 2, 2);

  // Eyes
  g.fillStyle = '#222222';
  g.fillRect(12, 9, 2, 2);
  g.fillRect(18, 9, 2, 2);
  // Eye highlight
  g.fillStyle = '#ffffff';
  g.fillRect(12, 9, 1, 1);
  g.fillRect(18, 9, 1, 1);

  // Mouth (small smile)
  g.fillStyle = '#cc8888';
  g.fillRect(14, 12, 4, 1);

  // Hair — main volume
  g.fillStyle = hairColor;
  g.fillRect(9, 2, 14, 7);
  g.fillRect(10, 1, 12, 1);
  // Hair sides
  g.fillRect(8, 4, 2, 6);
  g.fillRect(22, 4, 2, 6);

  // Hair highlight
  g.fillStyle = 'rgba(255,255,255,0.12)';
  g.fillRect(12, 2, 4, 3);

  // Hair shadow
  g.fillStyle = 'rgba(0,0,0,0.1)';
  g.fillRect(9, 8, 14, 1);

  return makeTexture(c);
}
