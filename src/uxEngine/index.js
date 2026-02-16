/**
 * UX Engine - Zero-Friction UX Module
 * Exports all UX engine components and utilities
 */

// Context & Providers
export { UXEngineProvider, useUXEngine } from './UXEngineProvider'

// Hooks
export { useUXSignals, useUXResponsiveness, useBehaviorAnalysis, usePredictions } from './useUXSignals'

// Core Modules (for advanced usage)
export { behaviorTracker } from './behaviorTracker'
export { layoutOptimizer } from './layoutOptimizer'
export { interactionPredictor } from './interactionPredictor'
export { focusModeController } from './focusModeController'

// Tailwind config
export { uxEngineTailwindConfig, uxEngineCSSVariables, uxEngineTailwindUtilities } from './uxEngineTailwind'
