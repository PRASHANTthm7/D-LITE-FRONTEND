import { memo, useEffect } from 'react'
import { useSentient } from '../../sentient/SentientProvider'

const SentientBackgroundLayer = memo(() => {
  const { backgroundGradient, pulseSpeed } = useSentient()

  useEffect(() => {
    // Apply background gradient
    const gradient = Array.isArray(backgroundGradient)
      ? `linear-gradient(135deg, ${backgroundGradient.join(', ')})`
      : backgroundGradient || 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 50%, #ddd6fe 100%)'

    document.documentElement.style.setProperty('--sentient-bg', gradient)
    document.documentElement.style.setProperty('--sentient-pulse-speed', `${pulseSpeed || 1.0}s`)
  }, [backgroundGradient, pulseSpeed])

  return (
    <div
      className="fixed inset-0 -z-10 transition-all duration-1000"
      style={{
        background: Array.isArray(backgroundGradient)
          ? `linear-gradient(135deg, ${backgroundGradient.join(', ')})`
          : backgroundGradient || 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 50%, #ddd6fe 100%)',
        backgroundSize: '200% 200%',
        animation: 'sentientBreathe 20s ease-in-out infinite',
      }}
    />
  )
})

SentientBackgroundLayer.displayName = 'SentientBackgroundLayer'

export default SentientBackgroundLayer
