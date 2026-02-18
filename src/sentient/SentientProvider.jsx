import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react'
import { usePresence } from '../contexts/PresenceContext'
import { useAI } from '../contexts/AIContext'
import { useChatStore } from '../store/chatStore'
import { useQuantumRoomStore } from '../store/quantumRoomStore'
import { applySentientTheme } from '../designSystem/sentientThemeEngine'

const SentientContext = createContext()

export const useSentient = () => {
  const context = useContext(SentientContext)
  if (!context) {
    throw new Error('useSentient must be used within SentientProvider')
  }
  return context
}

export const SentientProvider = ({ children }) => {
  const { myPresence, presenceMap } = usePresence()
  const { vibeAnalysis } = useAI()
  const { selectedGroup, messages } = useChatStore()
  const { aura, roomSoul, energyWave } = useQuantumRoomStore()

  const [sentientState, setSentientState] = useState({
    roomMood: 'balanced',
    auraColor: '#a5f3fc',
    heatLevel: 'low',
    activityLevel: 0,
    vibeState: 'neutral',
    energyLevel: 0,
    backgroundGradient: [],
    currentMood: 'balanced',
    pulseSpeed: 1.0,
    uiMode: 'normal',
    focusModeActive: false,
  })

  // Calculate collective gradient from room aura and user auras
  const calculateCollectiveGradient = useCallback(() => {
    const gradients = []
    
    // Add room aura if available
    if (aura?.data?.collectiveGradient && aura.data.collectiveGradient.length > 0) {
      gradients.push(...aura.data.collectiveGradient)
    } else if (aura?.data?.roomAuraColor) {
      gradients.push(aura.data.roomAuraColor)
    }

    // Add user auras from presence
    Object.values(presenceMap).forEach(presence => {
      if (presence.auraColor) {
        gradients.push(presence.auraColor)
      }
    })

    // Add my presence aura
    if (myPresence?.auraColor) {
      gradients.push(myPresence.auraColor)
    }

    // Fallback to default gradient
    if (gradients.length === 0) {
      gradients.push('#f5f3ff', '#ede9fe', '#ddd6fe')
    }

    return gradients
  }, [aura, presenceMap, myPresence])

  // Update sentient state based on all sources
  useEffect(() => {
    const newState = {
      roomMood: roomSoul?.data?.roomMood || 'balanced',
      auraColor: aura?.data?.roomAuraColor || myPresence?.auraColor || '#a5f3fc',
      heatLevel: myPresence?.heatLevel || 'low',
      activityLevel: myPresence?.activityLevel || 0,
      vibeState: vibeAnalysis?.vibeState || 'neutral',
      energyLevel: roomSoul?.data?.roomEnergyLevel || energyWave?.intensity || 0,
      backgroundGradient: calculateCollectiveGradient(),
      currentMood: roomSoul?.data?.roomMood || vibeAnalysis?.vibeState || 'balanced',
      pulseSpeed: energyWave?.pulseSpeed || 1.0,
      uiMode: myPresence?.focusMode ? 'minimal' : 'normal',
      focusModeActive: myPresence?.focusMode || false,
    }

    setSentientState(newState)
    
    // Apply theme to document
    applySentientTheme(newState)
  }, [
    roomSoul,
    aura,
    myPresence,
    vibeAnalysis,
    energyWave,
    calculateCollectiveGradient,
  ])

  // Debounced AI state fetching
  const fetchAIState = useCallback(async () => {
    // This would trigger AI analysis if needed
    // For now, we rely on the AI context
  }, [])

  const contextValue = useMemo(
    () => ({
      sentientState,
      roomMood: sentientState.roomMood,
      auraColor: sentientState.auraColor,
      heatLevel: sentientState.heatLevel,
      activityLevel: sentientState.activityLevel,
      vibeState: sentientState.vibeState,
      energyLevel: sentientState.energyLevel,
      backgroundGradient: sentientState.backgroundGradient,
      currentMood: sentientState.currentMood,
      pulseSpeed: sentientState.pulseSpeed,
      uiMode: sentientState.uiMode,
      focusModeActive: sentientState.focusModeActive,
    }),
    [sentientState]
  )

  return (
    <SentientContext.Provider value={contextValue}>
      {children}
    </SentientContext.Provider>
  )
}
