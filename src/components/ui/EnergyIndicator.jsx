import { memo } from 'react'
import { useSentient } from '../../sentient/SentientProvider'

const EnergyIndicator = memo(({ size = 'md' }) => {
  const { energyLevel, heatLevel } = useSentient()

  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  }

  const getHeatColor = () => {
    switch (heatLevel) {
      case 'high':
        return 'bg-red-400'
      case 'medium':
        return 'bg-yellow-400'
      default:
        return 'bg-blue-400'
    }
  }

  return (
    <div className="flex items-center gap-2">
      <div
        className={`${sizeClasses[size]} ${getHeatColor()} rounded-full transition-all duration-500`}
        style={{
          boxShadow: `0 0 ${energyLevel / 10}px currentColor`,
          animation: 'softPulse 2s ease-in-out infinite',
        }}
      />
      <span className="text-xs text-gray-600 font-medium">
        {Math.round(energyLevel)}%
      </span>
    </div>
  )
})

EnergyIndicator.displayName = 'EnergyIndicator'

export default EnergyIndicator
