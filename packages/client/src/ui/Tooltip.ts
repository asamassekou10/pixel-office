import type { IAgent } from '@pixel-office/shared';
import { CSSColors } from '../design/tokens.js';

/**
 * Lightweight HTML tooltip following cursor on agent hover.
 * Shows agent name + current state with cyberpunk styling.
 */
export class Tooltip {
  private element: HTMLDivElement;
  private visible = false;

  constructor() {
    this.element = document.getElementById('tooltip') as HTMLDivElement;
    if (!this.element) {
      this.element = document.createElement('div');
      this.element.id = 'tooltip';
      document.getElementById('ui-overlay')?.appendChild(this.element);
    }

    this.element.style.cssText = `
      position: fixed;
      display: none;
      padding: 4px 8px;
      background: rgba(10, 10, 15, 0.9);
      border: 1px solid ${CSSColors.Neon.Cyan};
      border-radius: 3px;
      font-family: 'Courier New', monospace;
      font-size: 11px;
      color: #ffffff;
      pointer-events: none;
      z-index: 100;
      white-space: nowrap;
      box-shadow: 0 0 8px rgba(0, 217, 255, 0.3);
    `;

    window.addEventListener('pointermove', this.onMove);
  }

  show(agent: IAgent): void {
    const stateKey = agent.state.charAt(0) + agent.state.slice(1).toLowerCase() as keyof typeof CSSColors.States;
    const stateColor = CSSColors.States[stateKey] || CSSColors.Neon.Cyan;
    this.element.innerHTML = `
      <span style="text-shadow: 0 0 4px ${stateColor};">${agent.id}</span>
      <span style="color:${stateColor};margin-left:6px;">${agent.state}</span>
    `;
    this.element.style.display = 'block';
    this.visible = true;
  }

  hide(): void {
    this.element.style.display = 'none';
    this.visible = false;
  }

  private onMove = (e: PointerEvent): void => {
    if (!this.visible) return;
    this.element.style.left = `${e.clientX + 12}px`;
    this.element.style.top = `${e.clientY + 12}px`;
  };

  dispose(): void {
    window.removeEventListener('pointermove', this.onMove);
  }
}
