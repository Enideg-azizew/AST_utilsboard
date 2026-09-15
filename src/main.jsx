import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import ErrorBoundary from './components/ErrorBoundary'
import './index.css'
// Service worker registration is handled by vite-plugin-pwa (see vite.config.js),
// which injects its own registration script — no manual registration needed here.
// (A second, hand-written registration used to live in this file and raced with it.)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
)
