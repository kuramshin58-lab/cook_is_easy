// Fridgely - Ad Video Design System

export const colors = {
  // Primary
  warmOrange: '#FF6B35',
  freshGreen: '#4CAF50',
  creamWhite: '#FFF8F0',

  // Secondary
  tomatoRed: '#E53935',
  herbGreen: '#81C784',
  softYellow: '#FFD54F',
  charcoal: '#2D2D2D',

  // Gradients
  gradients: {
    primary: 'linear-gradient(135deg, #FF6B35 0%, #E53935 100%)',
    fresh: 'linear-gradient(135deg, #4CAF50 0%, #81C784 100%)',
    warm: 'linear-gradient(135deg, #FFF8F0 0%, #FFD54F 100%)',
    purple: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  }
};

export const typography = {
  fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  sizes: {
    hero: 96,
    title: 72,
    subtitle: 48,
    body: 32,
    caption: 24,
    small: 18,
  },
  weights: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  }
};

export const spacing = {
  xs: 8,
  sm: 16,
  md: 24,
  lg: 40,
  xl: 60,
  xxl: 80,
};

export const timing = {
  // Duration in frames at 60fps
  fast: 12,      // 200ms
  normal: 18,    // 300ms
  slow: 30,      // 500ms
  verySlow: 60,  // 1000ms

  // Stagger delays
  staggerSmall: 3,  // 50ms
  staggerMedium: 6, // 100ms
  staggerLarge: 12, // 200ms
};

// Video configuration
export const videoConfig = {
  width: 1080,
  height: 1920,
  fps: 60,
  durationInSeconds: 45, // Updated for kinetic typography version
  get durationInFrames() {
    return this.fps * this.durationInSeconds;
  }
};

// Scene timings for kinetic typography (in seconds)
// Based on SCRIPT.md voiceover timing
export const sceneTiming = {
  hook: { start: 0, end: 3 },        // "7 вечера. Открываешь холодильник..."
  problem: { start: 3, end: 10 },    // "...и понятия не имеешь..." + "Знакомо?"
  solution: { start: 10, end: 18 },  // "Забудь про это. Открой Fridgely"
  demo: { start: 18, end: 32 },      // "Нажми поиск... Бам! 47 рецептов"
  result: { start: 32, end: 40 },    // "Через полчаса... Ужин готов"
  cta: { start: 40, end: 45 },       // "Fridgely. Скачай бесплатно"
};

// Legacy phase timings (for backward compatibility)
export const legacySceneTiming = {
  phase1: { start: 0, end: 8 },
  phase2: { start: 8, end: 15 },
  phase3: { start: 15, end: 30 },
  phase4: { start: 30, end: 42 },
  phase5: { start: 42, end: 50 },
  phase6: { start: 50, end: 60 },
};

// Convert seconds to frames
export const toFrames = (seconds: number) => seconds * videoConfig.fps;
