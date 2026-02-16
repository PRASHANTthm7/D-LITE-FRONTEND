import { create } from 'zustand'
import quantumRoomService from '../services/quantumRoomService'

const useQuantumRoomStore = create((set, get) => ({
  aura: null,
  roomSoul: null,
  energyWave: null,
  loading: false,
  error: null,

  fetchRoomAura: async (roomId) => {
    try {
      const aura = await quantumRoomService.getRoomAura(roomId)
      set({ aura })
      return aura
    } catch (error) {
      console.error('Error fetching room aura:', error)
      set({ error: error.message })
      return null
    }
  },

  fetchRoomSoul: async (roomId) => {
    try {
      const roomSoul = await quantumRoomService.getRoomSoul(roomId)
      set({ roomSoul })
      return roomSoul
    } catch (error) {
      console.error('Error fetching room soul:', error)
      set({ error: error.message })
      return null
    }
  },

  fetchEnergyWave: async (roomId) => {
    try {
      const energyWave = await quantumRoomService.getEnergyWave(roomId)
      set({ energyWave })
      return energyWave
    } catch (error) {
      console.error('Error fetching energy wave:', error)
      set({ error: error.message })
      return null
    }
  },

  refreshRoomData: async (roomId) => {
    if (!roomId) return
    const [aura, soul, wave] = await Promise.all([
      get().fetchRoomAura(roomId),
      get().fetchRoomSoul(roomId),
      get().fetchEnergyWave(roomId),
    ])
    return { aura, soul, wave }
  },
}))

export { useQuantumRoomStore }
export default useQuantumRoomStore
