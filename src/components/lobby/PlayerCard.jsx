import { motion } from 'framer-motion'
import { useDraggable } from '@dnd-kit/core'
import AvatarPreview from '../avatar/AvatarPreview'

export default function PlayerCard({ player, teamId, isHost, canKick, onKick }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: player.uid || player.username,
    data: { player, fromTeam: teamId },
  })

  return (
    <motion.div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: isDragging ? 0.35 : 1, x: 0 }}
      style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        padding: '10px 12px', borderRadius: '8px',
        background: isDragging ? 'var(--bg-hover)' : 'var(--bg-elevated)',
        border: '1px solid var(--border-dim)',
        cursor: 'grab', position: 'relative',
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        userSelect: 'none',
      }}
    >
      <AvatarPreview config={player.avatar} teamColor={teamId} size={32} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 500, fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-primary)' }}>
          {player.username || 'Player'}
        </div>
        {player.isHost && (
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em' }}>HOST</div>
        )}
      </div>
      {canKick && !player.isHost && (
        <button onClick={e => { e.stopPropagation(); onKick?.(player.uid) }}
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '14px', padding: '2px 4px', lineHeight: 1, borderRadius: '4px' }}
          onMouseEnter={e => e.target.style.color = 'var(--text-secondary)'}
          onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}
        >×</button>
      )}
    </motion.div>
  )
}
