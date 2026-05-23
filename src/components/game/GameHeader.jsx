import { useState } from 'react'
import AvatarPreview from '../avatar/AvatarPreview'
import TimerRing from './TimerRing'
import HowToPlay from '../ui/HowToPlay'

const TEAM_COLORS = { aether: '#7C3AED', nova: '#D97706', pulse: '#E11D48', void: '#0D9488' }
const TEAM_NAMES  = { aether: 'Aether', nova: 'Nova', pulse: 'Pulse', void: 'Void' }

export default function GameHeader({ roomCode, currentPlayer, players = {}, game = {} }) {
  const [helpOpen, setHelpOpen] = useState(false)
  const activePlayer  = players[currentPlayer]
  const activeTeam    = activePlayer?.team
  const chipColor     = TEAM_COLORS[activeTeam]
  const turnDuration  = game?.settings?.turnTimerSeconds
  const turnStartedAt = game?.turnStartedAt

  return (
    <>
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 20px',
        borderBottom: '1px solid var(--border-dim)',
        background: 'var(--bg-void)',
        gap: '16px', flexShrink: 0,
      }}>
        {/* Logo */}
        <div style={{ fontFamily: 'var(--font-brand)', fontWeight: 800, fontSize: '16px', letterSpacing: '0.08em', color: 'var(--text-primary)', flexShrink: 0 }}>
          NEQUENCE
        </div>

        {/* Room code */}
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-muted)', background: 'var(--bg-surface)', padding: '4px 10px', borderRadius: '6px', border: '1px solid var(--border-dim)', flexShrink: 0 }}>
          {roomCode}
        </div>

        {/* Active player */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center' }}>
          {activePlayer && (
            <>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 44, height: 44 }}>
                {turnDuration > 0 && (
                  <div style={{ position: 'absolute' }}>
                    <TimerRing duration={turnDuration} startedAt={turnStartedAt} team={activeTeam} size={44} />
                  </div>
                )}
                <AvatarPreview config={activePlayer.avatar} teamColor={activeTeam} size={30} />
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {chipColor && <span style={{ width: 7, height: 7, borderRadius: '50%', background: chipColor, display: 'inline-block', flexShrink: 0 }} />}
                  {activePlayer.username}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Team {TEAM_NAMES[activeTeam] || activeTeam}</div>
              </div>
            </>
          )}
          {!activePlayer && (
            <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Waiting…</span>
          )}
        </div>

        {/* Help */}
        <button onClick={() => setHelpOpen(true)} style={{
          background: 'var(--bg-surface)', border: '1px solid var(--border-dim)', borderRadius: '6px',
          color: 'var(--text-muted)', padding: '5px 12px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '13px',
        }}>?</button>
      </header>
      <HowToPlay open={helpOpen} onClose={() => setHelpOpen(false)} />
    </>
  )
}
