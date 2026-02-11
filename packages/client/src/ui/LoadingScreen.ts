import { CSSColors } from '../design/tokens.js';

/**
 * Full-screen loading overlay with animated progress bar and typing title.
 * Fades out when the application signals ready.
 */
export class LoadingScreen {
  private overlay: HTMLDivElement;
  private progressBar: HTMLDivElement;
  private titleEl: HTMLDivElement;
  private typingIndex = 0;
  private typingTimer: number | null = null;
  private readonly title = 'PIXEL OFFICE';

  constructor() {
    this.overlay = document.getElementById('loading-screen') as HTMLDivElement;
    if (!this.overlay) {
      this.overlay = document.createElement('div');
      this.overlay.id = 'loading-screen';
      document.getElementById('ui-overlay')?.appendChild(this.overlay);
    }

    this.overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: #0a0a0f;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 200;
      pointer-events: auto;
      transition: opacity 0.8s ease;
    `;

    // Title with typing animation
    this.titleEl = document.createElement('div');
    this.titleEl.style.cssText = `
      font-family: 'Courier New', monospace;
      font-size: 28px;
      color: ${CSSColors.Neon.Cyan};
      text-shadow: 0 0 20px ${CSSColors.Neon.Cyan}, 0 0 40px rgba(0,217,255,0.3);
      margin-bottom: 30px;
      min-height: 34px;
      letter-spacing: 4px;
    `;
    this.titleEl.textContent = '';
    this.overlay.appendChild(this.titleEl);

    // Progress bar container
    const barContainer = document.createElement('div');
    barContainer.style.cssText = `
      width: 260px;
      height: 4px;
      background: ${CSSColors.Background.Secondary};
      border-radius: 2px;
      overflow: hidden;
      border: 1px solid ${CSSColors.UI.BorderDim};
    `;
    this.overlay.appendChild(barContainer);

    // Progress bar fill
    this.progressBar = document.createElement('div');
    this.progressBar.style.cssText = `
      width: 0%;
      height: 100%;
      background: ${CSSColors.Neon.Cyan};
      border-radius: 2px;
      transition: width 0.3s ease;
      box-shadow: 0 0 8px ${CSSColors.Neon.Cyan};
    `;
    barContainer.appendChild(this.progressBar);

    // Status text
    const status = document.createElement('div');
    status.style.cssText = `
      font-family: 'Courier New', monospace;
      font-size: 10px;
      color: ${CSSColors.UI.TextDim};
      margin-top: 12px;
    `;
    status.textContent = 'INITIALIZING SYSTEMS...';
    this.overlay.appendChild(status);

    // Start typing animation
    this.startTyping();

    // Auto-progress simulation
    this.simulateProgress();
  }

  private startTyping(): void {
    this.typingTimer = window.setInterval(() => {
      if (this.typingIndex <= this.title.length) {
        this.titleEl.textContent = this.title.slice(0, this.typingIndex) + (this.typingIndex < this.title.length ? '_' : '');
        this.typingIndex++;
      } else {
        // Blink cursor
        const hasCursor = this.titleEl.textContent!.endsWith('_');
        this.titleEl.textContent = this.title + (hasCursor ? '' : '_');
      }
    }, 120);
  }

  private simulateProgress(): void {
    let progress = 0;
    const interval = window.setInterval(() => {
      progress += 8 + Math.random() * 15;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        // Auto-hide after reaching 100%
        setTimeout(() => this.hide(), 400);
      }
      this.progressBar.style.width = `${progress}%`;
    }, 200);
  }

  hide(): void {
    if (this.typingTimer !== null) {
      clearInterval(this.typingTimer);
      this.typingTimer = null;
    }
    this.overlay.style.opacity = '0';
    setTimeout(() => {
      this.overlay.style.display = 'none';
      this.overlay.style.pointerEvents = 'none';
    }, 800);
  }
}
