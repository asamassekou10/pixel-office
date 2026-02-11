/**
 * Cyberpunk Design System - Design Tokens
 *
 * Centralized design tokens for consistent retro/cyberpunk aesthetic.
 * Inspired by: Cyberpunk 2077, Blade Runner 2049, Tron Legacy
 */

export const Colors = {
  Background: {
    Primary: 0x0a0a0f,      // Deep black-blue
    Secondary: 0x1a1a2e,    // Mid dark blue
    Accent: 0x16213e,       // Panel backgrounds
  },
  Neon: {
    Cyan: 0x00d9ff,         // Primary accent - electric blue
    Magenta: 0xff00ff,      // Secondary accent - hot pink
    Green: 0x39ff14,        // Success/active - neon green
    Orange: 0xff6600,       // Warning - electric orange
    Red: 0xff0055,          // Error/critical - hot pink/red
    Purple: 0x9d00ff,       // Special states - violet
  },
  States: {
    Idle: 0x39ff14,         // Neon green - ready to work
    Working: 0x00d9ff,      // Cyan - actively processing
    Moving: 0x9d00ff,       // Purple - transitioning
    Error: 0xff0055,        // Hot pink/red - failed state
  },
  UI: {
    Text: 0xffffff,
    TextDim: 0x8892b0,
    TextGlow: 0xccd6f6,
    Border: 0x00d9ff,
    BorderDim: 0x233554,
  },
};

// CSS color strings for HTML/DOM elements
export const CSSColors = {
  Background: {
    Primary: '#0a0a0f',
    Secondary: '#1a1a2e',
    Accent: '#16213e',
  },
  Neon: {
    Cyan: '#00d9ff',
    Magenta: '#ff00ff',
    Green: '#39ff14',
    Orange: '#ff6600',
    Red: '#ff0055',
    Purple: '#9d00ff',
  },
  States: {
    Idle: '#39ff14',
    Working: '#00d9ff',
    Moving: '#9d00ff',
    Error: '#ff0055',
  },
  UI: {
    Text: '#ffffff',
    TextDim: '#8892b0',
    TextGlow: '#ccd6f6',
    Border: '#00d9ff',
    BorderDim: '#233554',
  },
};

export const Typography = {
  Fonts: {
    Default: 'Courier New, monospace',
    Display: 'monospace',
  },
  Sizes: {
    xs: 8,
    sm: 10,
    base: 12,
    md: 14,
    lg: 16,
    xl: 20,
    xxl: 24,
    huge: 32,
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  huge: 64,
};

export const Effects = {
  // Animation speeds (ms)
  PulseSpeed: 1000,
  FastPulse: 500,
  SlowPulse: 2000,

  // Transition durations (ms)
  TransitionFast: 150,
  TransitionNormal: 300,
  TransitionSlow: 600,

  // Post-processing
  ScanlineOpacity: 0.05,
  BloomStrength: 0.4,
  BloomRadius: 0.3,
  BloomThreshold: 0.85,

  // Particle config
  ParticleLifespan: 1000,
  ParticleSpeed: 50,
};

export const Layout = {
  // Panel dimensions
  DetailPanelWidth: 320,
  BottomBarHeight: 120,
  TopBarHeight: 60,

  // Padding/margins
  PanelPadding: Spacing.base,
  PanelMargin: Spacing.md,

  // Component sizes
  ProgressBarHeight: 6,
  BadgeSize: 16,
  IconSize: 20,
};
