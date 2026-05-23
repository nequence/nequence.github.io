import { useEffect, useRef } from 'react'
import GlassPanel from '../ui/GlassPanel'
import AvatarPreview from '../avatar/AvatarPreview'

const TEAM_COLORS = {
  aether: '#7C3AED', nova: '#D97706', pulse: '#E11D48', void: '#0D9488',
}

function timeAgo(ts) {
  const s = Math.floor((Date.now() - ts) / 1000)
  if (s < 60) return `${s}s`
  return `${Math.floor(s / 60)}m`
}

function actionText(entry) {
  switch (entry.action) {
    case 'place':      return `placed ${entry.card} on ${entry.cell}`
    case 'removeChip': return `removed a chip from ${entry.cell}`
    case 'wildJack':   return `played wild jack on ${entry.cell}`
    case 'deadCard':   return `discarded dead card ${entry.card}`
    case 'autoSkip':   return `turn auto-skipped`
    default:           return entry.action
  }
}

export default function GameLog({ log = [], players = {} }) {
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [log.length])

  return (
    <GlassPanel style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '0', minWidth: 200, maxHeight: '100%', overflow: 'hidden' }}>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: '12px', letterSpacing: '0.1em', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '12px' }}>
        GAME LOG
      </div>
      <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {log.length === 0 && (
          <div style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', padding: '20px 0' }}>
            Game will start soon…
          </div>
        )}
        {log.map((entry) => {
          const player = players[entry.uid]
          const color = TEAM_COLORS[entry.team] || 'var(--text-secondary)'
          return (
            <div key={entry.id} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
              <AvatarPreview config={player?.avatar} teamColor={entry.team} size={28} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <span style={{ color, fontWeight: 600, fontSize: '12px' }}>{entry.username} </span>
                <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>{actionText(entry)}</span>
                {entry.ts && (
                  <span style={{ color: 'var(--text-muted)', fontSize: '11px', marginLeft: '4px', fontFamily: 'var(--font-mono)' }}>
                    {timeAgo(entry.ts)}
                  </span>
                )}
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>
    </GlassPanel>
  )
}
