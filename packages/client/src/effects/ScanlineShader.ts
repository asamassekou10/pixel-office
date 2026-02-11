import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';

/**
 * CRT scanline + vignette post-processing shader.
 * Subtle horizontal lines with gentle vignette darkening at edges.
 */
const ScanlineVignetteShader = {
  name: 'ScanlineVignetteShader',
  uniforms: {
    tDiffuse: { value: null },
    resolution: { value: [window.innerWidth, window.innerHeight] },
    time: { value: 0 },
    scanlineOpacity: { value: 0.06 },
    scanlineScale: { value: 1.0 },
    vignetteStrength: { value: 0.3 },
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform vec2 resolution;
    uniform float time;
    uniform float scanlineOpacity;
    uniform float scanlineScale;
    uniform float vignetteStrength;
    varying vec2 vUv;

    void main() {
      vec4 color = texture2D(tDiffuse, vUv);

      // Scanlines: darken every other pixel row
      float scanline = sin((vUv.y * resolution.y * scanlineScale + time * 0.5) * 3.14159) * 0.5 + 0.5;
      color.rgb -= scanline * scanlineOpacity;

      // Vignette: darken edges
      vec2 center = vUv - 0.5;
      float dist = length(center);
      float vignette = 1.0 - smoothstep(0.3, 0.9, dist) * vignetteStrength;
      color.rgb *= vignette;

      gl_FragColor = color;
    }
  `,
};

export function createScanlinePass(): ShaderPass {
  const pass = new ShaderPass(ScanlineVignetteShader);

  const updateResolution = () => {
    pass.uniforms['resolution'].value = [window.innerWidth, window.innerHeight];
  };
  window.addEventListener('resize', updateResolution);

  return pass;
}

export function updateScanlineTime(pass: ShaderPass, time: number): void {
  pass.uniforms['time'].value = time;
}
