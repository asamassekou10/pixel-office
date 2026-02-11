import { CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import type { IAgent } from '@pixel-office/shared';
import { AgentState } from '@pixel-office/shared';
import { CSSColors } from '../design/tokens.js';

const STATE_CSS_COLORS: Record<AgentState, string> = {
  [AgentState.IDLE]: CSSColors.States.Idle,
  [AgentState.WORKING]: CSSColors.States.Working,
  [AgentState.MOVING]: CSSColors.States.Moving,
  [AgentState.ERROR]: CSSColors.States.Error,
};

const JOB_ICONS: Record<string, string> = {
  'developer': '&lt;/&gt;',
  'analyst': '\u2593',
  'designer': '\u25C6',
  'manager': '\u2606',
  'tester': '\u2714',
  'devops': '\u2699',
};

/** Creates a CSS2D nameplate for an agent. */
export function createNameplate(agent: IAgent): CSS2DObject {
  const div = document.createElement('div');
  div.className = 'agent-nameplate';
  div.style.cssText = `
    font-family: 'Courier New', monospace;
    font-size: 11px;
    color: #ffffff;
    text-align: center;
    pointer-events: none;
    white-space: nowrap;
  `;
  updateNameplateContent(div, agent);

  const label = new CSS2DObject(div);
  label.position.set(0, 2.5, 0);
  return label;
}

/** Update the nameplate content with current agent data. */
export function updateNameplate(label: CSS2DObject, agent: IAgent): void {
  updateNameplateContent(label.element, agent);
}

function updateNameplateContent(div: HTMLElement, agent: IAgent): void {
  const neonColor = STATE_CSS_COLORS[agent.state];
  const statusText = agent.currentTask?.name || agent.state;
  const progress = agent.currentTask?.progress ?? 0;

  // Job type icon
  const jobIcon = agent.jobType ? (JOB_ICONS[agent.jobType] || '\u25CF') : '';
  const jobBadge = jobIcon
    ? `<span style="font-size:8px;color:${neonColor};margin-left:3px;" title="${agent.jobType}">${jobIcon}</span>`
    : '';

  // Metrics line
  const metrics = agent.metrics;
  const metricsLine = metrics
    ? `<div style="font-size:8px;color:#8892b0;margin-top:1px;">` +
      `\u2714${metrics.tasksCompleted} ` +
      `${metrics.successRate}%` +
      `</div>`
    : '';

  // Skills badges (show max 3)
  const skills = agent.skills?.slice(0, 3) || [];
  const skillsLine = skills.length > 0
    ? `<div style="font-size:7px;color:#8892b0;margin-top:1px;">${skills.map(s =>
        `<span style="background:rgba(0,217,255,0.15);padding:0 2px;border-radius:1px;margin:0 1px;">${s}</span>`
      ).join('')}</div>`
    : '';

  div.innerHTML = `
    <div style="text-shadow: 0 0 6px ${neonColor}; margin-bottom: 2px;">${agent.id}${jobBadge}</div>
    <div style="font-size: 9px; color: ${neonColor};">${statusText}</div>
    ${agent.currentTask ? `
      <div style="width: 50px; height: 3px; background: #1a1a2e; margin: 2px auto 0; border-radius: 1px;">
        <div style="width: ${progress}%; height: 100%; background: ${neonColor}; border-radius: 1px; transition: width 0.3s ease;"></div>
      </div>
    ` : ''}
    ${metricsLine}
    ${skillsLine}
  `;
}
