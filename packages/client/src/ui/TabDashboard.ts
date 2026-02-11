import type { IAgent } from '@pixel-office/shared';
import { CSSColors } from '../design/tokens.js';

/**
 * Dashboard tab: agent stats overview with state breakdown and job distribution.
 */
export class TabDashboard {
  readonly element: HTMLDivElement;

  constructor() {
    this.element = document.createElement('div');
    this.element.style.cssText = 'padding: 16px;';
    this.render([]);
  }

  update(agents: IAgent[]): void {
    this.render(agents);
  }

  private render(agents: IAgent[]): void {
    const total = agents.length;
    const idle = agents.filter(a => a.state === 'IDLE').length;
    const working = agents.filter(a => a.state === 'WORKING').length;
    const moving = agents.filter(a => a.state === 'MOVING').length;
    const error = agents.filter(a => a.state === 'ERROR').length;

    // Job type distribution
    const jobs: Record<string, number> = {};
    for (const a of agents) {
      const jt = a.jobType || 'unassigned';
      jobs[jt] = (jobs[jt] || 0) + 1;
    }
    const jobEntries = Object.entries(jobs).sort((a, b) => b[1] - a[1]);

    this.element.innerHTML = `
      <div style="text-align:center;margin-bottom:20px;">
        <div style="font-size:40px;color:${CSSColors.Neon.Cyan};text-shadow:0 0 20px ${CSSColors.Neon.Cyan};font-family:'Courier New',monospace;">
          ${total}
        </div>
        <div style="font-size:10px;color:${CSSColors.UI.TextDim};text-transform:uppercase;letter-spacing:2px;">
          Total Agents
        </div>
      </div>

      <div style="font-size:10px;color:${CSSColors.UI.TextDim};text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">
        State Breakdown
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:20px;">
        ${this.statCard('IDLE', idle, CSSColors.States.Idle)}
        ${this.statCard('WORKING', working, CSSColors.States.Working)}
        ${this.statCard('MOVING', moving, CSSColors.States.Moving)}
        ${this.statCard('ERROR', error, CSSColors.States.Error)}
      </div>

      ${jobEntries.length > 0 ? `
        <div style="font-size:10px;color:${CSSColors.UI.TextDim};text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">
          Job Types
        </div>
        <div style="display:flex;flex-direction:column;gap:4px;">
          ${jobEntries.map(([name, count]) => `
            <div style="display:flex;justify-content:space-between;padding:4px 8px;background:${CSSColors.Background.Secondary};border-radius:3px;font-size:11px;font-family:'Courier New',monospace;">
              <span style="color:${CSSColors.UI.TextGlow};">${name}</span>
              <span style="color:${CSSColors.Neon.Cyan};">${count}</span>
            </div>
          `).join('')}
        </div>
      ` : ''}
    `;
  }

  private statCard(label: string, count: number, color: string): string {
    return `
      <div style="
        padding:12px;
        background:${CSSColors.Background.Secondary};
        border:1px solid ${color}40;
        border-radius:3px;
        text-align:center;
        box-shadow:0 0 8px ${color}20;
      ">
        <div style="font-size:24px;color:${color};text-shadow:0 0 8px ${color};font-family:'Courier New',monospace;">
          ${count}
        </div>
        <div style="font-size:9px;color:${CSSColors.UI.TextDim};text-transform:uppercase;letter-spacing:1px;">
          ${label}
        </div>
      </div>
    `;
  }
}
