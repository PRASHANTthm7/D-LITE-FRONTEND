/**
 * Motion Tokens
 * Slow, calm animations for emotional comfort
 */

export const motionTokens = {
  // Duration (slow and calm)
  duration: {
    instant: '0ms',
    fast: '200ms',
    normal: '400ms',
    slow: '600ms',
    verySlow: '1000ms',
  },

  // Easing functions (smooth, natural)
  easing: {
    linear: 'linear',
    ease: 'ease',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    calm: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)', // Very smooth
  },

  // Animation presets
  animations: {
    // Soft pulse (for aura, energy indicators)
    softPulse: {
      keyframes: `
        @keyframes softPulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.02); }
        }
      `,
      animation: 'softPulse 3s ease-in-out infinite',
    },

    // Aura glow (gentle breathing effect)
    auraGlow: {
      keyframes: `
        @keyframes auraGlow {
          0%, 100% { 
            box-shadow: 0 0 20px rgba(139, 92, 246, 0.2);
            opacity: 0.7;
          }
          50% { 
            box-shadow: 0 0 30px rgba(139, 92, 246, 0.4);
            opacity: 1;
          }
        }
      `,
      animation: 'auraGlow 4s ease-in-out infinite',
    },

    // Gentle fade (for transitions)
    gentleFade: {
      keyframes: `
        @keyframes gentleFade {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `,
      animation: 'gentleFade 400ms ease-out',
    },

    // Sentient breathe (for background)
    sentientBreathe: {
      keyframes: `
        @keyframes sentientBreathe {
          0%, 100% { 
            background-position: 0% 50%;
            opacity: 0.95;
          }
          50% { 
            background-position: 100% 50%;
            opacity: 1;
          }
        }
      `,
      animation: 'sentientBreathe 20s ease-in-out infinite',
    },
  },

  // Transition presets
  transitions: {
    default: 'all 300ms ease',
    color: 'color 300ms ease, background-color 300ms ease',
    transform: 'transform 300ms ease',
    opacity: 'opacity 400ms ease',
    all: 'all 400ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  },
}

export default motionTokens
