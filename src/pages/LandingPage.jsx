import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ref, set, get } from 'firebase/database'
import { db } from '../firebase'
import { generateRoomCode, normalizeCode } from '../utils/roomCode'
import useGameStore from '../store/useGameStore'
import Button from '../components/ui/Button'
import HowToPlay from '../components/ui/HowToPlay'
import PageTransition from '../components/layout/PageTransition'

const stagger = { animate: { transition: { staggerChildren: 0.07 } } }
const item    = { initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } } }

export default function LandingPage() {
  const navigate    = useNavigate()
  const uid         = useGameStore(s => s.uid)
  const setRoomCode = useGameStore(s => s.setRoomCode)

  const [joinCode, setJoinCode]   = useState('')
  const [creating, setCreating]   = useState(false)
  const [joining, setJoining]     = useState(false)
  const [joinError, setJoinError] = useState('')
  const [helpOpen, setHelpOpen]   = useState(false)
  const [shaking, setShaking]     = useState(false)

  function shakeInput() { setShaking(true); setTimeout(() => setShaking(false), 500) }

  async function handleCreate() {
    setCreating(true)
    try {
      const code = generateRoomCode()
      await set(ref(db, `rooms/${code}/meta`), {
        host: uid, status: 'lobby', createdAt: Date.now(), expiresAt: Date.now() + 86400000,
        settings: { teamCount: 2, sequencesToWin: null, handSize: null, turnTimerSeconds: 60, grandMode: 'auto', dualBoard: false, confirmPlacement: true, allowLateJoin: false },
      })
      await set(ref(db, `rooms/${code}/players/${uid}`), {
        uid, username: '', isHost: true, team: 'aether', joinedAt: Date.now(), connected: true,
        avatar: { body: 0, skin: 0, outfit: 0, hairStyle: 0, hairColor: 0, expression: 0, accessory: 0 },
      })
      setRoomCode(code)
      navigate(`/avatar/${code}`)
    } catch (e) { console.error(e) } finally { setCreating(false) }
  }

  async function handleJoin() {
    const code = normalizeCode(joinCode)
    if (code.length < 6) { setJoinError('Enter a 6-character room code'); shakeInput(); return }
    setJoining(true); setJoinError('')
    try {
      const snap = await get(ref(db, `rooms/${code}/meta`))
      if (!snap.exists()) { setJoinError('Room not found'); shakeInput(); return }
      if (snap.val().status === 'finished') { setJoinError('This game has ended'); shakeInput(); return }
      await set(ref(db, `rooms/${code}/players/${uid}`), {
        uid, username: '', isHost: false, team: 'nova', joinedAt: Date.now(), connected: true,
        avatar: { body: 0, skin: 0, outfit: 0, hairStyle: 0, hairColor: 0, expression: 0, accessory: 0 },
      })
      setRoomCode(code); navigate(`/avatar/${code}`)
    } catch (e) { setJoinError('Failed to join room'); shakeInput() } finally { setJoining(false) }
  }

  return (
    <PageTransition>
      <div style={{
        minHeight: '100vh',
        background: 'var(--bg-void)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
        position: 'relative',
      }}>
        <motion.div
          variants={stagger}
          initial="initial"
          animate="animate"
          style={{ width: '100%', maxWidth: 420, display: 'flex', flexDirection: 'column', gap: '40px' }}
        >
          {/* Logo block */}
          <motion.div variants={item} style={{ textAlign: 'center' }}>
            <div style={{
              fontFamily: 'var(--font-brand)',
              fontWeight: 800,
              fontSize: 'clamp(28px, 6.5vw, 46px)',
              letterSpacing: '0.05em',
              color: '#FFFFFF',
              lineHeight: 1,
              marginBottom: '10px',
            }}>
              NEQUENCE
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '16px', letterSpacing: '0.01em' }}>
              The strategy card game, reimagined.
            </div>
          </motion.div>

          {/* Actions block */}
          <motion.div variants={item} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* Create */}
            <Button onClick={handleCreate} disabled={creating || !uid} fullWidth style={{ padding: '16px', fontSize: '16px' }}>
              {creating ? 'Creating room…' : '+ Create Room'}
            </Button>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '4px 0' }}>
              <div style={{ flex: 1, height: 1, background: 'var(--border-dim)' }} />
              <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>or join one</span>
              <div style={{ flex: 1, height: 1, background: 'var(--border-dim)' }} />
            </div>

            {/* Join */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <motion.input
                value={joinCode}
                onChange={e => { setJoinCode(normalizeCode(e.target.value)); setJoinError('') }}
                onKeyDown={e => e.key === 'Enter' && handleJoin()}
                placeholder="ROOM CODE"
                maxLength={6}
                animate={shaking ? { x: [-5, 5, -5, 5, 0] } : {}}
                transition={{ duration: 0.35 }}
                style={{
                  flex: 1,
                  background: 'var(--bg-surface)',
                  border: joinError ? '1px solid rgba(255,255,255,0.3)' : '1px solid var(--border-subtle)',
                  borderRadius: '10px',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '16px',
                  letterSpacing: '0.18em',
                  padding: '15px 16px',
                  outline: 'none',
                  textTransform: 'uppercase',
                  textAlign: 'center',
                  transition: 'border 0.15s',
                }}
              />
              <Button onClick={handleJoin} disabled={joining || !uid} style={{ padding: '15px 24px', fontSize: '16px' }}>
                {joining ? '…' : 'Join'}
              </Button>
            </div>

            <AnimatePresence>
              {joinError && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  style={{ color: 'var(--text-secondary)', fontSize: '15px', textAlign: 'center' }}
                >
                  {joinError}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>

          {/* How to play */}
          <motion.div variants={item} style={{ textAlign: 'center' }}>
            <button
              onClick={() => setHelpOpen(true)}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '15px', cursor: 'pointer', fontFamily: 'var(--font-body)', letterSpacing: '0.02em' }}
            >
              How to Play
            </button>
          </motion.div>
        </motion.div>

        <HowToPlay open={helpOpen} onClose={() => setHelpOpen(false)} />
      </div>
    </PageTransition>
  )
}
