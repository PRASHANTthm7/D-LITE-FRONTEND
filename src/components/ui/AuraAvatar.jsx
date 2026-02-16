import { memo } from 'react'

const AuraAvatar = memo(({ 
  userId,
  avatarUrl,
  name,
  auraColor = '#a5f3fc',
  size = 'md',
  online = false,
  heatLevel = 'low',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20',
  }

  const ringSizes = {
    sm: 'ring-1',
    md: 'ring-2',
    lg: 'ring-3',
    xl: 'ring-4',
  }

  const getInitials = (name) => {
    if (!name) return '?'
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getHeatIntensity = () => {
    switch (heatLevel) {
      case 'high':
        return '0 0 20px rgba(139, 92, 246, 0.6)'
      case 'medium':
        return '0 0 15px rgba(139, 92, 246, 0.4)'
      default:
        return '0 0 10px rgba(139, 92, 246, 0.2)'
    }
  }

  return (
    <div className={`relative ${className}`}>
      {/* Aura ring */}
      <div
        className={`absolute inset-0 rounded-full ${ringSizes[size]} transition-all duration-500`}
        style={{
          borderColor: auraColor,
          boxShadow: getHeatIntensity(),
          animation: 'softPulse 3s ease-in-out infinite',
        }}
      />
      
      {/* Avatar */}
      <div
        className={`${sizeClasses[size]} rounded-full overflow-hidden bg-gradient-to-br from-indigo-200 to-purple-200 flex items-center justify-center text-white font-medium relative z-10`}
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={name || 'User'}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <span className="text-xs">
            {getInitials(name)}
          </span>
        )}
      </div>

      {/* Online indicator */}
      {online && (
        <div
          className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white"
          style={{ boxShadow: '0 0 8px rgba(34, 197, 94, 0.6)' }}
        />
      )}
    </div>
  )
})

AuraAvatar.displayName = 'AuraAvatar'

export default AuraAvatar
