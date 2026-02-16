/**
 * Behavior Tracker
 * Captures interaction intent and processes it during browser idle windows.
 */

const MAX_NAVIGATION_HISTORY = 80
const MAX_TYPING_INTERVALS = 25
const IDLE_TIMEOUT_MS = 250

const hasWindow = typeof window !== 'undefined'

const scheduleIdle = (callback) => {
  if (hasWindow && typeof window.requestIdleCallback === 'function') {
    return window.requestIdleCallback(callback, { timeout: IDLE_TIMEOUT_MS })
  }
  return setTimeout(callback, IDLE_TIMEOUT_MS)
}

const cancelIdle = (idleId) => {
  if (idleId == null) return
  if (hasWindow && typeof window.cancelIdleCallback === 'function') {
    window.cancelIdleCallback(idleId)
    return
  }
  clearTimeout(idleId)
}

export class BehaviorTracker {
  constructor() {
    this.chatFrequency = new Map()
    this.navigationHistory = []
    this.eventQueue = []
    this.listeners = new Set()
    this.sessionStartTime = Date.now()
    this.idleCallbackId = null

    this.typingPatterns = {
      lastTypingAt: 0,
      lastChangeAt: 0,
      typingSpeed: 'normal',
      pauseThreshold: 1800,
      intervals: [],
    }
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
    const snapshot = this.getSnapshot()
    this.listeners.forEach((listener) => listener(snapshot))
  }

  scheduleFlush() {
    if (this.idleCallbackId != null) return

    this.idleCallbackId = scheduleIdle(() => {
      this.idleCallbackId = null
      this.flushQueue()
    })
  }

  enqueue(event) {
    this.eventQueue.push(event)
    this.scheduleFlush()
  }

  flushQueue() {
    if (this.eventQueue.length === 0) return

    const pendingEvents = this.eventQueue.splice(0, this.eventQueue.length)

    pendingEvents.forEach((event) => {
      if (event.type === 'chat-access') {
        const currentCount = this.chatFrequency.get(event.chatId) || 0
        this.chatFrequency.set(event.chatId, currentCount + 1)
        this.navigationHistory.push({
          chatId: event.chatId,
          timestamp: event.time,
        })

        if (this.navigationHistory.length > MAX_NAVIGATION_HISTORY) {
          this.navigationHistory.shift()
        }
      }

      if (event.type === 'typing') {
        this.processTypingEvent(event)
      }
    })

    this.notifyListeners()
  }

  processTypingEvent(event) {
    const { isTyping, time } = event

    if (isTyping) {
      if (this.typingPatterns.lastChangeAt > 0) {
        const interval = time - this.typingPatterns.lastChangeAt
        if (interval > 0) {
          this.typingPatterns.intervals.push(interval)
          if (this.typingPatterns.intervals.length > MAX_TYPING_INTERVALS) {
            this.typingPatterns.intervals.shift()
          }
        }
      }

      this.typingPatterns.lastTypingAt = time
      this.typingPatterns.lastChangeAt = time
      this.typingPatterns.typingSpeed = this.calculateTypingSpeed()
      return
    }

    this.typingPatterns.lastChangeAt = time
    this.typingPatterns.typingSpeed = this.calculateTypingSpeed()
  }

  calculateTypingSpeed() {
    const { intervals } = this.typingPatterns
    if (intervals.length < 3) return 'normal'

    const avgInterval =
      intervals.reduce((sum, value) => sum + value, 0) / intervals.length

    if (avgInterval <= 140) return 'fast'
    if (avgInterval >= 320) return 'slow'
    return 'normal'
  }

  trackChatAccess(chatId) {
    if (!chatId) return
    this.enqueue({
      type: 'chat-access',
      chatId: String(chatId),
      time: Date.now(),
    })
  }

  trackTyping(payload) {
    const normalizedPayload =
      typeof payload === 'boolean'
        ? { isTyping: payload }
        : {
            isTyping: Boolean(payload?.isTyping),
          }

    this.enqueue({
      type: 'typing',
      ...normalizedPayload,
      time: Date.now(),
    })
  }

  getFrequentChats(limit = 5) {
    return Array.from(this.chatFrequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([chatId]) => chatId)
  }

  getRecentChats(limit = 5) {
    const seen = new Set()
    const recent = []

    for (let i = this.navigationHistory.length - 1; i >= 0; i -= 1) {
      const { chatId } = this.navigationHistory[i]
      if (seen.has(chatId)) continue

      seen.add(chatId)
      recent.push(chatId)
      if (recent.length === limit) break
    }

    return recent
  }

  isUserPausing() {
    if (!this.typingPatterns.lastTypingAt) return false
    const elapsed = Date.now() - this.typingPatterns.lastTypingAt
    return elapsed > this.typingPatterns.pauseThreshold
  }

  getTypingSpeed() {
    return this.typingPatterns.typingSpeed
  }

  getSessionDuration() {
    return Math.floor((Date.now() - this.sessionStartTime) / 1000)
  }

  getSnapshot() {
    return {
      topChats: this.getFrequentChats(5),
      recentChats: this.getRecentChats(6),
      typingSpeed: this.getTypingSpeed(),
      isPausing: this.isUserPausing(),
      sessionDuration: this.getSessionDuration(),
      totalInteractions: this.navigationHistory.length,
    }
  }

  reset() {
    cancelIdle(this.idleCallbackId)
    this.idleCallbackId = null
    this.chatFrequency.clear()
    this.navigationHistory = []
    this.eventQueue = []
    this.typingPatterns = {
      lastTypingAt: 0,
      lastChangeAt: 0,
      typingSpeed: 'normal',
      pauseThreshold: 1800,
      intervals: [],
    }
    this.sessionStartTime = Date.now()
    this.notifyListeners()
  }
}

export const behaviorTracker = new BehaviorTracker()
