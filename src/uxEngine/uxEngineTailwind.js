/**
 * UX Engine Tailwind Utilities
 * CSS Variables and custom utilities for adaptive UX
 */

// This file should be imported in your main.jsx or index.css

export const uxEngineTailwindConfig = {
  extend: {
    // CSS Variables for dynamic UX adjustments
    spacing: {
      'ux-compact': 'var(--ux-chat-gap, 0.5rem)',
      'ux-normal': 'var(--ux-chat-gap, 0.75rem)',
      'ux-relaxed': 'var(--ux-chat-gap, 1rem)',
    },

    // Custom animation timings
    transitionDuration: {
      'ux-calm': '500ms',
      'ux-normal': '300ms',
      'ux-snappy': '150ms',
    },

    // Opacity utilities for panel visibility
    opacity: {
      'ux-hidden': 'var(--ux-panels-hidden-opacity, 0)',
      'ux-faded': 'var(--ux-panels-faded-opacity, 0.3)',
      'ux-normal': 'var(--ux-panels-normal-opacity, 1)',
    },
  },
}

// Inject CSS variables as string to add to global styles
export const uxEngineCSSVariables = `
  :root {
    /* Spacing multiplier */
    --ux-spacing-multiplier: 1;
    --ux-chat-gap: 0.75rem;
    --ux-panel-padding: calc(1rem * var(--ux-spacing-multiplier));

    /* Input area */
    --ux-input-height: 64px;
    --ux-input-transition: 300ms ease-in-out;
    --ux-suggestions-visible: 1;

    /* Panel visibility */
    --ux-panel-sidebar-visible: 1;
    --ux-panel-suggestions-visible: 1;
    --ux-panel-reactions-visible: 1;
    --ux-panel-quickActions-visible: 1;
    --ux-panels-hidden-opacity: 0.15;
    --ux-panels-faded-opacity: 0.4;
    --ux-panels-normal-opacity: 1;

    /* Focus mode */
    --ux-focus-mode: 0;
    --ux-focus-chat-opacity: 1;
    --ux-focus-panels-opacity: 1;
    --ux-focus-sidebar-width: auto;
    --ux-focus-margin: 0;
    --ux-focus-max-width: none;
    --ux-focus-transition: 300ms ease-in-out;

    /* Contextual actions */
    --ux-actions-visible: 1;
    --ux-actions-opacity: 0.8;
    --ux-action-expand-visible: 0;
    --ux-action-emoji-visible: 0;

    /* Soft attention */
    --ux-attention-mention: 0.5;
    --ux-attention-reply: 0.5;
    --ux-attention-focus-chat: 0.5;

    /* Transitions */
    --ux-transition-duration: 300ms;
    --ux-transition-timing: ease-in-out;

    /* Chat layout */
    --ux-chat-width: auto;
  }

  /* Responsive layout based on data attributes */
  [data-ux-input-mode="collapsed"] {
    --ux-input-height: 48px;
    --ux-suggestions-visible: 0.3;
  }

  [data-ux-input-mode="expanded"] {
    --ux-input-height: auto;
    --ux-suggestions-visible: 1;
  }

  [data-focus-mode="true"] {
    --ux-focus-mode: 1;
    --ux-focus-panels-opacity: 0.2;
    --ux-focus-chat-opacity: 1;
  }

  [data-focus-mode="false"] {
    --ux-focus-mode: 0;
    --ux-focus-panels-opacity: 1;
    --ux-focus-chat-opacity: 1;
  }
`

// Tailwind utility classes to add
export const uxEngineTailwindUtilities = `
  @layer utilities {
    /* Layout responsiveness */
    .ux-spacing-compact {
      gap: var(--ux-chat-gap, 0.5rem);
      padding: calc(0.5rem * var(--ux-spacing-multiplier));
    }

    .ux-spacing-normal {
      gap: var(--ux-chat-gap, 0.75rem);
      padding: calc(1rem * var(--ux-spacing-multiplier));
    }

    .ux-spacing-relaxed {
      gap: var(--ux-chat-gap, 1rem);
      padding: calc(1.5rem * var(--ux-spacing-multiplier));
    }

    /* Input area */
    .ux-input-container {
      height: var(--ux-input-height);
      transition: height var(--ux-input-transition);
    }

    .ux-input-expandable {
      transition: all var(--ux-input-transition);
    }

    /* Panel visibility with smooth transitions */
    .ux-panel {
      opacity: var(--ux-panels-normal-opacity);
      transition: opacity var(--ux-transition-duration) var(--ux-transition-timing);
    }

    .ux-panel-sidebar {
      opacity: calc(var(--ux-panel-sidebar-visible) * var(--ux-panels-normal-opacity));
    }

    .ux-panel-suggestions {
      opacity: calc(var(--ux-panel-suggestions-visible) * var(--ux-panels-normal-opacity));
    }

    .ux-panel-reactions {
      opacity: calc(var(--ux-panel-reactions-visible) * var(--ux-panels-normal-opacity));
    }

    .ux-panel-quick-actions {
      opacity: calc(var(--ux-panel-quickActions-visible) * var(--ux-actions-opacity));
    }

    /* Focus mode styling */
    .ux-focus-chat {
      opacity: var(--ux-focus-chat-opacity);
      max-width: var(--ux-chat-width);
      margin: var(--ux-focus-margin);
      transition: all var(--ux-focus-transition);
    }

    .ux-focus-hidden {
      opacity: var(--ux-focus-panels-opacity);
      transition: opacity var(--ux-focus-transition);
    }

    /* Soft attention for important elements */
    .ux-attention-mention {
      --attention-level: var(--ux-attention-mention);
      opacity: calc(0.6 + (var(--attention-level) * 0.4));
    }

    .ux-attention-reply {
      --attention-level: var(--ux-attention-reply);
      opacity: calc(0.5 + (var(--attention-level) * 0.5));
    }

    .ux-attention-focus-chat {
      --attention-level: var(--ux-attention-focus-chat);
      opacity: calc(0.7 + (var(--attention-level) * 0.3));
    }

    /* Smooth transitions */
    .ux-smooth-transition {
      transition: all var(--ux-transition-duration) var(--ux-transition-timing);
    }

    .ux-transition-fast {
      transition-duration: 150ms;
    }

    .ux-transition-slow {
      transition-duration: 500ms;
    }

    /* Larger hit areas for accessibility */
    .ux-touch-target {
      min-height: 44px;
      min-width: 44px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    /* Hover states for better feedback */
    .ux-hover-lift {
      transition: transform var(--ux-transition-duration) var(--ux-transition-timing),
                  box-shadow var(--ux-transition-duration) var(--ux-transition-timing);
    }

    .ux-hover-lift:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(139, 92, 246, 0.15);
    }

    /* Calm layout with reduced motion */
    .ux-calm-layout {
      transition-duration: 500ms;
      letter-spacing: 0.3px;
    }

    /* Compact layout for high activity */
    .ux-compact-layout {
      gap: 0.5rem;
      padding: 0.5rem;
    }

    /* Sensible defaults for UX elements */
    .ux-chat-item {
      @apply ux-smooth-transition ux-touch-target p-3 rounded-lg;
      cursor: pointer;
    }

    .ux-chat-item:hover {
      @apply bg-purple-100 dark:bg-purple-900/20;
    }

    .ux-interaction-button {
      @apply ux-touch-target ux-hover-lift p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30;
    }

    /* Priority sidebar positioning */
    .ux-priority-1 {
      order: 1;
    }

    .ux-priority-2 {
      order: 2;
    }

    .ux-priority-3 {
      order: 3;
    }

    .ux-priority-4 {
      order: 4;
    }

    .ux-priority-5 {
      order: 5;
    }
  }
`
