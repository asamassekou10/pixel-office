import { AgentState, type IAgent } from '@pixel-office/shared';
import { CSSColors } from '../design/tokens.js';
import type { APIService } from '../services/APIService.js';

/**
 * Manage tab: agent list + CRUD form.
 */
export class TabManageAgents {
  readonly element: HTMLDivElement;
  private listDiv: HTMLDivElement;
  private formDiv: HTMLDivElement;
  private notifDiv: HTMLDivElement;

  private editingId: string | null = null;
  private agents: IAgent[] = [];
  private api: APIService;

  // Form inputs
  private idInput!: HTMLInputElement;
  private xInput!: HTMLInputElement;
  private yInput!: HTMLInputElement;
  private stateSelect!: HTMLSelectElement;
  private jobInput!: HTMLInputElement;
  private skillsInput!: HTMLInputElement;
  private connectionsInput!: HTMLInputElement;
  private deleteBtn!: HTMLButtonElement;

  constructor(api: APIService) {
    this.api = api;
    this.element = document.createElement('div');
    this.element.style.cssText = 'padding:16px;display:flex;flex-direction:column;height:100%;';

    // Agent list
    this.listDiv = document.createElement('div');
    this.listDiv.style.cssText = `
      flex:0 0 auto;max-height:200px;overflow-y:auto;margin-bottom:12px;
      border:1px solid ${CSSColors.UI.BorderDim};border-radius:3px;
    `;
    this.element.appendChild(this.listDiv);

    // Form
    this.formDiv = document.createElement('div');
    this.formDiv.style.cssText = 'flex:1 1 auto;overflow-y:auto;';
    this.element.appendChild(this.formDiv);

    // Notification area
    this.notifDiv = document.createElement('div');
    this.notifDiv.style.cssText = 'position:relative;min-height:0;';
    this.element.appendChild(this.notifDiv);

    this.buildForm();
    this.renderList();
  }

  update(agents: IAgent[]): void {
    this.agents = agents;
    this.renderList();
  }

  private renderList(): void {
    if (this.agents.length === 0) {
      this.listDiv.innerHTML = `
        <div style="padding:12px;text-align:center;color:${CSSColors.UI.TextDim};font-size:11px;font-family:'Courier New',monospace;">
          No agents connected
        </div>
      `;
      return;
    }

    this.listDiv.innerHTML = this.agents.map(a => {
      const stateKey = (a.state.charAt(0) + a.state.slice(1).toLowerCase()) as keyof typeof CSSColors.States;
      const color = CSSColors.States[stateKey] || CSSColors.Neon.Cyan;
      const selected = a.id === this.editingId;
      return `
        <div data-agent-id="${a.id}" style="
          display:flex;align-items:center;gap:8px;padding:6px 8px;
          cursor:pointer;font-size:11px;font-family:'Courier New',monospace;
          background:${selected ? CSSColors.Background.Accent : 'transparent'};
          border-bottom:1px solid ${CSSColors.UI.BorderDim}20;
        ">
          <span style="width:6px;height:6px;border-radius:50%;background:${color};box-shadow:0 0 4px ${color};flex-shrink:0;"></span>
          <span style="color:${CSSColors.UI.TextGlow};flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${a.id}</span>
          <span style="color:${color};font-size:9px;text-transform:uppercase;">${a.state}</span>
        </div>
      `;
    }).join('');

    // Bind click events
    this.listDiv.querySelectorAll('[data-agent-id]').forEach(el => {
      el.addEventListener('click', () => {
        const id = (el as HTMLElement).dataset.agentId!;
        this.loadAgent(id);
      });
    });
  }

  private buildForm(): void {
    const label = (text: string) => `
      <div style="font-size:9px;color:${CSSColors.UI.TextDim};text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;margin-top:10px;">
        ${text}
      </div>
    `;

    const inputStyle = `
      width:100%;padding:6px 8px;
      background:${CSSColors.Background.Secondary};
      border:1px solid ${CSSColors.UI.BorderDim};
      border-radius:3px;
      color:${CSSColors.UI.Text};
      font-family:'Courier New',monospace;font-size:11px;
      outline:none;
    `;

    this.formDiv.innerHTML = `
      <div style="font-size:10px;color:${CSSColors.UI.TextDim};text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">
        Agent Form
      </div>
      ${label('ID (required)')}
      <input data-field="id" style="${inputStyle}" placeholder="agent-001" />
      <div style="display:flex;gap:8px;">
        <div style="flex:1;">
          ${label('X (0-800)')}
          <input data-field="x" type="number" style="${inputStyle}" placeholder="400" />
        </div>
        <div style="flex:1;">
          ${label('Y (0-600)')}
          <input data-field="y" type="number" style="${inputStyle}" placeholder="300" />
        </div>
      </div>
      ${label('State')}
      <select data-field="state" style="${inputStyle}">
        <option value="IDLE">IDLE</option>
        <option value="WORKING">WORKING</option>
        <option value="MOVING">MOVING</option>
        <option value="ERROR">ERROR</option>
      </select>
      ${label('Job Type')}
      <input data-field="jobType" style="${inputStyle}" placeholder="python-dev" />
      ${label('Skills (comma-separated)')}
      <input data-field="skills" style="${inputStyle}" placeholder="python, fastapi, testing" />
      ${label('Connections (comma-separated IDs)')}
      <input data-field="connections" style="${inputStyle}" placeholder="agent-002, agent-003" />
      <div style="display:flex;gap:8px;margin-top:16px;">
        <button data-action="save" style="flex:1;"></button>
        <button data-action="delete" style="flex:1;display:none;"></button>
        <button data-action="clear" style="flex:1;"></button>
      </div>
    `;

    // Grab references
    this.idInput = this.formDiv.querySelector('[data-field="id"]')!;
    this.xInput = this.formDiv.querySelector('[data-field="x"]')!;
    this.yInput = this.formDiv.querySelector('[data-field="y"]')!;
    this.stateSelect = this.formDiv.querySelector('[data-field="state"]')!;
    this.jobInput = this.formDiv.querySelector('[data-field="jobType"]')!;
    this.skillsInput = this.formDiv.querySelector('[data-field="skills"]')!;
    this.connectionsInput = this.formDiv.querySelector('[data-field="connections"]')!;

    // Style buttons
    const btnStyle = `
      padding:8px 12px;border-radius:3px;
      font-family:'Courier New',monospace;font-size:11px;
      cursor:pointer;text-transform:uppercase;letter-spacing:1px;
      transition:all 0.15s;
    `;

    const saveBtn = this.formDiv.querySelector('[data-action="save"]') as HTMLButtonElement;
    saveBtn.style.cssText = `${btnStyle}background:transparent;border:1px solid ${CSSColors.Neon.Cyan};color:${CSSColors.Neon.Cyan};`;
    saveBtn.textContent = 'Save';
    saveBtn.addEventListener('click', () => this.onSave());
    saveBtn.addEventListener('mouseenter', () => {
      saveBtn.style.background = CSSColors.Neon.Cyan;
      saveBtn.style.color = CSSColors.Background.Primary;
    });
    saveBtn.addEventListener('mouseleave', () => {
      saveBtn.style.background = 'transparent';
      saveBtn.style.color = CSSColors.Neon.Cyan;
    });

    this.deleteBtn = this.formDiv.querySelector('[data-action="delete"]') as HTMLButtonElement;
    this.deleteBtn.style.cssText = `${btnStyle}background:transparent;border:1px solid ${CSSColors.Neon.Red};color:${CSSColors.Neon.Red};`;
    this.deleteBtn.textContent = 'Delete';
    this.deleteBtn.addEventListener('click', () => this.onDelete());
    this.deleteBtn.addEventListener('mouseenter', () => {
      this.deleteBtn.style.background = CSSColors.Neon.Red;
      this.deleteBtn.style.color = CSSColors.Background.Primary;
    });
    this.deleteBtn.addEventListener('mouseleave', () => {
      this.deleteBtn.style.background = 'transparent';
      this.deleteBtn.style.color = CSSColors.Neon.Red;
    });

    const clearBtn = this.formDiv.querySelector('[data-action="clear"]') as HTMLButtonElement;
    clearBtn.style.cssText = `${btnStyle}background:transparent;border:1px solid ${CSSColors.UI.BorderDim};color:${CSSColors.UI.TextDim};`;
    clearBtn.textContent = 'Clear';
    clearBtn.addEventListener('click', () => this.clearForm());
    clearBtn.addEventListener('mouseenter', () => {
      clearBtn.style.borderColor = CSSColors.UI.TextDim;
    });
    clearBtn.addEventListener('mouseleave', () => {
      clearBtn.style.borderColor = CSSColors.UI.BorderDim;
    });

    // Focus glow on inputs
    this.formDiv.querySelectorAll('input, select').forEach(el => {
      (el as HTMLElement).addEventListener('focus', () => {
        (el as HTMLElement).style.borderColor = CSSColors.Neon.Cyan;
        (el as HTMLElement).style.boxShadow = `0 0 6px ${CSSColors.Neon.Cyan}40`;
      });
      (el as HTMLElement).addEventListener('blur', () => {
        (el as HTMLElement).style.borderColor = CSSColors.UI.BorderDim;
        (el as HTMLElement).style.boxShadow = 'none';
      });
    });
  }

  private loadAgent(id: string): void {
    const agent = this.agents.find(a => a.id === id);
    if (!agent) return;

    this.editingId = id;
    this.idInput.value = agent.id;
    this.idInput.disabled = true;
    this.xInput.value = String(agent.x);
    this.yInput.value = String(agent.y);
    this.stateSelect.value = agent.state;
    this.jobInput.value = agent.jobType || '';
    this.skillsInput.value = (agent.skills || []).join(', ');
    this.connectionsInput.value = (agent.connections || []).join(', ');
    this.deleteBtn.style.display = 'block';
    this.renderList();
  }

  private clearForm(): void {
    this.editingId = null;
    this.idInput.value = '';
    this.idInput.disabled = false;
    this.xInput.value = '';
    this.yInput.value = '';
    this.stateSelect.value = 'IDLE';
    this.jobInput.value = '';
    this.skillsInput.value = '';
    this.connectionsInput.value = '';
    this.deleteBtn.style.display = 'none';
    this.renderList();
  }

  private async onSave(): Promise<void> {
    const id = this.idInput.value.trim();
    if (!id) {
      this.notify('ID is required', 'error');
      return;
    }

    const x = Number(this.xInput.value) || 0;
    const y = Number(this.yInput.value) || 0;
    const state = this.stateSelect.value as AgentState;
    const jobType = this.jobInput.value.trim() || undefined;
    const skills = this.skillsInput.value
      ? this.skillsInput.value.split(',').map(s => s.trim()).filter(Boolean)
      : undefined;
    const connections = this.connectionsInput.value
      ? this.connectionsInput.value.split(',').map(s => s.trim()).filter(Boolean)
      : undefined;

    try {
      await this.api.createAgent({ id, x, y, state, jobType, skills, connections });
      this.notify(`Agent "${id}" saved`, 'success');
      this.clearForm();
    } catch (err) {
      this.notify((err as Error).message, 'error');
    }
  }

  private async onDelete(): Promise<void> {
    if (!this.editingId) return;
    try {
      await this.api.deleteAgent(this.editingId);
      this.notify(`Agent "${this.editingId}" deleted`, 'success');
      this.clearForm();
    } catch (err) {
      this.notify((err as Error).message, 'error');
    }
  }

  private notify(message: string, type: 'success' | 'error'): void {
    const color = type === 'success' ? CSSColors.Neon.Green : CSSColors.Neon.Red;
    const el = document.createElement('div');
    el.style.cssText = `
      padding:8px 12px;margin-top:8px;
      background:${color}15;border:1px solid ${color}60;
      color:${color};border-radius:3px;
      font-family:'Courier New',monospace;font-size:11px;
    `;
    el.textContent = message;
    this.notifDiv.innerHTML = '';
    this.notifDiv.appendChild(el);
    setTimeout(() => el.remove(), 3000);
  }
}
