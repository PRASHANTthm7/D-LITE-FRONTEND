/**
 * Spacing System
 * Comfortable, readable spacing for long chat sessions
 */

export const spacing = {
  // Base scale (4px increments)
  xs: '0.25rem',    // 4px
  sm: '0.5rem',     // 8px
  md: '1rem',       // 16px
  lg: '1.5rem',     // 24px
  xl: '2rem',       // 32px
  '2xl': '3rem',    // 48px
  '3xl': '4rem',    // 64px
  '4xl': '6rem',    // 96px

  // Semantic spacing
  chat: {
    bubblePadding: '0.75rem 1rem',      // Comfortable message padding
    bubbleGap: '0.5rem',                 // Space between messages
    sectionGap: '1.5rem',                // Space between chat sections
    inputPadding: '1rem 1.25rem',        // Input field padding
  },

  sidebar: {
    width: '320px',
    widthCollapsed: '240px',
    padding: '1.5rem',
    itemGap: '0.75rem',
  },

  panel: {
    padding: '1.5rem',
    gap: '1rem',
  },
}

// Line heights for readability
export const lineHeights = {
  tight: '1.25',
  normal: '1.5',
  relaxed: '1.75',
  loose: '2',
  
  // Chat-specific
  message: '1.6',        // Comfortable for reading messages
  input: '1.5',         // Input field line height
}
