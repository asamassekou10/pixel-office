import { NetworkManager, NetEvents } from '../network/NetworkManager.js';
import { CSSColors } from '../design/tokens.js';
import { ControlPanelToggle } from './ControlPanelToggle.js';

/**
 * HTML-based HUD overlay showing connection status and agent count.
 */
export class HUD {
  private container: HTMLElement;
  private statusDot!: HTMLElement;
  private statusText!: HTMLElement;
  private agentCountText!: HTMLElement;
  private titleText!: HTMLElement;
  private controlToggle!: ControlPanelToggle;

  private network: NetworkManager;
  private agentCount = 0;
  onControlPanelToggle: (() => void) | null = null;

  constructor() {
    this.container = document.getElementById('hud')!;
    this.network = NetworkManager.getInstance();

    this.createElements();
    this.bindEvents();
  }

  private createElements(): void {
    this.container.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      padding: 16px;
      pointer-events: none;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      font-family: 'Courier New', monospace;
      z-index: 10;
    `;

    // Left side: status + agent count
    const leftPanel = document.createElement('div');

    // Connection status
    const statusRow = document.createElement('div');
    statusRow.style.cssText = 'display: flex; align-items: center; gap: 8px; margin-bottom: 8px;';

    this.statusDot = document.createElement('div');
    this.statusDot.style.cssText = `
      width: 8px; height: 8px; border-radius: 50%;
      background: ${CSSColors.Neon.Orange};
      box-shadow: 0 0 6px ${CSSColors.Neon.Orange};
    `;

    this.statusText = document.createElement('div');
    this.statusText.style.cssText = `
      color: ${CSSColors.Neon.Orange};
      font-size: 12px;
      text-shadow: 0 0 4px ${CSSColors.Neon.Orange};
    `;
    this.statusText.textContent = 'CONNECTING...';

    statusRow.appendChild(this.statusDot);
    statusRow.appendChild(this.statusText);
    leftPanel.appendChild(statusRow);

    // Agent count
    this.agentCountText = document.createElement('div');
    this.agentCountText.style.cssText = `
      color: ${CSSColors.UI.TextDim};
      font-size: 12px;
    `;
    this.agentCountText.textContent = 'Agents: 0';
    leftPanel.appendChild(this.agentCountText);

    // Control panel toggle
    this.controlToggle = new ControlPanelToggle(leftPanel);
    this.controlToggle.onClick = () => {
      if (this.onControlPanelToggle) this.onControlPanelToggle();
    };

    this.container.appendChild(leftPanel);

    // Right side: title
    this.titleText = document.createElement('div');
    this.titleText.style.cssText = `
      color: ${CSSColors.Neon.Cyan};
      font-size: 20px;
      font-weight: bold;
      text-shadow: 0 0 10px ${CSSColors.Neon.Cyan}, 0 0 20px ${CSSColors.Neon.Cyan}40;
      letter-spacing: 4px;
    `;
    this.titleText.textContent = 'PIXEL OFFICE';
    this.container.appendChild(this.titleText);
  }

  private bindEvents(): void {
    this.network.on(NetEvents.CONNECTED, () => {
      this.statusDot.style.background = CSSColors.Neon.Green;
      this.statusDot.style.boxShadow = `0 0 6px ${CSSColors.Neon.Green}`;
      this.statusText.style.color = CSSColors.Neon.Green;
      this.statusText.style.textShadow = `0 0 4px ${CSSColors.Neon.Green}`;
      this.statusText.textContent = 'CONNECTED';
    });

    this.network.on(NetEvents.DISCONNECTED, () => {
      this.statusDot.style.background = CSSColors.Neon.Red;
      this.statusDot.style.boxShadow = `0 0 6px ${CSSColors.Neon.Red}`;
      this.statusText.style.color = CSSColors.Neon.Red;
      this.statusText.style.textShadow = `0 0 4px ${CSSColors.Neon.Red}`;
      this.statusText.textContent = 'DISCONNECTED';
    });
  }

  updateAgentCount(count: number): void {
    if (count !== this.agentCount) {
      this.agentCount = count;
      this.agentCountText.textContent = `Agents: ${count}`;
    }
  }

  updateControlPanelState(isOpen: boolean): void {
    this.controlToggle.setActive(isOpen);
  }
}
