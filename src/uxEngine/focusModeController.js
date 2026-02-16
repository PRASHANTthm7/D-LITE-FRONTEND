/**
 * Focus Mode Controller
 * Manages minimal UI mode to reduce cognitive load
 * Automatically enables/disables based on activity
 */

export class FocusModeController {
  constructor() {
    this.listeners = new Set()
    this.focusMode = {
      active: false,
      autoTriggered: false,
      hiddenElements: new Set(),
    }
    this.triggerThresholds = {
      contiguousTypingMs: 90000, // sustained writing
      highActivityDuration: 120000, // prolonged high activity
      highActivityLevel: 70,
      inactivityMs: 120000, // 2 minutes idle ends auto focus mode
    }
    this.activityTracker = {
      typing: false,
      typingStartTime: null,
      lastActivityTime: Date.now(),
      highActivityStartTime: null,
    }
    this.externalFocusMode = false
  }

  subscribe(listener) {
    if (typeof listener !== 'function') {
      return () => {}
    }

    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  notifyListeners() {
    const snapshot = this.getState()
    this.listeners.forEach((listener) => listener(snapshot))
  }

  getRoot() {
    if (typeof document === 'undefined') return null
    return document.documentElement
  }

  getEffectiveActiveState() {
    return this.focusMode.active || this.externalFocusMode
  }

  setExternalFocusMode(enabled) {
    const normalized = Boolean(enabled)
    if (this.externalFocusMode === normalized) {
      return
    }

    this.externalFocusMode = normalized
    this.applyFocusMode(this.getEffectiveActiveState())
    this.notifyListeners()
  }

  /**
   * Manually toggle focus mode
   */
  toggleFocusMode(enable) {
    this.focusMode.active = Boolean(enable)
    this.focusMode.autoTriggered = false
    this.applyFocusMode(this.getEffectiveActiveState())
    this.notifyListeners()
    return this.getEffectiveActiveState()
  }

  /**
   * Update activity signals and auto-enable focus mode when conditions are met.
   */
  updateActivity({ isTyping = false, activityLevel = 0 } = {}) {
    const now = Date.now()

    if (isTyping && !this.activityTracker.typing) {
      // Started typing
      this.activityTracker.typing = true
      this.activityTracker.typingStartTime = now
    } else if (!isTyping && this.activityTracker.typing) {
      this.activityTracker.typing = false
      this.activityTracker.typingStartTime = null
    }

    if (isTyping) {
      this.activityTracker.lastActivityTime = now
    }

    this.trackHighActivity(activityLevel, now)
    return this.maybeAutoEnable(now)
  }

  trackHighActivity(activityLevel, now) {
    if (Number(activityLevel) >= this.triggerThresholds.highActivityLevel) {
      if (!this.activityTracker.highActivityStartTime) {
        this.activityTracker.highActivityStartTime = now
      }
      this.activityTracker.lastActivityTime = now
      return
    }

    this.activityTracker.highActivityStartTime = null
  }

  maybeAutoEnable(now) {
    if (this.getEffectiveActiveState()) return false

    const typingDuration = this.activityTracker.typingStartTime
      ? now - this.activityTracker.typingStartTime
      : 0

    if (typingDuration >= this.triggerThresholds.contiguousTypingMs) {
      this.autoEnableFocusMode('continuous-typing')
      return true
    }

    const highActivityDuration = this.activityTracker.highActivityStartTime
      ? now - this.activityTracker.highActivityStartTime
      : 0

    if (highActivityDuration >= this.triggerThresholds.highActivityDuration) {
      this.autoEnableFocusMode('high-activity')
      return true
    }

    return false
  }

  /**
   * Check for inactivity to disable auto-triggered focus mode.
   */
  checkInactivity() {
    if (
      !this.focusMode.active ||
      !this.focusMode.autoTriggered ||
      this.externalFocusMode
    ) {
      return false
    }

    const inactivityDuration = Date.now() - this.activityTracker.lastActivityTime
    if (inactivityDuration > this.triggerThresholds.inactivityMs) {
      this.disableFocusMode()
      return true
    }
    return false
  }

  applyFocusMode(enable) {
    const root = this.getRoot()
    if (!root) return

    if (enable) {
      root.setAttribute('data-focus-mode', 'true')
      root.style.setProperty('--ux-focus-panels-opacity', '0.2')
      root.style.setProperty('--ux-focus-chat-opacity', '1')
      root.style.setProperty('--ux-focus-sidebar-width', '0')
      root.style.setProperty('--ux-focus-margin', '0 auto')
      root.style.setProperty('--ux-focus-max-width', '100%')

      root.style.setProperty('--ux-focus-transition', '300ms ease-in-out')

      this.focusMode.hiddenElements = new Set([
        'sidebar',
        'suggestions',
        'reactions',
        'status-bar',
      ])
    } else {
      root.setAttribute('data-focus-mode', 'false')
      root.style.setProperty('--ux-focus-panels-opacity', '1')
      root.style.setProperty('--ux-focus-chat-opacity', '1')
      root.style.setProperty('--ux-focus-sidebar-width', 'auto')
      root.style.setProperty('--ux-focus-margin', '0')
      root.style.setProperty('--ux-focus-max-width', 'none')

      this.focusMode.hiddenElements.clear()
    }
  }

  /**
   * Auto-enable with reason
   */
  autoEnableFocusMode(reason = 'auto') {
    if (this.externalFocusMode) return { enabled: false, reason: 'external-focus' }

    this.focusMode.active = true
    this.focusMode.autoTriggered = true
    this.applyFocusMode(true)
    this.notifyListeners()

    return {
      enabled: true,
      reason,
      canDismiss: true,
    }
  }

  /**
   * Disable focus mode
   */
  disableFocusMode() {
    if (this.focusMode.active) {
      this.focusMode.active = false
      this.focusMode.autoTriggered = false
      this.applyFocusMode(this.getEffectiveActiveState())
      this.notifyListeners()
    }
  }

  /**
   * Check if sidebar should be temporarily hidden
   */
  shouldHideSidebar() {
    return this.getEffectiveActiveState()
  }

  /**
   * Check if element should be hidden in focus mode
   */
  isElementHidden(elementName) {
    if (!this.getEffectiveActiveState()) return false
    return this.focusMode.hiddenElements.has(elementName)
  }

  /**
   * Get focus mode state
   */
  getState() {
    return {
      active: this.getEffectiveActiveState(),
      autoTriggered: this.focusMode.autoTriggered,
      externalFocusMode: this.externalFocusMode,
      hiddenElements: Array.from(this.focusMode.hiddenElements),
    }
  }

  /**
   * Get suggestion to enable focus mode
   */
  getSuggestion() {
    if (this.getEffectiveActiveState()) return null

    const typingDuration = this.activityTracker.typing
      ? Date.now() - this.activityTracker.typingStartTime
      : 0

    if (typingDuration > this.triggerThresholds.contiguousTypingMs * 0.8) {
      // Suggest enabling
      return {
        type: 'focus-mode-suggestion',
        message: 'You\'ve been typing for a while. Enable focus mode?',
        action: 'enableFocus',
        dismissible: true,
      }
    }

    const highActivityDuration = this.activityTracker.highActivityStartTime
      ? Date.now() - this.activityTracker.highActivityStartTime
      : 0

    if (highActivityDuration > this.triggerThresholds.highActivityDuration * 0.8) {
      return {
        type: 'focus-mode-suggestion',
        message: 'High activity detected. Switch to focus mode?',
        action: 'enableFocus',
        dismissible: true,
      }
    }

    return null
  }

  /**
   * Reset controller
   */
  reset() {
    this.focusMode.active = false
    this.focusMode.autoTriggered = false
    this.focusMode.hiddenElements.clear()
    this.externalFocusMode = false
    this.activityTracker = {
      typing: false,
      typingStartTime: null,
      lastActivityTime: Date.now(),
      highActivityStartTime: null,
    }
    const root = this.getRoot()
    if (root) {
      root.removeAttribute('data-focus-mode')
      root.removeAttribute('style')
    }
    this.notifyListeners()
  }
}

// Singleton instance
export const focusModeController = new FocusModeController()
