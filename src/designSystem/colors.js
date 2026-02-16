/**
 * Soft Light Color System
 * Eye-soothing, calm, futuristic palette
 */

export const colors = {
  // Base Palette - Soft & Calm
  lavender: {
    50: '#f5f3ff',
    100: '#ede9fe',
    200: '#ddd6fe',
    300: '#c4b5fd',
    400: '#a78bfa',
    500: '#8b5cf6',
    600: '#7c3aed',
    700: '#6d28d9',
  },
  blue: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
  },
  cyan: {
    50: '#ecfeff',
    100: '#cffafe',
    200: '#a5f3fc',
    300: '#67e8f9',
    400: '#22d3ee',
    500: '#06b6d4',
    600: '#0891b2',
  },
  violet: {
    50: '#faf5ff',
    100: '#f3e8ff',
    200: '#e9d5ff',
    300: '#d8b4fe',
    400: '#c084fc',
    500: '#a855f7',
    600: '#9333ea',
  },
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
    primary: '#faf9ff',      // Soft off-white (no pure white)
    secondary: '#f5f3ff',    // Very light lavender
    tertiary: '#ede9fe',     // Light lavender
    overlay: 'rgba(250, 249, 255, 0.85)', // Glass effect
  },
  
  surface: {
    primary: 'rgba(255, 255, 255, 0.7)',
    secondary: 'rgba(255, 255, 255, 0.5)',
    elevated: 'rgba(255, 255, 255, 0.9)',
    glass: 'rgba(255, 255, 255, 0.6)',
  },

  text: {
    primary: '#1f2937',      // Dark graphite
    secondary: '#4b5563',     // Medium graphite
    tertiary: '#6b7280',      // Light graphite
    inverse: '#faf9ff',       // Light text on dark
    muted: '#9ca3af',         // Very muted
  },

  border: {
    light: 'rgba(203, 213, 225, 0.3)',
    medium: 'rgba(203, 213, 225, 0.5)',
    subtle: 'rgba(203, 213, 225, 0.2)',
  },

  // Sentient Aura Colors (soft, pastel)
  aura: {
    calm: '#a5f3fc',         // Soft cyan
    focused: '#c4b5fd',      // Soft purple
    energetic: '#fbbf24',    // Soft amber
    meditative: '#ddd6fe',    // Very light purple
    balanced: '#bfdbfe',     // Soft blue
  },

  // Status Colors (muted, not harsh)
  status: {
    online: '#34d399',       // Soft green
    offline: '#9ca3af',      // Muted gray
    away: '#fbbf24',         // Soft amber
    busy: '#f87171',         // Soft red
  },
}

// Gradient Presets
export const gradients = {
  primary: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 50%, #ddd6fe 100%)',
  secondary: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 50%, #bfdbfe 100%)',
  sentient: 'linear-gradient(135deg, #faf9ff 0%, #f5f3ff 25%, #ede9fe 50%, #ddd6fe 75%, #c4b5fd 100%)',
  calm: 'linear-gradient(135deg, #ecfeff 0%, #cffafe 50%, #a5f3fc 100%)',
  focused: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 50%, #e9d5ff 100%)',
}

// Helper function to generate sentient gradient from aura colors
export const generateSentientGradient = (auraColors = []) => {
  if (auraColors.length === 0) {
    return gradients.sentient
  }
  
  const colors = auraColors.map(c => c || '#f5f3ff')
  return `linear-gradient(135deg, ${colors.join(', ')})`
}
