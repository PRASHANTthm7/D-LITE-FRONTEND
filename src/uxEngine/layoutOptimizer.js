/**
 * Layout Optimizer
 * Adapts spacing, sizing, and panel visibility based on activity and mood
 * All changes are CSS-based (no DOM restructuring)
 */

export class LayoutOptimizer {
  constructor() {
    this.currentLayout = {
      spacing: 'normal', // 'compact' | 'normal' | 'relaxed'
      panelVisibility: {
        sidebar: true,
        suggestions: true,
        reactions: true,
        quickActions: true,
      },
      inputMode: 'normal', // 'collapsed' | 'normal' | 'expanded'
      contextualActions: {
        showExpandThought: false,
        showEmojiShortcut: false,
      },
    }
  }

  /**
   * Apply spacing preference based on heat level
   * High heat = more breathing room (reduce visual stress)
   * Low heat = compact view (efficient use of space)
   */
  applySpacingForHeat(heatLevel = 'normal', activityLevel = 0) {
    let spacing = 'normal'

    const highActivity = Number(activityLevel) >= 70
    const lowActivity = Number(activityLevel) <= 20

    if (heatLevel === 'high' || heatLevel === 'critical' || highActivity) {
      spacing = 'relaxed'
      this.setCSSVariable('--ux-spacing-multiplier', '1.18')
      this.setCSSVariable('--ux-chat-gap', '1rem')
    } else if ((heatLevel === 'low' || heatLevel === 'idle') && lowActivity) {
      spacing = 'compact'
      this.setCSSVariable('--ux-spacing-multiplier', '0.9')
      this.setCSSVariable('--ux-chat-gap', '0.6rem')
    } else {
      spacing = 'normal'
      this.setCSSVariable('--ux-spacing-multiplier', '1')
      this.setCSSVariable('--ux-chat-gap', '0.75rem')
    }

    this.currentLayout.spacing = spacing
    return spacing
  }

  /**
   * Optimize input area based on typing speed
   * Fast typing = collapse extra UI
   * User pausing = expand for better visibility
   */
  optimizeInputArea(typingSpeed, isPausing) {
    if (isPausing) {
      // User paused - give them more input space
      this.setInputMode('expanded')
      this.setCSSVariable('--ux-input-height', 'auto')
      this.setCSSVariable('--ux-suggestions-visible', '1')
      this.setPanelVisibility('suggestions', true)
    } else if (typingSpeed === 'fast') {
      // Fast typing - minimize distractions
      this.setInputMode('collapsed')
      this.setCSSVariable('--ux-input-height', '48px')
      this.setCSSVariable('--ux-suggestions-visible', '0.3')
      this.setPanelVisibility('suggestions', false)
    } else {
      // Normal typing
      this.setInputMode('normal')
      this.setCSSVariable('--ux-input-height', '64px')
      this.setCSSVariable('--ux-suggestions-visible', '1')
      this.setPanelVisibility('suggestions', true)
    }
  }

  /**
   * Adjust sidebar based on focus mode
   */
  applyFocusMode(isActive) {
    if (isActive) {
      // Focus mode: keep chat primary and dim non-essentials
      this.setPanelVisibility('sidebar', true)
      this.setPanelVisibility('suggestions', false)
      this.setPanelVisibility('reactions', false)
      this.setPanelVisibility('quickActions', false)
      this.setCSSVariable('--ux-focus-mode', '1')
      this.setCSSVariable('--ux-chat-width', '100%')
    } else {
      // Normal mode: show everything
      this.setPanelVisibility('sidebar', true)
      this.setPanelVisibility('suggestions', true)
      this.setPanelVisibility('reactions', true)
      this.setPanelVisibility('quickActions', true)
      this.setCSSVariable('--ux-focus-mode', '0')
      this.setCSSVariable('--ux-chat-width', 'auto')
    }
  }

  /**
   * Contextual action surface visibility based on mood
   */
  applyContextualActions(roomMood, vibeState) {
    const showContextualActions = roomMood !== 'focused' && vibeState !== 'stressed'
    const normalizedMood = String(roomMood || '').toLowerCase()
    const normalizedVibe = String(vibeState || '').toLowerCase()

    if (showContextualActions) {
      this.setCSSVariable('--ux-actions-visible', '1')
      this.setCSSVariable('--ux-actions-opacity', '0.8')
      this.setCSSVariable('--ux-action-expand-visible', '0')
      this.setCSSVariable('--ux-action-emoji-visible', '0')

      const showExpandThought =
        normalizedMood === 'deep' ||
        normalizedMood === 'calm' ||
        normalizedVibe === 'contemplative' ||
        normalizedVibe === 'philosophical'

      // Deep mood = show "expand thought" action
      if (showExpandThought) {
        this.setCSSVariable('--ux-action-expand-visible', '1')
      }

      // Energetic mood = show emoji shortcut
      const showEmojiShortcut =
        normalizedMood === 'energetic' ||
        normalizedMood === 'chaotic' ||
        normalizedVibe === 'excited' ||
        normalizedVibe === 'joyful'

      if (showEmojiShortcut) {
        this.setCSSVariable('--ux-action-emoji-visible', '1')
      }

      this.currentLayout.contextualActions = {
        showExpandThought,
        showEmojiShortcut,
      }
    } else {
      this.setCSSVariable('--ux-actions-visible', '0')
      this.setCSSVariable('--ux-actions-opacity', '0.2')
      this.setCSSVariable('--ux-action-expand-visible', '0')
      this.setCSSVariable('--ux-action-emoji-visible', '0')
      this.currentLayout.contextualActions = {
        showExpandThought: false,
        showEmojiShortcut: false,
      }
    }
  }

  /**
   * Highlight important elements softly
   * No aggressive flashing - just subtle emphasis
   */
  applySoftAttention(elementType, isActive) {
    const prefix = '--ux-attention'
    const defaultLevel = '0.5'

    if (!isActive) {
      switch (elementType) {
        case 'mention':
          this.setCSSVariable(`${prefix}-mention`, defaultLevel)
          break
        case 'reply':
          this.setCSSVariable(`${prefix}-reply`, defaultLevel)
          break
        case 'focus-chat':
          this.setCSSVariable(`${prefix}-focus-chat`, defaultLevel)
          break
        default:
          break
      }
      return
    }

    switch (elementType) {
      case 'mention':
        this.setCSSVariable(`${prefix}-mention`, '0.9')
        break
      case 'reply':
        this.setCSSVariable(`${prefix}-reply`, '0.82')
        break
      case 'focus-chat':
        this.setCSSVariable(`${prefix}-focus-chat`, '0.85')
        break
      default:
        break
    }
  }

  /**
   * Apply smooth transitions
   */
  setTransitionSpeed(mood) {
    let duration = '300ms' // default

    if (mood === 'calm' || mood === 'deep') {
      duration = '500ms' // slower, more meditative
    } else if (mood === 'energetic') {
      duration = '150ms' // snappier
    }

    this.setCSSVariable('--ux-transition-duration', duration)
  }

  // ===== Helper Methods =====

  setInputMode(mode) {
    this.currentLayout.inputMode = mode
    this.applyDataAttribute('data-ux-input-mode', mode)
  }

  setPanelVisibility(panel, isVisible) {
    this.currentLayout.panelVisibility[panel] = isVisible
    this.setCSSVariable(
      `--ux-panel-${panel}-visible`,
      isVisible ? '1' : '0'
    )
  }

  setCSSVariable(varName, value) {
    const root = this.getRoot()
    if (!root) return
    root.style.setProperty(varName, value)
  }

  applyDataAttribute(attr, value) {
    const root = this.getRoot()
    if (!root) return
    root.setAttribute(attr, value)
  }

  getRoot() {
    if (typeof document === 'undefined') return null
    return document.documentElement
  }

  /**
   * Get current layout snapshot
   */
  getSnapshot() {
    return { ...this.currentLayout }
  }

  /**
   * Reset to default layout
   */
  reset() {
    this.currentLayout = {
      spacing: 'normal',
      panelVisibility: {
        sidebar: true,
        suggestions: true,
        reactions: true,
        quickActions: true,
      },
      inputMode: 'normal',
      contextualActions: {
        showExpandThought: false,
        showEmojiShortcut: false,
      },
    }
    const root = this.getRoot()
    if (!root) return
    root.removeAttribute('style')
    root.removeAttribute('data-ux-input-mode')
  }
}

// Singleton instance
export const layoutOptimizer = new LayoutOptimizer()
