/**
 * Krushi AI Design Tokens
 * Shared design system constants for the farming assistant app.
 * Import this in JS/React components when you need tokens programmatically.
 */

export const colors = {
  green: {
    DEFAULT: '#0F6E56',
    light: '#1D9E75',
    pale: '#E1F5EE',
    dark: '#0A4F3D',
  },
  amber: {
    DEFAULT: '#BA7517',
    light: '#FAEEDA',
    dark: '#8A5710',
  },
  earth: {
    DEFAULT: '#7C5C3A',
    light: '#A68560',
    pale: '#F5EDE3',
  },
  sky: {
    DEFAULT: '#185FA5',
    light: '#E8F0FE',
    dark: '#0E3F6E',
  },
  bg: '#F7F9F5',
  card: '#FFFFFF',
  text: '#1A1A1A',
  muted: '#6B7280',
  danger: '#DC2626',
  dangerLight: '#FEE2E2',
  success: '#16A34A',
  successLight: '#DCFCE7',
};

export const fonts = {
  sans: "'Inter', 'Segoe UI', system-ui, sans-serif",
  telugu: "'Noto Sans Telugu', 'Mandali', sans-serif",
  mono: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
};

export const spacing = {
  page: '1rem',        // mobile page padding
  pageLg: '2rem',      // desktop page padding
  card: '1.25rem',     // card internal padding
  section: '2rem',     // between sections
  sectionLg: '3rem',
};

export const radii = {
  sm: '0.5rem',
  md: '0.75rem',
  lg: '1rem',
  xl: '1.5rem',
  full: '9999px',
};

export const shadows = {
  card: '0 1px 3px rgba(15, 110, 86, 0.08), 0 1px 2px rgba(0,0,0,0.04)',
  cardHover: '0 4px 12px rgba(15, 110, 86, 0.12), 0 2px 4px rgba(0,0,0,0.06)',
  modal: '0 20px 60px rgba(0,0,0,0.15), 0 8px 20px rgba(0,0,0,0.1)',
  glow: '0 0 20px rgba(15, 110, 86, 0.25)',
};

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
};

// Status / alert type color mappings
export const alertColors = {
  Weather: { bg: '#E8F0FE', text: '#185FA5', icon: '🌦️' },
  Market: { bg: '#FAEEDA', text: '#BA7517', icon: '📊' },
  Disease: { bg: '#FEE2E2', text: '#DC2626', icon: '🦠' },
  Reminder: { bg: '#E1F5EE', text: '#0F6E56', icon: '⏰' },
  Scheme: { bg: '#F3E8FF', text: '#7C3AED', icon: '🏛️' },
};

// Crop stage colors
export const cropStageColors = {
  Sowing: { bg: '#E1F5EE', text: '#0F6E56', emoji: '🌱' },
  Vegetative: { bg: '#DCFCE7', text: '#16A34A', emoji: '🌿' },
  Flowering: { bg: '#FAEEDA', text: '#BA7517', emoji: '🌸' },
  Harvesting: { bg: '#FEF3C7', text: '#92400E', emoji: '🌾' },
};
