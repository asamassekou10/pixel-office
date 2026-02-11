import type { IAgent } from '@pixel-office/shared';
import { CSSColors } from '../design/tokens.js';
import type { APIService } from '../services/APIService.js';
import { TabDashboard } from './TabDashboard.js';
import { TabManageAgents } from './TabManageAgents.js';
import { TabIntegration } from './TabIntegration.js';

type TabName = 'dashboard' | 'manage' | 'integrate';

/**
 * Left-side slide-in control panel with tabs:
 *   Dashboard | Manage | Integrate
 */
export class ControlPanel {
  private panel: HTMLDivElement;
  private tabButtons: Map<TabName, HTMLButtonElement> = new Map();
  private tabContents: Map<TabName, HTMLElement> = new Map();
  private currentTab: TabName = 'dashboard';
  private _visible = false;

  private dashboard: TabDashboard;
  private manage: TabManageAgents;
  private integration: TabIntegration;

  constructor(api: APIService) {
    this.panel = document.getElementById('control-panel') as HTMLDivElement;

    this.panel.style.cssText = `
      position:absolute;top:0;left:0;bottom:0;width:380px;
      background:${CSSColors.Background.Primary}f2;
      border-right:1px solid ${CSSColors.Neon.Cyan}40;
      box-shadow:4px 0 20px rgba(0,217,255,0.1);
      z-index:50;
      transform:translateX(-100%);
      transition:transform 0.3s ease;
      display:flex;flex-direction:column;
      font-family:'Courier New',monospace;
      overflow:hidden;
    `;

    // ── Header ──────────────────────────────────────────
    const header = document.createElement('div');
    header.style.cssText = `
      display:flex;justify-content:space-between;align-items:center;
      padding:16px;border-bottom:1px solid ${CSSColors.UI.BorderDim};
      flex-shrink:0;
    `;

    const title = document.createElement('div');
    title.style.cssText = `
      font-size:14px;color:${CSSColors.Neon.Cyan};
      text-shadow:0 0 8px ${CSSColors.Neon.Cyan};
      letter-spacing:2px;text-transform:uppercase;
    `;
    title.textContent = 'Control Panel';
    header.appendChild(title);

    const closeBtn = document.createElement('button');
    closeBtn.style.cssText = `
      background:none;border:none;color:${CSSColors.UI.TextDim};
      font-size:18px;cursor:pointer;padding:0 4px;
      transition:color 0.15s;
    `;
    closeBtn.textContent = '\u00D7';
    closeBtn.addEventListener('click', () => this.hide());
    closeBtn.addEventListener('mouseenter', () => { closeBtn.style.color = CSSColors.Neon.Cyan; });
    closeBtn.addEventListener('mouseleave', () => { closeBtn.style.color = CSSColors.UI.TextDim; });
    header.appendChild(closeBtn);

    this.panel.appendChild(header);

    // ── Tab bar ─────────────────────────────────────────
    const tabBar = document.createElement('div');
    tabBar.style.cssText = `
      display:flex;border-bottom:1px solid ${CSSColors.UI.BorderDim};
      flex-shrink:0;
    `;

    const tabs: { name: TabName; label: string }[] = [
      { name: 'dashboard', label: 'Dashboard' },
      { name: 'manage', label: 'Manage' },
      { name: 'integrate', label: 'Integrate' },
    ];

    for (const tab of tabs) {
      const btn = document.createElement('button');
      btn.style.cssText = `
        flex:1;padding:10px 8px;background:none;border:none;
        border-bottom:2px solid transparent;
        color:${CSSColors.UI.TextDim};
        font-family:'Courier New',monospace;font-size:11px;
        cursor:pointer;text-transform:uppercase;letter-spacing:1px;
        transition:all 0.15s;
      `;
      btn.textContent = tab.label;
      btn.addEventListener('click', () => this.switchTab(tab.name));
      tabBar.appendChild(btn);
      this.tabButtons.set(tab.name, btn);
    }

    this.panel.appendChild(tabBar);

    // ── Tab content ─────────────────────────────────────
    const contentArea = document.createElement('div');
    contentArea.style.cssText = 'flex:1;overflow-y:auto;position:relative;';

    this.dashboard = new TabDashboard();
    this.manage = new TabManageAgents(api);
    this.integration = new TabIntegration();

    this.tabContents.set('dashboard', this.dashboard.element);
    this.tabContents.set('manage', this.manage.element);
    this.tabContents.set('integrate', this.integration.element);

    for (const [, el] of this.tabContents) {
      el.style.display = 'none';
      contentArea.appendChild(el);
    }

    this.panel.appendChild(contentArea);

    // Activate default tab
    this.switchTab('dashboard');

    // Escape key to close
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this._visible) this.hide();
    });
  }

  private switchTab(name: TabName): void {
    this.currentTab = name;

    for (const [tabName, btn] of this.tabButtons) {
      const active = tabName === name;
      btn.style.borderBottomColor = active ? CSSColors.Neon.Cyan : 'transparent';
      btn.style.color = active ? CSSColors.Neon.Cyan : CSSColors.UI.TextDim;
      btn.style.textShadow = active ? `0 0 6px ${CSSColors.Neon.Cyan}` : 'none';
    }

    for (const [tabName, el] of this.tabContents) {
      el.style.display = tabName === name ? 'block' : 'none';
    }
  }

  show(): void {
    this._visible = true;
    this.panel.classList.remove('hidden');
    // Force reflow before transition
    void this.panel.offsetHeight;
    this.panel.style.transform = 'translateX(0)';
  }

  hide(): void {
    this._visible = false;
    this.panel.style.transform = 'translateX(-100%)';
    setTimeout(() => {
      if (!this._visible) this.panel.classList.add('hidden');
    }, 300);
  }

  toggle(): void {
    if (this._visible) this.hide();
    else this.show();
  }

  get isVisible(): boolean {
    return this._visible;
  }

  updateData(agents: IAgent[]): void {
    this.dashboard.update(agents);
    this.manage.update(agents);
  }
}
