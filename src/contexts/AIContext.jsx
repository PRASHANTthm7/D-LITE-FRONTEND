import React, { createContext, useContext, useState, useEffect } from 'react'
import aiService from '../services/aiService'
import { useAuthStore } from '../store/authStore'
import { useChatStore } from '../store/chatStore'

const AIContext = createContext()

export const AIProvider = ({ children }) => {
  const { user } = useAuthStore()
  const { messages, selectedUser, selectedGroup } = useChatStore()
  const [smartSuggestions, setSmartSuggestions] = useState([])
  const [vibeAnalysis, setVibeAnalysis] = useState(null)
  const [aiProfile, setAiProfile] = useState(null)

  // Generate suggestions when messages change
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!messages || messages.length === 0) return
      if (!user?.id) return

      const lastMessages = messages.slice(-5).map(m => m.content || m.text || '')
      const suggestions = await aiService.generateReplies(lastMessages, user)
      setSmartSuggestions(suggestions || [])
    }

    fetchSuggestions()
  }, [messages, user])

  // Fetch AI profile on load
  useEffect(() => {
    if (user?.id) {
      aiService.getProfile(user.id).then(profile => {
        if (profile) setAiProfile(profile)
      })
    }
  }, [user])

  const analyzeInput = async (text) => {
    if (!user?.id) return
    const analysis = await aiService.analyzeMessage(text, user.id)
    setVibeAnalysis(analysis)
    return analysis
  }

  const predictPresence = async () => {
    if (!user?.id) return
    const prediction = await aiService.predictPresence(user.id, [])
    return prediction
  }

  return (
    <AIContext.Provider value={{
      smartSuggestions,
      vibeAnalysis,
      aiProfile,
      analyzeInput,
      predictPresence
    }}>
      {children}
    </AIContext.Provider>
  )
}

export const useAI = () => useContext(AIContext)
