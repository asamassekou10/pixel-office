import { CSSColors } from '../design/tokens.js';

/**
 * Gear icon button in the HUD that toggles the control panel.
 */
export class ControlPanelToggle {
  private button: HTMLButtonElement;
  private active = false;
  onClick: (() => void) | null = null;

  constructor(parent: HTMLElement) {
    this.button = document.createElement('button');
    this.button.style.cssText = `
      margin-top:8px;padding:4px 8px;
      background:none;border:1px solid ${CSSColors.UI.BorderDim};
      border-radius:3px;color:${CSSColors.UI.TextDim};
      font-size:14px;cursor:pointer;
      transition:all 0.15s;
      pointer-events:auto;
    `;
    this.button.textContent = '\u2699 Panel';
    this.button.addEventListener('click', () => {
      if (this.onClick) this.onClick();
    });
    this.button.addEventListener('mouseenter', () => {
      if (!this.active) {
        this.button.style.borderColor = CSSColors.Neon.Cyan;
        this.button.style.color = CSSColors.Neon.Cyan;
      }
    });
    this.button.addEventListener('mouseleave', () => {
      if (!this.active) {
        this.button.style.borderColor = CSSColors.UI.BorderDim;
        this.button.style.color = CSSColors.UI.TextDim;
      }
    });

    parent.appendChild(this.button);
  }

  setActive(isActive: boolean): void {
    this.active = isActive;
    if (isActive) {
      this.button.style.borderColor = CSSColors.Neon.Cyan;
      this.button.style.color = CSSColors.Neon.Cyan;
      this.button.style.textShadow = `0 0 6px ${CSSColors.Neon.Cyan}`;
    } else {
      this.button.style.borderColor = CSSColors.UI.BorderDim;
      this.button.style.color = CSSColors.UI.TextDim;
      this.button.style.textShadow = 'none';
    }
  }
}
