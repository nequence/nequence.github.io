import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { ensureAuth } from './firebase'
import useGameStore from './store/useGameStore'
import LandingPage from './pages/LandingPage'
import AvatarSelection from './pages/AvatarSelection'
import LobbyRoom from './pages/LobbyRoom'
import GamePage from './pages/GamePage'

function localFallbackUid() {
  let uid = localStorage.getItem('nequence_uid')
  if (!uid) { uid = 'local_' + Math.random().toString(36).slice(2, 10); localStorage.setItem('nequence_uid', uid) }
  return uid
}

function AuthGate({ children }) {
  const setUid = useGameStore(s => s.setUid)
  const uid    = useGameStore(s => s.uid)

  useEffect(() => {
    // Set a local UID immediately so the UI shows; Firebase overwrites if auth succeeds
    setUid(localFallbackUid())
    ensureAuth()
      .then(user => setUid(user.uid))
      .catch(() => {/* already set above */})
  }, [])

  if (!uid) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-void)' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '14px', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>
          LOADING…
        </div>
      </div>
    )
  }
  return children
}

function AnimatedRoutes() {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/"                  element={<LandingPage />} />
        <Route path="/avatar/:roomCode"  element={<AvatarSelection />} />
        <Route path="/lobby/:roomCode"   element={<LobbyRoom />} />
        <Route path="/game/:roomCode"    element={<GamePage />} />
      </Routes>
    </AnimatePresence>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthGate>
        <AnimatedRoutes />
      </AuthGate>
    </BrowserRouter>
  )
}
