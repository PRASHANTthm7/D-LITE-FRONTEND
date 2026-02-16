import { createContext, useContext, useMemo } from 'react'
import { useUXSignals, useUXResponsiveness } from './useUXSignals'
import { useSentient } from '../sentient/SentientProvider'

const UXContext = createContext()

/**
 * useUXEngine Hook
 * Access UX signals anywhere in the app
 */
export const useUXEngine = () => {
  const context = useContext(UXContext)
  if (!context) {
    throw new Error('useUXEngine must be used within UXEngineProvider')
  }
  return context
}

/**
 * UXEngineProvider Component
 * Wraps the app to provide UX engine functionality
 */
export const UXEngineProvider = ({
  children,
  heatLevel: overrideHeatLevel,
  roomMood: overrideRoomMood,
  vibeState: overrideVibeState,
  activityLevel: overrideActivityLevel,
  focusMode: overrideFocusMode,
}) => {
  const sentient = useSentient()

  const heatLevel = overrideHeatLevel ?? sentient?.heatLevel ?? 'normal'
  const roomMood = overrideRoomMood ?? sentient?.roomMood ?? 'balanced'
  const vibeState = overrideVibeState ?? sentient?.vibeState ?? 'neutral'
  const activityLevel = overrideActivityLevel ?? sentient?.activityLevel ?? 0
  const externalFocusMode = overrideFocusMode ?? sentient?.focusModeActive ?? false

  // Get all UX signals
  const uxSignals = useUXSignals({
    heatLevel,
    roomMood,
    vibeState,
    activityLevel,
    externalFocusMode,
  })

  // Apply responsiveness
  useUXResponsiveness(
    heatLevel,
    roomMood,
    vibeState,
    activityLevel,
    uxSignals.focusMode
  )

  // Memoize context value
  const contextValue = useMemo(
    () => ({
      signals: uxSignals,
      config: {
        heatLevel,
        roomMood,
        vibeState,
        activityLevel,
        externalFocusMode,
      },
    }),
    [
      uxSignals,
      heatLevel,
      roomMood,
      vibeState,
      activityLevel,
      externalFocusMode,
    ]
  )

  return (
    <UXContext.Provider value={contextValue}>
      {children}
    </UXContext.Provider>
  )
}

export default UXEngineProvider
