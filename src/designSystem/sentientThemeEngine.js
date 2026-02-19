/**
 * Sentient Theme Engine
 * Dynamically adapts UI based on sentient signals
 */

import { colors } from './colors'
import { gradients } from './colors'

/**
 * Get background gradient based on sentient state
 */
export const getSentientBackground = (sentientState) => {
  const { backgroundGradient, currentMood, energyLevel } = sentientState || {}

  // Use provided gradient if available
  if (backgroundGradient && backgroundGradient.length > 0) {
    return `linear-gradient(135deg, ${backgroundGradient.join(', ')})`
  }

  // Fallback to mood-based gradients (Golden Light theme)
  const moodGradients = {
    calm: gradients.calm,          // Soft golden gradient
    focused: gradients.focused,    // Radiant amber gradient
    meditative: gradients.calm,    // Soft golden (same as calm)
    balanced: gradients.primary,   // Sunrise gradient
    chaotic: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #f97316 100%)',  // Energetic gold-to-orange
    deep: 'linear-gradient(135deg, #78350f 0%, #92400e 50%, #b45309 100%)',     // Deep amber
    funny: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 50%, #fbbf24 100%)',    // Light golden
  }

  return moodGradients[currentMood] || gradients.sentient
}

/**
 * Get message bubble style based on mood
 */
export const getBubbleStyle = (mood) => {
  const styles = {
    calm: {
      borderRadius: '1rem',
      padding: '0.75rem 1rem',
    },
    focused: {
      borderRadius: '0.75rem',
      padding: '0.75rem 1rem',
    },
    meditative: {
      borderRadius: '1.25rem',
      padding: '0.875rem 1.125rem',
    },
    balanced: {
      borderRadius: '1rem',
      padding: '0.75rem 1rem',
    },
    chaotic: {
      borderRadius: '0.875rem',
      transform: 'rotate(-0.5deg)',
      padding: '0.75rem 1rem',
    },
    deep: {
      borderRadius: '1.5rem',
      padding: '0.875rem 1.125rem',
    },
    funny: {
      borderRadius: '1rem',
      padding: '0.75rem 1rem',
    },
  }

  return styles[mood] || styles.balanced
}

/**
 * Get aura color based on presence and mood
 */
export const getAuraColor = (auraColor, mood, energyLevel = 0) => {
  if (auraColor) return auraColor

  const moodAuras = {
    calm: colors.aura.calm,
    focused: colors.aura.focused,
    meditative: colors.aura.meditative,
    balanced: colors.aura.balanced,
    energetic: colors.aura.energetic,
  }

  return moodAuras[mood] || colors.aura.balanced
}

/**
 * Get UI mode styles (normal, minimal, whisper)
 */
export const getUIModeStyles = (uiMode) => {
  const modes = {
    normal: {
      sidebarWidth: '320px',
      opacity: 1,
      blur: '0px',
    },
    minimal: {
      sidebarWidth: '240px',
      opacity: 0.9,
      blur: '2px',
    },
    whisper: {
      sidebarWidth: '200px',
      opacity: 0.7,
      blur: '4px',
    },
  }

  return modes[uiMode] || modes.normal
}

/**
 * Apply sentient theme to CSS variables
 */
export const applySentientTheme = (sentientState, rootElement = document.documentElement) => {
  const {
    backgroundGradient,
    currentMood,
    pulseSpeed,
    energyLevel,
    uiMode,
    focusModeActive,
  } = sentientState || {}

  // Background
  const bg = getSentientBackground(sentientState)
  rootElement.style.setProperty('--sentient-bg', bg)

  // Pulse speed
  rootElement.style.setProperty('--sentient-pulse-speed', `${pulseSpeed || 1.0}s`)

  // Energy level (0-100)
  rootElement.style.setProperty('--sentient-energy', energyLevel || 0)

  // UI Mode
  const modeStyles = getUIModeStyles(uiMode)
  rootElement.style.setProperty('--sentient-sidebar-width', modeStyles.sidebarWidth)
  rootElement.style.setProperty('--sentient-ui-opacity', modeStyles.opacity)
  rootElement.style.setProperty('--sentient-ui-blur', modeStyles.blur)

  // Focus mode
  rootElement.style.setProperty('--sentient-focus-mode', focusModeActive ? '1' : '0')

  // Mood
  rootElement.setAttribute('data-sentient-mood', currentMood || 'balanced')
  rootElement.setAttribute('data-sentient-mode', uiMode || 'normal')
}

export default {
  getSentientBackground,
  getBubbleStyle,
  getAuraColor,
  getUIModeStyles,
  applySentientTheme,
}
