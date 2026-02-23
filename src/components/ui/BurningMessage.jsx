import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * BurningMessage Component
 * 
 * Flow: idle -> igniting -> burning -> charred -> ashes -> collapsed
 */
const BurningMessage = ({
    children,
    isOwn,
    fireIntensity = 1,
    onBurnComplete
}) => {
    const [burnStage, setBurnStage] = useState('idle') // idle, igniting, burning, charred, ashes, collapsed

    useEffect(() => {
        if (burnStage === 'idle') {
            const timer = setTimeout(() => setBurnStage('igniting'), 100)
            return () => clearTimeout(timer)
        }
        if (burnStage === 'igniting') {
            const timer = setTimeout(() => setBurnStage('burning'), 800)
            return () => clearTimeout(timer)
        }
        if (burnStage === 'burning') {
            const timer = setTimeout(() => setBurnStage('charred'), 1500)
            return () => clearTimeout(timer)
        }
        if (burnStage === 'charred') {
            const timer = setTimeout(() => setBurnStage('ashes'), 400)
            return () => clearTimeout(timer)
        }
        if (burnStage === 'ashes') {
            const timer = setTimeout(() => {
                setBurnStage('collapsed')
                if (onBurnComplete) onBurnComplete()
            }, 1200)
            return () => clearTimeout(timer)
        }
    }, [burnStage, onBurnComplete])

    // Ash particles generation
    const particles = useMemo(() => {
        const count = Math.floor(12 * fireIntensity)
        return Array.from({ length: count }).map((_, i) => ({
            id: i,
            x: (Math.random() - 0.5) * 80, // Random horizontal drift
            y: -Math.random() * 120 - 40,   // Random upward float
            rotation: Math.random() * 360,
            size: Math.random() * 4 + 2,
            delay: Math.random() * 0.5
        }))
    }, [fireIntensity])

    // Animation Variants
    const containerVariants = {
        idle: { scale: 1, filter: 'brightness(1)' },
        igniting: { scale: 1.02, filter: 'brightness(0.95)' },
        burning: {
            scale: 1,
            filter: 'brightness(0.8)',
            skew: [0, 1, -1, 0.5, 0],
            y: [0, -1, 1, -0.5, 0],
            transition: { duration: 0.2, repeat: Infinity }
        },
        charred: {
            backgroundColor: '#333',
            filter: 'brightness(0.4) grayscale(1)',
            scale: 0.98,
            transition: { duration: 0.3 }
        },
        ashes: { opacity: 0, scale: 0.9, transition: { duration: 0.8 } },
        collapsed: { height: 0, padding: 0, margin: 0, opacity: 0, transition: { duration: 0.4 } }
    }

    return (
        <div className="relative w-full overflow-visible">
            <motion.div
                variants={containerVariants}
                animate={burnStage}
                className="relative z-10 origin-bottom"
            >
                {children}

                {/* Heat Glow */}
                <AnimatePresence>
                    {(burnStage === 'igniting' || burnStage === 'burning') && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1.2 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 -z-10 bg-gradient-radial from-orange-500/30 via-transparent to-transparent blur-2xl pointer-events-none"
                            style={{ scale: 1 + (fireIntensity * 0.1) }}
                        />
                    )}
                </AnimatePresence>

                {/* Cinematic Flames */}
                <AnimatePresence>
                    {(burnStage === 'igniting' || burnStage === 'burning') && (
                        <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1 * fireIntensity, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            className={`absolute ${isOwn ? '-left-6' : '-right-6'} bottom-0 pointer-events-none`}
                        >
                            <svg width="40" height="60" viewBox="0 0 40 60" className="drop-shadow-[0_0_8px_rgba(249,115,22,0.8)]">
                                <motion.path
                                    animate={{
                                        d: [
                                            "M20 60 C30 50 40 35 40 20 C40 5 30 0 20 0 C10 0 0 5 0 20 C0 35 10 50 20 60 Z",
                                            "M20 60 C32 48 38 32 38 18 C38 4 28 2 20 2 C12 2 2 4 2 18 C2 32 8 48 20 60 Z",
                                            "M20 60 C28 52 42 38 42 22 C42 6 32 10 20 0 C8 10 0 6 0 22 C0 38 12 52 20 60 Z"
                                        ]
                                    }}
                                    transition={{ repeat: Infinity, duration: 0.4, ease: "easeInOut" }}
                                    fill="url(#fireGradient)"
                                />
                                <defs>
                                    <linearGradient id="fireGradient" x1="0" y1="1" x2="0" y2="0">
                                        <stop offset="0%" stopColor="#ef4444" />
                                        <stop offset="50%" stopColor="#f97316" />
                                        <stop offset="100%" stopColor="#fde047" />
                                    </linearGradient>
                                </defs>
                            </svg>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Ash Particles */}
            <AnimatePresence>
                {burnStage === 'ashes' && (
                    <div className="absolute inset-0 flex items-center justify-center -z-0 pointer-events-none">
                        {particles.map((p) => (
                            <motion.div
                                key={p.id}
                                initial={{ opacity: 0, x: 0, y: 0, rotate: 0 }}
                                animate={{
                                    opacity: [0, 0.8, 0],
                                    x: p.x + (Math.random() * 20 - 10),
                                    y: p.y,
                                    rotate: p.rotation + 720,
                                    scale: [1, 1.2, 0.5]
                                }}
                                transition={{ duration: 1.2, delay: p.delay, ease: "easeOut" }}
                                className="absolute bg-gray-600 rounded-sm"
                                style={{ width: p.size, height: p.size }}
                            />
                        ))}
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default BurningMessage
