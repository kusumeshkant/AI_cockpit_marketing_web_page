/**
 * Design tokens mirrored for TypeScript consumers that cannot read CSS variables
 * (three.js materials, canvas/SVG generation, meta tags).
 *
 * These values MUST stay in sync with the `@theme` block in `src/app/globals.css`
 * and with the Flutter app's `AppColors` dark theme.
 */
export const colors = {
  bg: '#070D13',
  paper: '#0C141C',
  surface: '#16212C',
  surfaceAlt: '#1B2836',
  line: '#26343F',
  lineStrong: '#374956',
  ink: '#E7EDF2',
  inkSoft: '#B3C1CC',
  muted: '#8595A2',
  accent: '#1EA6C6',
  accentBright: '#3FC2DF',
  accentInk: '#BFE8F2',
  accentWash: '#122D38',
  pending: '#E6A848',
  pendingBg: '#3A2C12',
  go: '#4BBD83',
  goBg: '#12301F',
  stop: '#E0705F',
  stopBg: '#381914',
} as const;

export type ColorToken = keyof typeof colors;

/** Tailwind breakpoints (px), mirrored from the default scale used by the site. */
export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
} as const;

/** Motion timings shared between CSS, Framer Motion and the R3F scene. */
export const motionTokens = {
  /** Agent nodes complete one orbit in this many seconds. */
  orbitSeconds: 20,
  /** A signal particle is emitted on this cadence (seconds). */
  signalIntervalSeconds: 4,
  /** Idle float loop of the hero phone (seconds). */
  phoneFloatSeconds: 6,
  /** Max mouse-parallax rotation of the hero stage (degrees). */
  parallaxDegrees: 6,
} as const;
