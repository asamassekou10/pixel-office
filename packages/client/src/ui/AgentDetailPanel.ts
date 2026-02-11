import type { IAgent } from '@pixel-office/shared';
import { CSSColors } from '../design/tokens.js';

/**
 * Slide-in detail panel for viewing full agent data.
 * Shows on agent click, hides on background click or close button.
 */
export class AgentDetailPanel {
  private panel: HTMLDivElement;
  private contentDiv: HTMLDivElement;
  private closeBtn: HTMLButtonElement;
  public onConnectionClick: ((agentId: string) => void) | null = null;

  constructor() {
    this.panel = document.getElementById('agent-detail-panel') as HTMLDivElement;
    if (!this.panel) {
      this.panel = document.createElement('div');
      this.panel.id = 'agent-detail-panel';
      document.getElementById('ui-overlay')?.appendChild(this.panel);
    }

    this.panel.className = 'hidden';
    this.panel.style.cssText = `
      position: fixed;
      top: 0;
      right: 0;
      width: 300px;
      height: 100%;
      background: rgba(10, 10, 15, 0.95);
      border-left: 2px solid ${CSSColors.Neon.Cyan};
      font-family: 'Courier New', monospace;
      color: #ffffff;
      overflow-y: auto;
      z-index: 50;
      transform: translateX(100%);
      transition: transform 0.3s ease;
      pointer-events: auto;
      padding: 16px;
      box-shadow: -4px 0 20px rgba(0, 217, 255, 0.15);
    `;

    this.closeBtn = document.createElement('button');
    this.closeBtn.textContent = '\u2715';
    this.closeBtn.style.cssText = `
      position: absolute;
      top: 8px;
      right: 8px;
      background: none;
      border: 1px solid ${CSSColors.UI.BorderDim};
      color: ${CSSColors.UI.Text};
      font-size: 14px;
      cursor: pointer;
      padding: 2px 6px;
      font-family: monospace;
    `;
    this.closeBtn.addEventListener('click', () => this.hide());
    this.panel.appendChild(this.closeBtn);

    this.contentDiv = document.createElement('div');
    this.contentDiv.style.marginTop = '30px';
    this.panel.appendChild(this.contentDiv);
  }

  show(agent: IAgent): void {
    const stateKey = agent.state.charAt(0) + agent.state.slice(1).toLowerCase() as keyof typeof CSSColors.States;
    const stateColor = CSSColors.States[stateKey] || CSSColors.Neon.Cyan;
    const metrics = agent.metrics;
    const skills = agent.skills || [];
    const connections = agent.connections || [];

    this.contentDiv.innerHTML = `
      <div style="margin-bottom:16px;">
        <div style="font-size:16px;text-shadow:0 0 8px ${stateColor};margin-bottom:4px;">${agent.id}</div>
        <span style="display:inline-block;padding:2px 8px;background:${stateColor};color:#0a0a0f;font-size:10px;border-radius:2px;font-weight:bold;">${agent.state}</span>
        ${agent.jobType ? `<span style="margin-left:8px;color:${CSSColors.UI.TextDim};font-size:10px;">${agent.jobType}</span>` : ''}
      </div>

      ${agent.currentTask ? `
        <div style="margin-bottom:16px;padding:8px;border:1px solid ${CSSColors.UI.BorderDim};border-radius:3px;">
          <div style="font-size:9px;color:${CSSColors.UI.TextDim};margin-bottom:4px;">CURRENT TASK</div>
          <div style="font-size:12px;margin-bottom:6px;">${agent.currentTask.name}</div>
          <div style="width:100%;height:4px;background:${CSSColors.Background.Secondary};border-radius:2px;">
            <div style="width:${agent.currentTask.progress}%;height:100%;background:${stateColor};border-radius:2px;transition:width 0.3s;"></div>
          </div>
          <div style="font-size:9px;color:${CSSColors.UI.TextDim};margin-top:4px;">${agent.currentTask.progress}% complete</div>
          ${agent.currentTask.estimatedDuration ? `<div style="font-size:9px;color:${CSSColors.UI.TextDim};">Est: ${Math.round(agent.currentTask.estimatedDuration / 1000)}s</div>` : ''}
        </div>
      ` : ''}

      ${metrics ? `
        <div style="margin-bottom:16px;padding:8px;border:1px solid ${CSSColors.UI.BorderDim};border-radius:3px;">
          <div style="font-size:9px;color:${CSSColors.UI.TextDim};margin-bottom:6px;">METRICS</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;">
            <div>
              <div style="font-size:16px;color:${CSSColors.Neon.Cyan};">${metrics.tasksCompleted}</div>
              <div style="font-size:8px;color:${CSSColors.UI.TextDim};">completed</div>
            </div>
            <div>
              <div style="font-size:16px;color:${metrics.successRate > 80 ? CSSColors.Neon.Green : CSSColors.Neon.Orange};">${metrics.successRate}%</div>
              <div style="font-size:8px;color:${CSSColors.UI.TextDim};">success</div>
            </div>
            <div>
              <div style="font-size:16px;color:${CSSColors.UI.TextGlow};">${(metrics.averageTime / 1000).toFixed(1)}s</div>
              <div style="font-size:8px;color:${CSSColors.UI.TextDim};">avg time</div>
            </div>
            <div>
              <div style="font-size:16px;color:${CSSColors.UI.TextGlow};">${metrics.tasksInProgress}</div>
              <div style="font-size:8px;color:${CSSColors.UI.TextDim};">in progress</div>
            </div>
          </div>
        </div>
      ` : ''}

      ${skills.length > 0 ? `
        <div style="margin-bottom:16px;">
          <div style="font-size:9px;color:${CSSColors.UI.TextDim};margin-bottom:6px;">SKILLS</div>
          <div style="display:flex;flex-wrap:wrap;gap:4px;">
            ${skills.map(s => `<span style="padding:2px 6px;background:rgba(0,217,255,0.1);border:1px solid rgba(0,217,255,0.3);border-radius:2px;font-size:9px;">${s}</span>`).join('')}
          </div>
        </div>
      ` : ''}

      ${connections.length > 0 ? `
        <div style="margin-bottom:16px;">
          <div style="font-size:9px;color:${CSSColors.UI.TextDim};margin-bottom:6px;">CONNECTIONS</div>
          <div style="display:flex;flex-direction:column;gap:4px;">
            ${connections.map(id => `<span class="connection-link" data-agent-id="${id}" style="color:${CSSColors.Neon.Cyan};font-size:10px;cursor:pointer;text-decoration:underline;">${id}</span>`).join('')}
          </div>
        </div>
      ` : ''}
    `;

    // Wire up connection clicks
    this.contentDiv.querySelectorAll('.connection-link').forEach(el => {
      el.addEventListener('click', () => {
        const id = (el as HTMLElement).dataset.agentId;
        if (id && this.onConnectionClick) this.onConnectionClick(id);
      });
    });

    this.panel.classList.remove('hidden');
    this.panel.style.transform = 'translateX(0)';
  }

  hide(): void {
    this.panel.style.transform = 'translateX(100%)';
    setTimeout(() => this.panel.classList.add('hidden'), 300);
  }

  get isVisible(): boolean {
    return !this.panel.classList.contains('hidden');
  }
}
