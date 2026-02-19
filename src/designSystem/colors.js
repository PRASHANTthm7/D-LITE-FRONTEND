/**
 * D-Lite Golden Light Color System
 * Radiant, warm, energetic palette inspired by light and delight
 */

export const colors = {
  // Primary - Radiant Gold/Amber (represents "Light")
  primary: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',  // Vibrant golden amber - "D-LITE"
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },
  
  // Secondary - Electric Yellow (represents energy & delight)
  secondary: {
    50: '#fefce8',
    100: '#fef9c3',
    200: '#fef08a',
    300: '#fde047',
    400: '#facc15',
    500: '#eab308',  // Bright sunshine yellow
    600: '#ca8a04',
    700: '#a16207',
    800: '#854d0e',
    900: '#713f12',
  },

  // Accent - Warm Orange (sunrise/illumination)
  accent: {
    50: '#fff7ed',
    100: '#ffedd5',
    200: '#fed7aa',
    300: '#fdba74',
    400: '#fb923c',
    500: '#f97316',  // Vibrant orange glow
    600: '#ea580c',
    700: '#c2410c',
    800: '#9a3412',
    900: '#7c2d12',
  },

  // Additional Color - Lime (for success states)
  lime: {
    50: '#f7fee7',
    100: '#ecfccb',
    200: '#d9f99d',
    300: '#bef264',
    400: '#a3e635',
    500: '#84cc16',
    600: '#65a30d',
    700: '#4d7c0f',
  },

  // Neutral - For balance
  graphite: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },

  // Semantic Colors
  background: {
    primary: '#0f0a1e',      // Deep purple-black twilight
    secondary: '#1a1333',    // Dark purple
    tertiary: '#251d47',     // Medium purple
    elevated: '#332861',     // Lighter purple
    overlay: 'rgba(15, 10, 30, 0.85)', // Glass effect
  },
  
  surface: {
    primary: 'rgba(37, 29, 71, 0.7)',
    secondary: 'rgba(37, 29, 71, 0.5)',
    elevated: 'rgba(51, 40, 97, 0.9)',
    glass: 'rgba(37, 29, 71, 0.6)',
  },

  text: {
    primary: '#fef3c7',      // Warm white/cream
    secondary: '#fde68a',    // Soft golden
    tertiary: '#cbd5e1',     // Cool gray for balance
    accent: '#f59e0b',       // Golden highlight
    muted: '#9ca3af',        // Very muted
  },

  border: {
    light: 'rgba(245, 158, 11, 0.3)',
    medium: 'rgba(245, 158, 11, 0.5)',
    subtle: 'rgba(245, 158, 11, 0.2)',
  },

  // Sentient Aura Colors (warm, glowing)
  aura: {
    calm: '#fbbf24',         // Soft golden
    focused: '#f59e0b',      // Radiant amber
    energetic: '#f97316',    // Vibrant orange
    meditative: '#fde68a',   // Light golden
    balanced: '#eab308',     // Sunshine yellow
  },

  // Status Colors
  status: {
    online: '#84cc16',       // Lime green
    offline: '#9ca3af',      // Muted gray
    away: '#f59e0b',         // Golden amber
    busy: '#ef4444',         // Bright red
    success: '#84cc16',      // Lime green
    warning: '#f59e0b',      // Golden amber
    error: '#ef4444',        // Bright red
    info: '#3b82f6',         // Blue
  },
}

// Gradient Presets - "Light" themed
export const gradients = {
  primary: 'linear-gradient(135deg, #f59e0b 0%, #eab308 100%)',      // Sunrise
  secondary: 'linear-gradient(135deg, #fbbf24 0%, #f97316 100%)',    // Golden glow
  accent: 'linear-gradient(135deg, #fb923c 0%, #fbbf24 100%)',       // Warm light
  sentient: 'linear-gradient(135deg, #f59e0b 0%, #eab308 50%, #fb923c 100%)', // Full spectrum
  aurora: 'linear-gradient(135deg, #f59e0b 0%, #eab308 50%, #fb923c 100%)', // Aurora light
  delight: 'linear-gradient(135deg, #fef3c7 0%, #f59e0b 50%, #f97316 100%)', // "D-LITE" signature
  calm: 'linear-gradient(135deg, #fbbf24 0%, #fde68a 100%)',
  focused: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
}

// Helper function to generate sentient gradient from aura colors
export const generateSentientGradient = (auraColors = []) => {
  if (auraColors.length === 0) {
    return gradients.sentient
  }
  
  const colors = auraColors.map(c => c || '#f5f3ff')
  return `linear-gradient(135deg, ${colors.join(', ')})`
}
