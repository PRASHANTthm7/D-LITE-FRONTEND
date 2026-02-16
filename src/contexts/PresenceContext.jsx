import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { presenceAPI } from '../services/presenceService'
import { useAuthStore } from '../store/authStore'

const PresenceContext = createContext()

export const usePresence = () => {
  const context = useContext(PresenceContext)
  if (!context) {
    throw new Error('usePresence must be used within PresenceProvider')
  }
  return context
}

export const PresenceProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuthStore()
  const [presenceMap, setPresenceMap] = useState({}) // userId -> presence data
  const [myPresence, setMyPresence] = useState(null)
  const [loading, setLoading] = useState(false)

  // Fetch all active presence
  const fetchAllPresence = useCallback(async () => {
    if (!isAuthenticated) return

    try {
      const data = await presenceAPI.getAllActivePresence()
      const map = {}
      data.users.forEach(presence => {
        map[presence.userId] = presence
      })
      setPresenceMap(map)
    } catch (error) {
      console.error('Error fetching presence:', error)
    }
  }, [isAuthenticated])

  // Fetch specific user presence
  const fetchUserPresence = useCallback(async (userId) => {
    try {
      const presence = await presenceAPI.getUserPresence(userId)
      setPresenceMap(prev => ({
        ...prev,
        [userId]: presence
      }))
      return presence
    } catch (error) {
      console.error(`Error fetching presence for ${userId}:`, error)
      return null
    }
  }, [])

  // Fetch my own presence
  const fetchMyPresence = useCallback(async () => {
    if (!user?.id) return

    try {
      const presence = await presenceAPI.getUserPresence(user.id)
      setMyPresence(presence)
      return presence
    } catch (error) {
      console.error('Error fetching my presence:', error)
      return null
    }
  }, [user])

  // Toggle focus mode
  const toggleFocusMode = useCallback(async (enabled) => {
    setLoading(true)
    try {
      const result = await presenceAPI.setFocusMode(enabled)
      setMyPresence(result.presence)
      return result
    } catch (error) {
      console.error('Error toggling focus mode:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  // Toggle invisible mode
  const toggleInvisibleMode = useCallback(async (enabled) => {
    setLoading(true)
    try {
      const result = await presenceAPI.setInvisibleMode(enabled)
      setMyPresence(result.presence)
      return result
    } catch (error) {
      console.error('Error toggling invisible mode:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  // Get presence for a user
  const getPresence = useCallback((userId) => {
    return presenceMap[userId] || null
  }, [presenceMap])

  // Periodic polling for presence updates
  useEffect(() => {
    if (!isAuthenticated) return

    // Initial fetch
    fetchAllPresence()
    fetchMyPresence()

    // Poll every 10 seconds
    const interval = setInterval(() => {
      fetchAllPresence()
      fetchMyPresence()
    }, 10000)

    return () => clearInterval(interval)
  }, [isAuthenticated, fetchAllPresence, fetchMyPresence])

  const value = {
    presenceMap,
    myPresence,
    loading,
    fetchAllPresence,
    fetchUserPresence,
    fetchMyPresence,
    toggleFocusMode,
    toggleInvisibleMode,
    getPresence
  }

  return (
    <PresenceContext.Provider value={value}>
      {children}
    </PresenceContext.Provider>
  )
}
