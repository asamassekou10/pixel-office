import * as THREE from 'three';

/**
 * Lightweight 2D particle system using THREE.Points.
 * Pre-allocates a fixed pool of particles for zero-GC runtime.
 *
 * Particle types: dust, steam, sparkle, burst
 */

interface Particle {
  alive: boolean;
  life: number;
  maxLife: number;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  size: number;
  r: number;
  g: number;
  b: number;
  alpha: number;
}

const MAX_PARTICLES = 200;

export class ParticleSystem {
  public readonly points: THREE.Points;

  private particles: Particle[];
  private positions: Float32Array;
  private colors: Float32Array;
  private sizes: Float32Array;
  private geometry: THREE.BufferGeometry;

  constructor(scene: THREE.Scene) {
    this.particles = Array.from({ length: MAX_PARTICLES }, () => ({
      alive: false,
      life: 0,
      maxLife: 1,
      x: 0, y: 0, z: 0,
      vx: 0, vy: 0, vz: 0,
      size: 2,
      r: 1, g: 1, b: 1,
      alpha: 1,
    }));

    this.positions = new Float32Array(MAX_PARTICLES * 3);
    this.colors = new Float32Array(MAX_PARTICLES * 4);
    this.sizes = new Float32Array(MAX_PARTICLES);

    this.geometry = new THREE.BufferGeometry();
    this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
    this.geometry.setAttribute('color', new THREE.BufferAttribute(this.colors, 4));
    this.geometry.setAttribute('size', new THREE.BufferAttribute(this.sizes, 1));

    const material = new THREE.PointsMaterial({
      size: 0.08,
      vertexColors: true,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });

    this.points = new THREE.Points(this.geometry, material);
    this.points.name = 'ParticleSystem';
    this.points.frustumCulled = false;
    scene.add(this.points);
  }

  /** Emit dust motes floating in ambient light. */
  emitDust(cx: number, cz: number, count = 3): void {
    for (let i = 0; i < count; i++) {
      const p = this.getDeadParticle();
      if (!p) return;
      p.alive = true;
      p.life = 0;
      p.maxLife = 3 + Math.random() * 4;
      p.x = cx + (Math.random() - 0.5) * 4;
      p.y = 0.3 + Math.random() * 1.5;
      p.z = cz + (Math.random() - 0.5) * 4;
      p.vx = (Math.random() - 0.5) * 0.1;
      p.vy = 0.05 + Math.random() * 0.05;
      p.vz = (Math.random() - 0.5) * 0.1;
      p.size = 0.03 + Math.random() * 0.03;
      p.r = 1; p.g = 0.95; p.b = 0.8;
      p.alpha = 0.3;
    }
  }

  /** Emit coffee steam rising near coffee machine. */
  emitSteam(x: number, z: number, count = 2): void {
    for (let i = 0; i < count; i++) {
      const p = this.getDeadParticle();
      if (!p) return;
      p.alive = true;
      p.life = 0;
      p.maxLife = 1.5 + Math.random() * 1.5;
      p.x = x + (Math.random() - 0.5) * 0.3;
      p.y = 0.4;
      p.z = z + (Math.random() - 0.5) * 0.3;
      p.vx = (Math.random() - 0.5) * 0.05;
      p.vy = 0.15 + Math.random() * 0.1;
      p.vz = (Math.random() - 0.5) * 0.05;
      p.size = 0.04;
      p.r = 0.9; p.g = 0.9; p.b = 0.95;
      p.alpha = 0.25;
    }
  }

  /** Emit cyan sparkle near a working agent. */
  emitWorkSparkle(x: number, z: number): void {
    const p = this.getDeadParticle();
    if (!p) return;
    p.alive = true;
    p.life = 0;
    p.maxLife = 0.8 + Math.random() * 0.5;
    p.x = x + (Math.random() - 0.5) * 0.6;
    p.y = 0.8 + Math.random() * 0.6;
    p.z = z + (Math.random() - 0.5) * 0.6;
    p.vx = (Math.random() - 0.5) * 0.2;
    p.vy = 0.3 + Math.random() * 0.2;
    p.vz = (Math.random() - 0.5) * 0.2;
    p.size = 0.05;
    p.r = 0; p.g = 0.85; p.b = 1;
    p.alpha = 0.8;
  }

  /** Emit red burst for error state transition. */
  emitErrorBurst(x: number, z: number, count = 8): void {
    for (let i = 0; i < count; i++) {
      const p = this.getDeadParticle();
      if (!p) return;
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.3 + Math.random() * 0.5;
      p.alive = true;
      p.life = 0;
      p.maxLife = 0.5 + Math.random() * 0.3;
      p.x = x;
      p.y = 0.8;
      p.z = z;
      p.vx = Math.cos(angle) * speed;
      p.vy = 0.2 + Math.random() * 0.3;
      p.vz = Math.sin(angle) * speed;
      p.size = 0.06;
      p.r = 1; p.g = 0; p.b = 0.33;
      p.alpha = 1;
    }
  }

  update(delta: number): void {
    for (let i = 0; i < MAX_PARTICLES; i++) {
      const p = this.particles[i];
      if (!p.alive) {
        // Hide dead particles far away
        this.positions[i * 3] = 0;
        this.positions[i * 3 + 1] = -100;
        this.positions[i * 3 + 2] = 0;
        this.colors[i * 4 + 3] = 0;
        this.sizes[i] = 0;
        continue;
      }

      p.life += delta;
      if (p.life >= p.maxLife) {
        p.alive = false;
        continue;
      }

      // Physics
      p.x += p.vx * delta;
      p.y += p.vy * delta;
      p.z += p.vz * delta;
      p.vy -= 0.02 * delta; // slight gravity

      // Fade out near end of life
      const lifeRatio = p.life / p.maxLife;
      const fade = lifeRatio > 0.7 ? 1 - (lifeRatio - 0.7) / 0.3 : 1;

      this.positions[i * 3] = p.x;
      this.positions[i * 3 + 1] = p.y;
      this.positions[i * 3 + 2] = p.z;
      this.colors[i * 4] = p.r;
      this.colors[i * 4 + 1] = p.g;
      this.colors[i * 4 + 2] = p.b;
      this.colors[i * 4 + 3] = p.alpha * fade;
      this.sizes[i] = p.size * (1 - lifeRatio * 0.3);
    }

    (this.geometry.attributes.position as THREE.BufferAttribute).needsUpdate = true;
    (this.geometry.attributes.color as THREE.BufferAttribute).needsUpdate = true;
    (this.geometry.attributes.size as THREE.BufferAttribute).needsUpdate = true;
  }

  private getDeadParticle(): Particle | null {
    for (const p of this.particles) {
      if (!p.alive) return p;
    }
    return null;
  }

  dispose(): void {
    this.geometry.dispose();
    (this.points.material as THREE.PointsMaterial).dispose();
  }
}
