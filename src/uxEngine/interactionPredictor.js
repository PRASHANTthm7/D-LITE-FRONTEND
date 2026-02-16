/**
 * Interaction Predictor
 * Analyzes behavior patterns to predict next user actions
 * Enables smart UI positioning and pre-loading
 */

export class InteractionPredictor {
  constructor() {
    this.predictions = {
      nextChatId: null,
      likelyAction: null, // 'search' | 'compose' | 'browse' | 'react'
      confidenceScore: 0, // 0-1
      timeToNextAction: null,
    }
    this.actionHistory = []
    this.patterns = new Map() // chat patterns
  }

  /**
   * Analyze navigation patterns
   * If user frequently switches between 2-3 chats, predict next one
   */
  predictNextChat(recentChats, frequentChats) {
    if (!recentChats || recentChats.length === 0) {
      this.predictions.nextChatId = null
      this.predictions.confidenceScore = 0
      return null
    }

    // If user has strong recent pattern (alternating between 2 chats)
    if (recentChats.length >= 3) {
      const recent = recentChats.slice(0, 3)
      
      // Check for ping-pong pattern
      if (recent[0] !== recent[1] && recent[1] !== recent[2] && recent[0] === recent[2]) {
        // Ping pong pattern detected
        this.predictions.nextChatId = recent[1]
        this.predictions.confidenceScore = 0.85
        return { chatId: recent[1], confidence: 0.85 }
      }
    }

    // Fall back to most frequent
    if (frequentChats && frequentChats.length > 0) {
      this.predictions.nextChatId = frequentChats[0]
      this.predictions.confidenceScore = 0.6
      return { chatId: frequentChats[0], confidence: 0.6 }
    }

    return null
  }

  /**
   * Predict likely next action based on message count and typing patterns
   */
  predictNextAction(messageCount, typingSpeed, isPausing, roomMood) {
    let action = null
    let confidence = 0

    // If user just received messages, predict they'll read/react
    if (messageCount > 3) {
      action = 'react'
      confidence = 0.7
    }

    // If fast typing with no pause, predict they're composing
    if (typingSpeed === 'fast' && !isPausing) {
      action = 'compose'
      confidence = 0.8
    }

    // If pausing after typing, predict they might search or switch
    if (isPausing && typingSpeed !== 'slow') {
      action = typingSpeed === 'fast' ? 'search' : 'browse'
      confidence = 0.6
    }

    // If in calm/deep mood, predict longer engagement
    if (roomMood === 'deep' || roomMood === 'calm') {
      action = 'browse'
      confidence = 0.65
    }

    this.predictions.likelyAction = action
    this.predictions.confidenceScore = confidence

    return { action, confidence }
  }

  /**
   * Estimate time until next action
   * Based on typing patterns and session activity
   */
  estimateTimeToAction(typingSpeed, sessionDuration) {
    let estimatedMs = 60000 // 1 minute default

    if (typingSpeed === 'fast') {
      estimatedMs = 30000 // 30 seconds - active user
    } else if (typingSpeed === 'slow') {
      estimatedMs = 120000 // 2 minutes - more deliberate
    }

    // Adjust for session length
    if (sessionDuration < 300) {
      // First 5 min - user is ramped up
      estimatedMs *= 0.8
    } else if (sessionDuration > 1800) {
      // After 30 min - fatigue sets in
      estimatedMs *= 1.3
    }

    this.predictions.timeToNextAction = estimatedMs
    return estimatedMs
  }

  /**
   * Prioritize sidebar items based on prediction
   * Returns ordered array of chat IDs
   */
  getPrioritizedChats(recentChats, frequentChats, topChats) {
    const prioritized = []
    const seen = new Set()

    // Add predicted next chat first
    if (this.predictions.nextChatId && this.predictions.confidenceScore > 0.6) {
      prioritized.push(this.predictions.nextChatId)
      seen.add(this.predictions.nextChatId)
    }

    // Add recent chats (but not if already added)
    recentChats?.forEach(chat => {
      if (!seen.has(chat) && prioritized.length < 5) {
        prioritized.push(chat)
        seen.add(chat)
      }
    })

    // Add top chats
    topChats?.forEach(chat => {
      if (!seen.has(chat) && prioritized.length < 8) {
        prioritized.push(chat)
        seen.add(chat)
      }
    })

    return prioritized
  }

  /**
   * Should we show search UI?
   * Yes if: user pausing after typing in calm mood
   */
  shouldShowSearch(isPausing, typingSpeed, roomMood) {
    return (
      isPausing &&
      typingSpeed !== 'fast' &&
      (roomMood === 'calm' || roomMood === 'balanced')
    )
  }

  /**
   * Should we show composition assist?
   * Yes if: fast or normal typing in energetic mood
   */
  shouldShowCompositionAssist(typingSpeed, isPausing, roomMood) {
    return (
      !isPausing &&
      typingSpeed !== 'slow' &&
      (roomMood === 'energetic' || roomMood === 'balanced')
    )
  }

  /**
   * Get prediction snapshot
   */
  getSnapshot() {
    return { ...this.predictions }
  }

  /**
   * Reset predictions
   */
  reset() {
    this.predictions = {
      nextChatId: null,
      likelyAction: null,
      confidenceScore: 0,
      timeToNextAction: null,
    }
    this.actionHistory = []
  }
}

// Singleton instance
export const interactionPredictor = new InteractionPredictor()
