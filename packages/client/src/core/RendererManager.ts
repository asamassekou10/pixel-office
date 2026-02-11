import * as THREE from 'three';
import { CSS2DRenderer } from 'three/addons/renderers/CSS2DRenderer.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { Effects } from '../design/tokens.js';
import { createScanlinePass, updateScanlineTime } from '../effects/ScanlineShader.js';

/**
 * Manages the WebGL renderer, CSS2D overlay, and post-processing pipeline.
 * Configured for crisp pixel-art with cyberpunk bloom + scanlines + vignette.
 */
export class RendererManager {
  public readonly renderer: THREE.WebGLRenderer;
  public readonly css2dRenderer: CSS2DRenderer;

  private composer: EffectComposer;
  private scanlinePass: ShaderPass;
  private elapsedTime = 0;

  constructor(canvas: HTMLCanvasElement, css2dContainer: HTMLElement) {
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: false, // Crisp pixel edges
      powerPreference: 'high-performance',
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.toneMapping = THREE.NoToneMapping;
    this.renderer.shadowMap.enabled = false;

    this.css2dRenderer = new CSS2DRenderer({ element: css2dContainer });
    this.css2dRenderer.setSize(window.innerWidth, window.innerHeight);

    // ── Post-processing pipeline ──────────────────────────
    this.composer = new EffectComposer(this.renderer);

    // Placeholder render pass (scene/camera set dynamically in render())
    const renderPass = new RenderPass(new THREE.Scene(), new THREE.Camera());
    this.composer.addPass(renderPass);

    // Bloom for neon elements (sign, monitors, status rings)
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      Effects.BloomStrength,
      Effects.BloomRadius,
      Effects.BloomThreshold,
    );
    this.composer.addPass(bloomPass);

    // Scanlines + vignette
    this.scanlinePass = createScanlinePass();
    this.composer.addPass(this.scanlinePass);

    // Output
    const outputPass = new OutputPass();
    this.composer.addPass(outputPass);

    window.addEventListener('resize', this.onResize);
  }

  private onResize = (): void => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.renderer.setSize(w, h);
    this.css2dRenderer.setSize(w, h);
    this.composer.setSize(w, h);
  };

  render(scene: THREE.Scene, camera: THREE.Camera, delta = 0): void {
    this.elapsedTime += delta;

    // Update render pass with current scene/camera
    const renderPass = this.composer.passes[0] as RenderPass;
    renderPass.scene = scene;
    renderPass.camera = camera;

    // Update scanline animation
    updateScanlineTime(this.scanlinePass, this.elapsedTime);

    // Render through post-processing pipeline
    this.composer.render(delta);

    // CSS2D always rendered directly (not through post-processing)
    this.css2dRenderer.render(scene, camera);
  }

  dispose(): void {
    window.removeEventListener('resize', this.onResize);
    this.renderer.dispose();
    this.composer.dispose();
  }
}
