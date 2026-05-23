import { motion, AnimatePresence } from 'framer-motion'
import CardFace from '../cards/CardFace'
import ChipOverlay from './ChipOverlay'

const TEAM_COLORS = {
  aether: '#7C3AED',
  nova:   '#D97706',
  pulse:  '#E11D48',
  void:   '#0D9488',
}

export default function BoardCell({
  cell,        // { id, card?, type? }
  state,       // { team?, inSequence?, sequenceIds? } | null from board data
  isValidTarget,
  isInvalidTarget,
  isHighlighted,
  onClick,
  cellWidth = 68,
  cellHeight = 94,
}) {
  const isFree = cell?.type === 'free'
  const occupied = state?.team != null
  const teamColor = occupied ? TEAM_COLORS[state.team] : null
  const inSequence = state?.inSequence ?? false

  return (
    <motion.div
      onClick={onClick}
      whileHover={isValidTarget ? { scale: 1.06, filter: 'brightness(1.2)', zIndex: 10 } : {}}
      transition={{ duration: 0.12 }}
      style={{
        width: cellWidth,
        height: cellHeight,
        position: 'relative',
        borderRadius: '8px',
        overflow: 'visible',
        cursor: isValidTarget ? 'pointer' : isInvalidTarget ? 'not-allowed' : 'default',
        flexShrink: 0,
      }}
    >
      {/* Card face background */}
      <div style={{
        position: 'absolute',
        inset: 0,
        borderRadius: '8px',
        overflow: 'hidden',
        opacity: occupied ? 0.4 : 1,
        transition: 'opacity 0.2s',
      }}>
        {isFree ? (
          <FreeCell width={cellWidth} height={cellHeight} />
        ) : (
          <CardFace card={cell?.card} width={cellWidth} height={cellHeight} />
        )}
      </div>

      {/* Valid target pulse */}
      {isHighlighted && (
        <motion.div
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.0, repeat: Infinity }}
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '8px',
            border: '2px solid rgba(255,255,255,0.5)',
            boxShadow: '0 0 12px rgba(255,255,255,0.3)',
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Sequence outline */}
      {inSequence && (
        <motion.div
          animate={{
            boxShadow: [`0 0 8px ${teamColor}80`, `0 0 20px ${teamColor}`, `0 0 8px ${teamColor}80`],
          }}
          transition={{ duration: 1.2, repeat: Infinity }}
          style={{
            position: 'absolute',
            inset: -1,
            borderRadius: '9px',
            border: `2px solid ${teamColor}`,
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Invalid hover tint */}
      {isInvalidTarget && (
        <div style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '8px',
          background: 'rgba(225,29,72,0.15)',
          border: '1px solid rgba(225,29,72,0.4)',
          pointerEvents: 'none',
        }} />
      )}

      {/* Chip */}
      <AnimatePresence>
        {occupied && (
          <ChipOverlay
            key={`${cell.id}-${state.team}`}
            team={state.team}
            inSequence={inSequence}
            cellWidth={cellWidth}
            cellHeight={cellHeight}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function FreeCell({ width, height }) {
  return (
    <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height}>
      <rect x={0} y={0} width={width} height={height} rx={8} fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.12)" strokeWidth={1} />
      <text x={width / 2} y={height / 2 - 6} textAnchor="middle" dominantBaseline="middle"
        fontSize={Math.min(width, height) * 0.42} fill="rgba(255,255,255,0.5)" style={{ userSelect: 'none' }}>
        ★
      </text>
      <text x={width / 2} y={height * 0.72} textAnchor="middle"
        fontSize={Math.min(width, height) * 0.18} fill="rgba(255,255,255,0.3)"
        fontFamily="'JetBrains Mono', monospace" letterSpacing={1} style={{ userSelect: 'none' }}>
        FREE
      </text>
    </svg>
  )
}
