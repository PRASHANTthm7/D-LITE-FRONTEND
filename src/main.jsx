import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import logger from './utils/logger'
import './index.css'

// Global error handlers to prevent crashes
window.addEventListener('error', (event) => {
  logger.error('Global error caught', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    error: event.error?.stack
  })
  // Prevent default error handling to avoid console spam
  event.preventDefault()
})

window.addEventListener('unhandledrejection', (event) => {
  logger.error('Unhandled promise rejection', {
    reason: event.reason,
    error: event.reason?.stack || String(event.reason)
  })
  // Prevent default error handling
  event.preventDefault()
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
