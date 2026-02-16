import { memo } from 'react'
import { useSentient } from '../../sentient/SentientProvider'

const MoodHeader = memo(() => {
  const { currentMood, roomMood, energyLevel } = useSentient()

  const moodEmojis = {
    calm: '🧘',
    focused: '🎯',
    meditative: '✨',
    balanced: '⚖️',
    chaotic: '🌀',
    deep: '🌊',
    funny: '😄',
    neutral: '😐',
  }

  const moodLabels = {
    calm: 'Calm',
    focused: 'Focused',
    meditative: 'Meditative',
    balanced: 'Balanced',
    chaotic: 'Chaotic',
    deep: 'Deep',
    funny: 'Funny',
    neutral: 'Neutral',
  }

  const displayMood = currentMood || roomMood || 'balanced'

  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-white/40 backdrop-blur-sm rounded-lg border border-white/30">
      <div className="text-2xl">
        {moodEmojis[displayMood] || moodEmojis.balanced}
      </div>
      <div className="flex-1">
        <div className="text-sm font-medium text-gray-700">
          {moodLabels[displayMood] || 'Balanced'}
        </div>
        <div className="text-xs text-gray-500">
          Energy: {Math.round(energyLevel)}%
        </div>
      </div>
      <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full transition-all duration-500"
          style={{ width: `${Math.min(energyLevel, 100)}%` }}
        />
      </div>
    </div>
  )
})

MoodHeader.displayName = 'MoodHeader'

export default MoodHeader
