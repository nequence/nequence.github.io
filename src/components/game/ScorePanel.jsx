import GlassPanel from '../ui/GlassPanel'
import AvatarPreview from '../avatar/AvatarPreview'

const TEAM_COLORS = {
  aether: '#7C3AED', nova: '#D97706', pulse: '#E11D48', void: '#0D9488',
}
const TEAM_NAMES = {
  aether: 'Aether', nova: 'Nova', pulse: 'Pulse', void: 'Void',
}

export default function ScorePanel({ teams = {}, players = {}, sequencesToWin = 3 }) {
  return (
    <GlassPanel style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', minWidth: 180 }}>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: '12px', letterSpacing: '0.1em', color: 'var(--text-muted)', fontWeight: 600 }}>
        SCORE
      </div>
      {Object.entries(teams).map(([teamId, teamData]) => {
        const color = TEAM_COLORS[teamId] || '#888'
        const name = TEAM_NAMES[teamId] || teamId
        const seqCount = teamData.sequencesCompleted || 0
        const teamPlayers = Object.values(players).filter(p => p.team === teamId)

        return (
          <div key={teamId} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: color, boxShadow: `0 0 6px ${color}` }} />
              <span style={{ fontWeight: 600, fontSize: '14px' }}>TEAM {name.toUpperCase()}</span>
            </div>
            {/* Sequence stars */}
            <div style={{ display: 'flex', gap: '4px' }}>
              {Array.from({ length: sequencesToWin }).map((_, i) => (
                <span key={i} style={{ fontSize: '18px', color: i < seqCount ? color : 'var(--text-muted)' }}>
                  {i < seqCount ? '★' : '☆'}
                </span>
              ))}
            </div>
            {/* Chip count */}
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
              {teamData.chipsOnBoard || 0} chips
            </div>
            {/* Player avatars */}
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
              {teamPlayers.map(p => (
                <AvatarPreview key={p.uid || p.username} config={p.avatar} teamColor={teamId} size={28} />
              ))}
            </div>
          </div>
        )
      })}
    </GlassPanel>
  )
}
