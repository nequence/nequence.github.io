import { motion } from 'framer-motion'
import { useDroppable } from '@dnd-kit/core'
import PlayerCard from './PlayerCard'

const TEAM_NAMES = { aether: 'Aether', nova: 'Nova', pulse: 'Pulse', void: 'Void' }
// Chip colors still used for the small dot indicator only
const TEAM_COLORS = { aether: '#7C3AED', nova: '#D97706', pulse: '#E11D48', void: '#0D9488' }

const stagger = { animate: { transition: { staggerChildren: 0.05 } } }

export default function TeamColumn({ teamId, players = [], isHost, onKick }) {
  const { setNodeRef, isOver } = useDroppable({ id: `team-${teamId}` })
  const name  = TEAM_NAMES[teamId] || teamId
  const color = TEAM_COLORS[teamId]

  return (
    <div style={{
      flex: 1,
      background: isOver ? 'rgba(255,255,255,0.05)' : 'var(--bg-surface)',
      border: isOver ? '1px solid var(--border-clear)' : '1px solid var(--border-dim)',
      borderRadius: '12px',
      overflow: 'hidden',
      transition: 'border 0.15s, background 0.15s',
      minWidth: 180,
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        padding: '14px 16px',
        borderBottom: '1px solid var(--border-dim)',
      }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--text-secondary)' }}>
          {name.toUpperCase()}
        </span>
        <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: 'auto', fontFamily: 'var(--font-mono)' }}>
          {players.length}
        </span>
      </div>

      {/* Players */}
      <motion.div
        ref={setNodeRef}
        variants={stagger}
        initial="initial"
        animate="animate"
        style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px', minHeight: 80 }}
      >
        {players.map(p => (
          <PlayerCard key={p.uid || p.username} player={p} teamId={teamId} isHost={p.isHost} canKick={isHost} onKick={onKick} />
        ))}
        {players.length === 0 && (
          <div style={{ border: '1px dashed var(--border-dim)', borderRadius: '8px', padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
            Drag player here
          </div>
        )}
      </motion.div>
    </div>
  )
}
