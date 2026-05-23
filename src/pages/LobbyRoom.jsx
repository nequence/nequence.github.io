import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { DndContext, closestCenter } from '@dnd-kit/core'
import { ref, update, remove } from 'firebase/database'
import { db } from '../firebase'
import useGameStore from '../store/useGameStore'
import { useRoom } from '../hooks/useRoom'
import { buildDeck, handSizeForPlayers, sequencesToWinFor, shuffle } from '../utils/cardUtils'
import TeamColumn from '../components/lobby/TeamColumn'
import HostSettings from '../components/lobby/HostSettings'
import HowToPlay from '../components/ui/HowToPlay'
import PageTransition from '../components/layout/PageTransition'
import ParticleCanvas from '../components/ui/ParticleCanvas'
import AvatarLayers from '../components/avatar/AvatarLayers'

const TEAMS = ['aether','nova','pulse','void']

function buildTurnOrder(playersByTeam, teamCount) {
  const teams = TEAMS.slice(0, teamCount)
  const slots = Math.max(...teams.map(t => (playersByTeam[t] || []).length), 0)
  const order = []
  for (let i = 0; i < slots; i++) {
    for (const t of teams) {
      const p = (playersByTeam[t] || [])[i]
      if (p) order.push(p.uid)
    }
  }
  return order
}

// Animated copy icon — clipboard → check on copy
function CopyButton({ roomCode }) {
  const [state, setState] = useState('idle') // 'idle' | 'copied'

  function handleCopy() {
    const url = `${window.location.origin}/avatar/${roomCode}`
    navigator.clipboard.writeText(url)
    setState('copied')
    setTimeout(() => setState('idle'), 2200)
  }

  return (
    <button
      onClick={handleCopy}
      title="Copy invite link"
      style={{
        background: state === 'copied' ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.14)',
        borderRadius: 10,
        padding: '10px 16px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        color: state === 'copied' ? '#F0F0F0' : '#666',
        transition: 'all 0.2s',
      }}
    >
      <AnimatePresence mode="wait">
        {state === 'idle' ? (
          <motion.svg key="copy" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} transition={{ duration: 0.15 }}
            width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" />
            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
          </motion.svg>
        ) : (
          <motion.svg key="check" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} transition={{ duration: 0.15 }}
            width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#A0F0A0" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </motion.svg>
        )}
      </AnimatePresence>
      <motion.span
        key={state}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.15 }}
        style={{ fontSize: 14, fontWeight: 500, whiteSpace: 'nowrap' }}
      >
        {state === 'copied' ? 'Copied!' : 'Copy link'}
      </motion.span>
    </button>
  )
}

export default function LobbyRoom() {
  const { roomCode } = useParams()
  const navigate = useNavigate()
  const uid      = useGameStore(s => s.uid)
  const players  = useGameStore(s => s.players)
  const roomMeta = useGameStore(s => s.roomMeta)

  const [settings, setSettings] = useState({ teamCount: 2, turnTimerSeconds: 60, confirmPlacement: true, grandMode: 'auto', dualBoard: false, allowLateJoin: false })
  const [starting,  setStarting]  = useState(false)
  const [helpOpen,  setHelpOpen]  = useState(false)
  const [countdown, setCountdown] = useState(null)

  useRoom(roomCode)

  const isHost      = roomMeta?.host === uid
  const playerList  = Object.values(players)
  const teamCount   = settings.teamCount || 2
  const activeTeams = TEAMS.slice(0, teamCount)
  const myPlayer    = players[uid]

  useEffect(() => { if (roomMeta?.status === 'playing') navigate(`/game/${roomCode}`) }, [roomMeta?.status])
  useEffect(() => { if (roomMeta?.settings) setSettings(s => ({ ...s, ...roomMeta.settings })) }, [roomMeta?.settings])

  const playersByTeam = {}
  for (const t of activeTeams) playersByTeam[t] = []
  for (const p of playerList) {
    const t = activeTeams.includes(p.team) ? p.team : activeTeams[0]
    if (!playersByTeam[t]) playersByTeam[t] = []
    playersByTeam[t].push(p)
  }

  async function handleSettingsChange(s) {
    setSettings(s)
    if (isHost) await update(ref(db, `rooms/${roomCode}/meta/settings`), s).catch(console.error)
  }

  async function handleKick(kickUid) { await remove(ref(db, `rooms/${roomCode}/players/${kickUid}`)) }

  async function handleStart() {
    if (!isHost || playerList.length < 2) return
    setStarting(true)
    for (let i = 3; i >= 1; i--) { setCountdown(i); await new Promise(r => setTimeout(r, 1000)) }
    setCountdown(0)
    try {
      const deck      = buildDeck()
      const handSize  = settings.handSize    ?? handSizeForPlayers(playerList.length)
      const seqToWin  = settings.sequencesToWin ?? sequencesToWinFor(teamCount, playerList.length)
      const turnOrder = shuffle(buildTurnOrder(playersByTeam, teamCount))
      const hands = {}
      let cur = 0
      for (const p of playerList) { hands[p.uid] = deck.slice(cur, cur + handSize); cur += handSize }
      const teamsData = {}
      for (const t of activeTeams) teamsData[t] = { playerIds: (playersByTeam[t]||[]).map(p=>p.uid), sequencesCompleted:0, chipsOnBoard:0 }
      const upd = {
        [`rooms/${roomCode}/meta/status`]: 'playing',
        [`rooms/${roomCode}/meta/settings/sequencesToWin`]: seqToWin,
        [`rooms/${roomCode}/meta/settings/handSize`]: handSize,
        [`rooms/${roomCode}/game`]: { phase:'playing', turnOrder, currentTurn:turnOrder[0], turnNumber:1, turnStartedAt:Date.now(), deck:deck.slice(cur), deckRemaining:deck.length-cur, board:{}, sequences:[], log:{}, settings:{...settings,sequencesToWin:seqToWin,handSize,teamCount} },
        [`rooms/${roomCode}/teams`]: teamsData,
      }
      for (const [pid, hand] of Object.entries(hands)) upd[`rooms/${roomCode}/hands/${pid}`] = hand
      await update(ref(db, '/'), upd)
    } catch (e) { console.error(e); setCountdown(null) } finally { setStarting(false) }
  }

  function handleDragEnd({ active, over }) {
    if (!over || !isHost) return
    const targetTeam = over.id.replace('team-', '')
    if (activeTeams.includes(targetTeam)) {
      update(ref(db, `rooms/${roomCode}/players/${active.id}`), { team: targetTeam }).catch(console.error)
    }
  }

  const canStart = playerList.length >= 2

  return (
    <PageTransition>
      <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>

        {/* Particle background */}
        <ParticleCanvas count={70} />

        {/* Everything else sits above the canvas */}
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', flex: 1 }}>

          {/* Header */}
          <header style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 28px', borderBottom: '1px solid var(--border-dim)',
            background: 'rgba(8,8,8,0.7)', backdropFilter: 'blur(12px)',
          }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 17, letterSpacing: '0.08em' }}>NEQUENCE</div>
            <button onClick={() => setHelpOpen(true)} style={{ background: 'none', border: '1px solid var(--border-dim)', borderRadius: 6, color: 'var(--text-muted)', padding: '4px 12px', cursor: 'pointer', fontSize: 13 }}>?</button>
          </header>

          {/* Hero — avatar + room code + copy */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 28, padding: '36px 28px 24px', flexWrap: 'wrap' }}>

            {/* Full-body avatar */}
            {myPlayer && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <div style={{ borderRadius: 16, overflow: 'hidden', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-dim)', width: 100, height: 134 }}>
                  <AvatarLayers config={myPlayer.avatar} teamColor={myPlayer.team} size={100} />
                </div>
                <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>
                  {myPlayer.username || 'You'}
                </span>
              </div>
            )}

            {/* Room code + copy */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Room Code
              </div>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 42,
                fontWeight: 700,
                letterSpacing: '0.18em',
                color: '#F0F0F0',
                lineHeight: 1,
              }}>
                {roomCode}
              </div>
              <CopyButton roomCode={roomCode} />
              <div style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center' }}>
                Share the link — friends pick their avatar on join
              </div>
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: 'var(--border-dim)', margin: '0 28px' }} />

          {/* Body */}
          <div style={{ flex: 1, padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 1000, margin: '0 auto', width: '100%' }}>

            {/* Team columns */}
            <DndContext onDragEnd={handleDragEnd} collisionDetection={closestCenter}>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {activeTeams.map(t => (
                  <TeamColumn key={t} teamId={t} players={playersByTeam[t]||[]} isHost={isHost} onKick={handleKick} />
                ))}
              </div>
            </DndContext>

            {/* Host settings */}
            {isHost && <HostSettings settings={settings} onChange={handleSettingsChange} playerCount={playerList.length} />}

            {/* Start / wait */}
            <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 8 }}>
              {isHost ? (
                <button
                  onClick={handleStart}
                  disabled={starting || !canStart}
                  style={{
                    padding: '15px 52px',
                    background: canStart && !starting ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.06)',
                    color: canStart && !starting ? '#0E0E0E' : 'var(--text-muted)',
                    border: 'none', borderRadius: 10,
                    fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 15,
                    cursor: canStart && !starting ? 'pointer' : 'not-allowed',
                    letterSpacing: '0.02em', transition: 'all 0.15s',
                  }}
                >
                  {starting ? 'Starting…' : !canStart ? `Need 2+ players (${playerList.length}/2)` : '▶  Start Game'}
                </button>
              ) : (
                <motion.div
                  animate={{ opacity: [0.45, 1, 0.45] }}
                  transition={{ duration: 2.2, repeat: Infinity }}
                  style={{ color: 'var(--text-muted)', fontSize: 15, display: 'flex', alignItems: 'center', gap: 8 }}
                >
                  Waiting for host to start…
                </motion.div>
              )}
            </div>
          </div>
        </div>

        {/* Countdown overlay */}
        <AnimatePresence>
          {countdown !== null && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ position: 'fixed', inset: 0, background: 'rgba(8,8,8,0.92)', backdropFilter: 'blur(20px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
            >
              <motion.div key={countdown}
                initial={{ scale: 1.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.7, opacity: 0 }}
                style={{ fontFamily: 'var(--font-display)', fontSize: 120, fontWeight: 800, color: '#fff', letterSpacing: '0.04em' }}
              >
                {countdown === 0 ? 'GO' : countdown}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <HowToPlay open={helpOpen} onClose={() => setHelpOpen(false)} />
      </div>
    </PageTransition>
  )
}
