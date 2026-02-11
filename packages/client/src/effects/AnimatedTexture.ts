import * as THREE from 'three';

/**
 * Base class for canvas textures that update over time.
 * Redraws at a configurable interval to animate monitor screens, signs, etc.
 */
export class AnimatedTexture {
  public readonly texture: THREE.CanvasTexture;
  protected canvas: HTMLCanvasElement;
  protected ctx: CanvasRenderingContext2D;

  private interval: number;
  private elapsed = 0;
  private drawFn: (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, frame: number) => void;
  private frame = 0;

  constructor(
    width: number,
    height: number,
    intervalMs: number,
    drawFn: (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, frame: number) => void,
  ) {
    this.canvas = document.createElement('canvas');
    this.canvas.width = width;
    this.canvas.height = height;
    this.ctx = this.canvas.getContext('2d')!;
    this.ctx.imageSmoothingEnabled = false;

    this.interval = intervalMs / 1000; // convert to seconds
    this.drawFn = drawFn;

    // Initial draw
    this.drawFn(this.ctx, this.canvas, 0);

    this.texture = new THREE.CanvasTexture(this.canvas);
    this.texture.magFilter = THREE.NearestFilter;
    this.texture.minFilter = THREE.NearestFilter;
    this.texture.colorSpace = THREE.SRGBColorSpace;
  }

  update(delta: number): void {
    this.elapsed += delta;
    if (this.elapsed >= this.interval) {
      this.elapsed -= this.interval;
      this.frame++;
      this.drawFn(this.ctx, this.canvas, this.frame);
      this.texture.needsUpdate = true;
    }
  }

  dispose(): void {
    this.texture.dispose();
  }
}

/**
 * Animated monitor screen showing scrolling code + blinking cursor.
 */
export function createAnimatedMonitor(): AnimatedTexture {
  const codeColors = ['#79c0ff', '#ff7b72', '#7ee787', '#d2a8ff', '#ffa657', '#79c0ff'];
  const codeWidths = [12, 8, 16, 10, 14, 6, 18, 9, 11, 15, 7, 13];

  return new AnimatedTexture(32, 32, 400, (ctx, _canvas, frame) => {
    ctx.clearRect(0, 0, 32, 32);

    // Monitor shadow
    ctx.fillStyle = 'rgba(0,0,0,0.12)';
    ctx.fillRect(3, 5, 26, 22);

    // Monitor bezel
    ctx.fillStyle = '#1a1a2a';
    ctx.fillRect(2, 2, 28, 22);

    // Screen area
    ctx.fillStyle = '#0d1117';
    ctx.fillRect(4, 4, 24, 18);

    // Scrolling code lines
    const scrollOffset = frame % 4;
    for (let line = 0; line < 8; line++) {
      const lineIdx = (line + Math.floor(frame / 4)) % 12;
      const y = 4 + line * 2 - scrollOffset * 0.5;
      if (y < 4 || y > 20) continue;
      const indent = (lineIdx % 3 === 0) ? 3 : (lineIdx % 5 === 0) ? 6 : 0;
      const width = Math.min(codeWidths[lineIdx], 22 - indent);
      ctx.fillStyle = codeColors[lineIdx % codeColors.length];
      ctx.fillRect(5 + indent, y, width, 1);
    }

    // Blinking cursor
    if (frame % 3 !== 0) {
      ctx.fillStyle = '#e6edf3';
      ctx.fillRect(5, 19, 1, 1);
    }

    // Occasional glitch frame
    if (frame % 17 === 0) {
      ctx.fillStyle = 'rgba(0,255,255,0.15)';
      ctx.fillRect(4, 8 + (frame % 5) * 2, 24, 2);
    }

    // Power LED
    ctx.fillStyle = '#66ff99';
    ctx.fillRect(15, 23, 2, 1);

    // Stand
    ctx.fillStyle = '#2a2a3a';
    ctx.fillRect(13, 24, 6, 2);
    ctx.fillStyle = '#222233';
    ctx.fillRect(11, 26, 10, 2);

    // Screen edge glow
    ctx.fillStyle = 'rgba(0,220,255,0.2)';
    ctx.fillRect(3, 3, 26, 1);
    ctx.fillRect(3, 21, 26, 1);
  });
}

/**
 * Animated neon sign with pulsing glow and occasional flicker.
 */
export function createAnimatedSign(): AnimatedTexture {
  return new AnimatedTexture(128, 24, 300, (ctx, _canvas, frame) => {
    // Flicker: occasionally dim
    const flicker = (frame % 13 === 0) ? 0.5 : 1.0;
    const pulse = 0.8 + Math.sin(frame * 0.3) * 0.2;
    const brightness = flicker * pulse;

    ctx.clearRect(0, 0, 128, 24);

    // Sign backing
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, 128, 24);

    // Neon border glow
    ctx.globalAlpha = brightness;
    ctx.fillStyle = `rgba(0,255,255,0.25)`;
    ctx.fillRect(0, 0, 128, 24);

    // Sharp border
    ctx.fillStyle = '#44ffff';
    ctx.fillRect(0, 0, 128, 2);
    ctx.fillRect(0, 22, 128, 2);
    ctx.fillRect(0, 0, 2, 24);
    ctx.fillRect(126, 0, 2, 24);

    // Inner glow
    ctx.fillStyle = 'rgba(0,255,255,0.15)';
    ctx.fillRect(3, 3, 122, 18);

    // Text
    ctx.fillStyle = '#88ffff';
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('PIXEL OFFICE', 64, 13);

    ctx.globalAlpha = 1.0;

    // Glow behind text
    ctx.globalCompositeOperation = 'destination-over';
    ctx.fillStyle = `rgba(0,255,255,${0.35 * brightness})`;
    ctx.fillRect(20, 4, 88, 16);
    ctx.globalCompositeOperation = 'source-over';
  });
}
