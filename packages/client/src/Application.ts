import * as THREE from 'three';
import { SceneManager } from './core/SceneManager.js';
import { RendererManager } from './core/RendererManager.js';
import { CameraController } from './core/CameraController.js';
import { InputManager } from './core/InputManager.js';
import { NetworkManager } from './network/NetworkManager.js';
import { OfficeEnvironment } from './world/OfficeEnvironment.js';
import { LightingSystem } from './world/LightingSystem.js';
import { AgentManager3D } from './agents/AgentManager3D.js';
import { ParticleSystem } from './effects/ParticleSystem.js';
import { ConnectionRenderer } from './effects/ConnectionRenderer.js';
import { HUD } from './ui/HUD.js';
import { Tooltip } from './ui/Tooltip.js';
import { AgentDetailPanel } from './ui/AgentDetailPanel.js';
import { LoadingScreen } from './ui/LoadingScreen.js';
import { DemoService } from './network/DemoService.js';
import { NetEvents } from './network/NetEvents.js';
import { ControlPanel } from './ui/ControlPanel.js';
import { APIService } from './services/APIService.js';

/**
 * Top-level orchestrator.
 * Creates the Three.js renderer, scene, camera, network, office, and agents.
 * Owns the requestAnimationFrame render loop.
 */
export class Application {
  private sceneManager: SceneManager;
  private rendererManager: RendererManager;
  private cameraController: CameraController;
  private inputManager: InputManager;
  private network: NetworkManager;
  private clock: THREE.Clock;

  private office: OfficeEnvironment;
  private lighting: LightingSystem;
  private agentManager: AgentManager3D;
  private particles: ParticleSystem;
  private connections: ConnectionRenderer;
  private hud: HUD;
  private tooltip: Tooltip;
  private detailPanel: AgentDetailPanel;
  private loadingScreen: LoadingScreen;
  private controlPanel: ControlPanel;
  private demoService: DemoService;

  private dustTimer = 0;
  private steamTimer = 0;
  private connectionTimer = 0;
  private nameplateCheckTimer = 0;
  private nameplatesVisible = true;
  private controlPanelTimer = 0;

  constructor() {
    // ── Loading screen (show immediately) ─────────────────
    this.loadingScreen = new LoadingScreen();

    const canvas = document.getElementById('three-canvas') as HTMLCanvasElement;
    const css2dLayer = document.getElementById('css2d-layer') as HTMLElement;

    if (!canvas || !css2dLayer) {
      throw new Error('Required DOM elements #three-canvas or #css2d-layer not found');
    }

    // ── Core systems ──────────────────────────────────────
    this.sceneManager = new SceneManager();
    this.rendererManager = new RendererManager(canvas, css2dLayer);
    this.cameraController = new CameraController(canvas);
    this.clock = new THREE.Clock();

    // ── Office environment ────────────────────────────────
    this.office = new OfficeEnvironment(this.sceneManager.scene);
    this.lighting = new LightingSystem(this.sceneManager.scene);

    // ── Effects ─────────────────────────────────────────
    this.particles = new ParticleSystem(this.sceneManager.scene);
    this.connections = new ConnectionRenderer(this.sceneManager.scene);

    // ── Network ───────────────────────────────────────────
    this.network = NetworkManager.getInstance();
    this.network.connect();

    // ── Agents ────────────────────────────────────────────
    this.agentManager = new AgentManager3D(this.sceneManager.scene, this.particles);

    // ── UI ────────────────────────────────────────────────
    this.hud = new HUD();
    this.tooltip = new Tooltip();
    this.detailPanel = new AgentDetailPanel();

    // ── Control Panel ───────────────────────────────────
    this.controlPanel = new ControlPanel(APIService.getInstance());

    this.hud.onControlPanelToggle = () => {
      this.controlPanel.toggle();
      this.hud.updateControlPanelState(this.controlPanel.isVisible);
    };

    // ── Input / Interaction ──────────────────────────────
    this.inputManager = new InputManager(canvas, this.cameraController.camera);

    this.inputManager.on('agent-hovered', (agentId: string | null) => {
      if (agentId) {
        const agent = this.agentManager.getAgent(agentId);
        if (agent) this.tooltip.show(agent.getAgentData());
      } else {
        this.tooltip.hide();
      }
    });

    this.inputManager.on('agent-clicked', (agentId: string) => {
      const agent = this.agentManager.getAgent(agentId);
      if (agent) {
        this.detailPanel.show(agent.getAgentData());
        this.cameraController.focusOnAgent(agent.group.position);
      }
    });

    this.inputManager.on('background-clicked', () => {
      if (this.detailPanel.isVisible) {
        this.detailPanel.hide();
        this.cameraController.resetToOverview();
      }
    });

    this.detailPanel.onConnectionClick = (agentId: string) => {
      const agent = this.agentManager.getAgent(agentId);
      if (agent) {
        this.detailPanel.show(agent.getAgentData());
        this.cameraController.focusOnAgent(agent.group.position);
      }
    };

    // ── Demo mode (fallback when server not available) ───
    this.demoService = new DemoService();

    // Start demo agents after 2s if server hasn't connected
    setTimeout(() => {
      if (!this.network.isConnected) {
        this.demoService.start();
        console.log('[Application] Demo mode: using simulated agents');
      }
    }, 2000);

    // Stop demo when server connects (server takes over)
    this.network.on(NetEvents.CONNECTED, () => {
      if (this.demoService.isRunning) {
        this.demoService.stop();
        console.log('[Application] Server connected, demo mode stopped');
      }
    });

    // Restart demo if server disconnects
    this.network.on(NetEvents.DISCONNECTED, () => {
      setTimeout(() => {
        if (!this.network.isConnected) {
          this.demoService.start();
          console.log('[Application] Server lost, resuming demo mode');
        }
      }, 3000);
    });

    // ── Start render loop ─────────────────────────────────
    this.animate();

    console.log('[Application] Pixel Office initialized (2D pixel-art mode)');
  }

  private animate = (): void => {
    requestAnimationFrame(this.animate);

    const delta = this.clock.getDelta();

    // Update systems
    this.cameraController.update(delta);
    this.agentManager.update(delta);
    this.office.update(delta);
    this.lighting.update(delta);
    this.particles.update(delta);
    this.connections.update(delta);

    // Update raycast targets each frame
    this.inputManager.setTargets(this.agentManager.getRaycastTargets());

    // Update connection lines every ~0.5s (not every frame)
    this.connectionTimer += delta;
    if (this.connectionTimer > 0.5) {
      this.connectionTimer = 0;
      this.connections.updateConnections(this.agentManager.getAllAgents());
    }

    // Ambient particles (dust + coffee steam)
    this.dustTimer += delta;
    if (this.dustTimer > 2) {
      this.dustTimer = 0;
      this.particles.emitDust(12, 9, 2);
    }
    this.steamTimer += delta;
    if (this.steamTimer > 1.5) {
      this.steamTimer = 0;
      this.particles.emitSteam(21, 2.5);
    }

    // Nameplate zoom-based culling (check every 0.5s)
    this.nameplateCheckTimer += delta;
    if (this.nameplateCheckTimer > 0.5) {
      this.nameplateCheckTimer = 0;
      const viewHeight = this.cameraController.camera.top * 2;
      const shouldShow = viewHeight < 30;
      if (shouldShow !== this.nameplatesVisible) {
        this.nameplatesVisible = shouldShow;
        for (const agent of this.agentManager.getAllAgents()) {
          agent.setNameplateVisible(shouldShow);
        }
      }
    }

    // Update HUD
    this.hud.updateAgentCount(this.agentManager.count);

    // Update control panel data (every 1s, only when visible)
    this.controlPanelTimer += delta;
    if (this.controlPanelTimer > 1 && this.controlPanel.isVisible) {
      this.controlPanelTimer = 0;
      const agentData = this.agentManager.getAllAgents().map(a => a.getAgentData());
      this.controlPanel.updateData(agentData);
    }

    // Render (pass delta for post-processing animation)
    this.rendererManager.render(
      this.sceneManager.scene,
      this.cameraController.camera,
      delta,
    );
  };
}
