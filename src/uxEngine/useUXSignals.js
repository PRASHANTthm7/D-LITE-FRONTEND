import { useEffect, useState, useCallback, useRef, useMemo } from 'react'
import { behaviorTracker } from './behaviorTracker'
import { layoutOptimizer } from './layoutOptimizer'
import { interactionPredictor } from './interactionPredictor'
import { focusModeController } from './focusModeController'

const shallowEqualArray = (arrA = [], arrB = []) => {
  if (arrA === arrB) return true
  if (arrA.length !== arrB.length) return false
  for (let i = 0; i < arrA.length; i += 1) {
    if (arrA[i] !== arrB[i]) return false
  }
  return true
}

const areSignalsEqual = (previous, next) => {
  if (!previous) return false
  if (
    previous.typingSpeed !== next.typingSpeed ||
    previous.isUserPausing !== next.isUserPausing ||
    previous.spacing !== next.spacing ||
    previous.inputMode !== next.inputMode ||
    previous.focusMode !== next.focusMode ||
    previous.nextPredictedChat !== next.nextPredictedChat ||
    previous.likelyAction !== next.likelyAction ||
    previous.shouldShowSearch !== next.shouldShowSearch ||
    previous.shouldShowCompositionAssist !== next.shouldShowCompositionAssist
  ) {
    return false
  }

  if (
    !shallowEqualArray(previous.frequentChats, next.frequentChats) ||
    !shallowEqualArray(previous.recentChats, next.recentChats) ||
    !shallowEqualArray(previous.prioritizedChats, next.prioritizedChats)
  ) {
    return false
  }

  const prevSuggestion = previous.focusModeSuggestion?.message || null
  const nextSuggestion = next.focusModeSuggestion?.message || null

  if (prevSuggestion !== nextSuggestion) {
    return false
  }

  if (
    previous.contextualActions?.showExpandThought !==
      next.contextualActions?.showExpandThought ||
    previous.contextualActions?.showEmojiShortcut !==
      next.contextualActions?.showEmojiShortcut
  ) {
    return false
  }

  return true
}

/**
 * useUXSignals Hook
 * Main hook for components to consume UX engine data
 */
export const useUXSignals = ({
  heatLevel = 'normal',
  roomMood = 'balanced',
  vibeState = 'neutral',
  activityLevel = 0,
  externalFocusMode = false,
} = {}) => {
  const [uxState, setUXState] = useState({
    frequentChats: [],
    recentChats: [],
    typingSpeed: 'normal',
    isUserPausing: false,
    spacing: 'normal',
    inputMode: 'normal',
    focusMode: false,
    nextPredictedChat: null,
    likelyAction: null,
    prioritizedChats: [],
    shouldShowSearch: false,
    shouldShowCompositionAssist: false,
    focusModeSuggestion: null,
    contextualActions: {
      showExpandThought: false,
      showEmojiShortcut: false,
    },
  })

  const dismissedSuggestionRef = useRef(false)
  const lastActivityRef = useRef({
    isTyping: false,
    activityLevel,
  })

  const computeSignals = useCallback(() => {
    const behaviorSnapshot = behaviorTracker.getSnapshot()
    const typingSpeed = behaviorSnapshot.typingSpeed
    const isPausing = behaviorSnapshot.isPausing

    layoutOptimizer.applySpacingForHeat(heatLevel, activityLevel)
    layoutOptimizer.optimizeInputArea(typingSpeed, isPausing)
    layoutOptimizer.setTransitionSpeed(roomMood)
    layoutOptimizer.applyContextualActions(roomMood, vibeState)

    const predictedChat = interactionPredictor.predictNextChat(
      behaviorSnapshot.recentChats,
      behaviorSnapshot.topChats
    )

    const predictedAction = interactionPredictor.predictNextAction(
      behaviorSnapshot.totalInteractions,
      typingSpeed,
      isPausing,
      roomMood
    )

    const prioritizedChats = interactionPredictor.getPrioritizedChats(
      behaviorSnapshot.recentChats,
      behaviorSnapshot.topChats,
      behaviorSnapshot.topChats
    )

    const focusState = focusModeController.getState()
    layoutOptimizer.applyFocusMode(focusState.active)
    const layoutSnapshot = layoutOptimizer.getSnapshot()

    const suggestion = dismissedSuggestionRef.current
      ? null
      : focusModeController.getSuggestion()

    return {
      frequentChats: behaviorSnapshot.topChats,
      recentChats: behaviorSnapshot.recentChats,
      typingSpeed,
      isUserPausing: isPausing,
      spacing: layoutSnapshot.spacing,
      inputMode: layoutSnapshot.inputMode,
      focusMode: focusState.active,
      nextPredictedChat: predictedChat?.chatId || null,
      likelyAction: predictedAction?.action || null,
      prioritizedChats,
      shouldShowSearch: interactionPredictor.shouldShowSearch(
        isPausing,
        typingSpeed,
        roomMood
      ),
      shouldShowCompositionAssist:
        interactionPredictor.shouldShowCompositionAssist(
          typingSpeed,
          isPausing,
          roomMood
        ),
      focusModeSuggestion: suggestion,
      contextualActions: layoutSnapshot.contextualActions,
    }
  }, [activityLevel, heatLevel, roomMood, vibeState])

  const syncSignals = useCallback(() => {
    const nextSignals = computeSignals()
    setUXState((previousSignals) => {
      if (areSignalsEqual(previousSignals, nextSignals)) {
        return previousSignals
      }
      return nextSignals
    })
  }, [computeSignals])

  useEffect(() => {
    focusModeController.setExternalFocusMode(externalFocusMode)
  }, [externalFocusMode])

  useEffect(() => {
    lastActivityRef.current.activityLevel = activityLevel
    focusModeController.updateActivity({
      isTyping: lastActivityRef.current.isTyping,
      activityLevel,
    })
    syncSignals()
  }, [activityLevel, syncSignals])

  useEffect(() => {
    syncSignals()

    const unsubscribeBehavior = behaviorTracker.subscribe(syncSignals)
    const unsubscribeFocus = focusModeController.subscribe(syncSignals)

    const passiveInterval = setInterval(() => {
      focusModeController.updateActivity({
        isTyping: lastActivityRef.current.isTyping,
        activityLevel: lastActivityRef.current.activityLevel,
      })
      focusModeController.checkInactivity()
      syncSignals()
    }, 1000)

    return () => {
      unsubscribeBehavior()
      unsubscribeFocus()
      clearInterval(passiveInterval)
    }
  }, [syncSignals])

  // Track chat access
  const trackChatAccess = useCallback((chatId) => {
    behaviorTracker.trackChatAccess(chatId)
  }, [])

  // Track typing
  const trackTyping = useCallback((payload) => {
    const isTyping =
      typeof payload === 'boolean' ? payload : Boolean(payload?.isTyping)

    lastActivityRef.current.isTyping = isTyping
    behaviorTracker.trackTyping(payload)
    focusModeController.updateActivity({
      isTyping,
      activityLevel: lastActivityRef.current.activityLevel,
    })
    syncSignals()
  }, [syncSignals])

  // Manually adjust layout
  const setSpacing = useCallback((spacingMode) => {
    if (spacingMode === 'compact') {
      layoutOptimizer.applySpacingForHeat('idle', 0)
    } else if (spacingMode === 'relaxed') {
      layoutOptimizer.applySpacingForHeat('high', 100)
    } else {
      layoutOptimizer.applySpacingForHeat('normal', 40)
    }
    syncSignals()
  }, [syncSignals])

  const setInputMode = useCallback((mode) => {
    layoutOptimizer.setInputMode(mode)
    syncSignals()
  }, [syncSignals])

  // Focus mode controls
  const toggleFocusMode = useCallback((enable) => {
    focusModeController.toggleFocusMode(enable)
    dismissedSuggestionRef.current = false
    syncSignals()
  }, [syncSignals])

  const dismissFocusModeSuggestion = useCallback(() => {
    dismissedSuggestionRef.current = true
    syncSignals()
  }, [syncSignals])

  return useMemo(
    () => ({
      ...uxState,
      trackChatAccess,
      trackTyping,
      setSpacing,
      setInputMode,
      toggleFocusMode,
      dismissFocusModeSuggestion,
      getFrequentChats: () => behaviorTracker.getFrequentChats(),
      getRecentChats: () => behaviorTracker.getRecentChats(),
      getPrioritizedChats: () => uxState.prioritizedChats,
    }),
    [
      uxState,
      trackChatAccess,
      trackTyping,
      setSpacing,
      setInputMode,
      toggleFocusMode,
      dismissFocusModeSuggestion,
    ]
  )
}

/**
 * useUXResponsiveness
 * Hook for components that need reactive layout adjustments
 */
export const useUXResponsiveness = (
  heatLevel,
  roomMood,
  vibeState,
  activityLevel = 0,
  focusMode = false
) => {
  useEffect(() => {
    layoutOptimizer.applySpacingForHeat(heatLevel, activityLevel)
    layoutOptimizer.setTransitionSpeed(roomMood)
    layoutOptimizer.applyContextualActions(roomMood, vibeState)
    layoutOptimizer.applyFocusMode(focusMode)
  }, [activityLevel, focusMode, heatLevel, roomMood, vibeState])

  return {
    applySpacing: (heat, activity = 0) =>
      layoutOptimizer.applySpacingForHeat(heat, activity),
    applyContextualActions: (mood, vibe) =>
      layoutOptimizer.applyContextualActions(mood, vibe),
  }
}

/**
 * useBehaviorAnalysis
 * Hook for detailed behavior analytics
 */
export const useBehaviorAnalysis = () => {
  const [analysis, setAnalysis] = useState(null)

  useEffect(() => {
    const update = () => setAnalysis(behaviorTracker.getSnapshot())
    update()
    const unsubscribe = behaviorTracker.subscribe(update)
    const interval = setInterval(update, 1000)

    return () => {
      unsubscribe()
      clearInterval(interval)
    }
  }, [])

  return analysis
}

/**
 * usePredictions
 * Hook for interaction predictions
 */
export const usePredictions = (recentChats, frequentChats) => {
  const [predictions, setPredictions] = useState(null)

  useEffect(() => {
    const updatePredictions = () => {
      const nextChat = interactionPredictor.predictNextChat(
        recentChats,
        frequentChats
      )
      const prioritized = interactionPredictor.getPrioritizedChats(
        recentChats,
        frequentChats,
        frequentChats
      )

      setPredictions({
        nextChat,
        prioritized,
        snapshot: interactionPredictor.getSnapshot(),
      })
    }

    updatePredictions()
    const interval = setInterval(updatePredictions, 1000)

    return () => clearInterval(interval)
  }, [recentChats, frequentChats])

  return predictions
}
