import { motion } from 'framer-motion'

const TEAM_COLORS = {
  aether: '#7C3AED',
  nova:   '#D97706',
  pulse:  '#E11D48',
  void:   '#0D9488',
}

export default function ChipOverlay({ team, inSequence, cellWidth, cellHeight }) {
  const color = TEAM_COLORS[team] || '#888'
  const size = Math.min(cellWidth, cellHeight) * 0.75

  return (
    <motion.div
      initial={{ scale: 0, y: -20, opacity: 0 }}
      animate={{ scale: 1, y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
      }}
    >
      {/* Outer ring for locked chips */}
      {inSequence && (
        <motion.div
          animate={{
            boxShadow: [`0 0 8px ${color}`, `0 0 24px ${color}`, `0 0 8px ${color}`],
          }}
          transition={{ duration: 1.2, repeat: Infinity }}
          style={{
            position: 'absolute',
            width: size + 10,
            height: size + 10,
            borderRadius: '50%',
            border: `3px solid ${color}`,
            opacity: 0.6,
          }}
        />
      )}
      {/* Main chip */}
      <div
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          background: color,
          opacity: 0.88,
          boxShadow: `0 2px 12px ${color}88, inset 0 2px 4px rgba(255,255,255,0.2)`,
          position: 'relative',
        }}
      >
        {/* Inner highlight */}
        <div style={{
          position: 'absolute',
          top: '15%',
          left: '20%',
          width: '35%',
          height: '25%',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.3)',
        }} />
      </div>
    </motion.div>
  )
}
