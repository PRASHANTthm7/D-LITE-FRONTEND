/**
 * Design System - Main Export
 * Centralized exports for all design tokens
 */

export { colors, gradients, generateSentientGradient } from './colors'
export { spacing, lineHeights } from './spacing'
export { default as themeTokens } from './themeTokens'
export { default as motionTokens } from './motionTokens'
export { 
  getSentientBackground,
  getBubbleStyle,
  getAuraColor,
  getUIModeStyles,
  applySentientTheme,
  default as sentientThemeEngine 
} from './sentientThemeEngine'
