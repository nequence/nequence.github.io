import { motion } from 'framer-motion'
import CardFace from './CardFace'
import { isTwoEyedJack, isOneEyedJack, isJack } from '../../utils/cardUtils'

export default function HandCard({ card, selected, isDead, isMyTurn, onClick }) {
  const twoEyed = isTwoEyedJack(card)
  const oneEyed = isOneEyedJack(card)
  const jackCard = isJack(card)

  let borderColor = 'transparent'
  if (twoEyed) borderColor = 'var(--signal-gold)'
  if (oneEyed) borderColor = 'var(--signal-invalid)'

  let glowColor = 'none'
  if (selected) glowColor = `0 0 24px var(--signal-gold)`
  else if (twoEyed) glowColor = `0 0 10px rgba(217,119,6,0.5)`
  else if (oneEyed) glowColor = `0 0 10px rgba(225,29,72,0.5)`

  return (
    <motion.div
      onClick={isDead ? undefined : (isMyTurn ? onClick : undefined)}
      whileHover={isMyTurn && !isDead ? { y: -12, scale: 1.05 } : {}}
      animate={selected ? { y: -20, scale: 1.08 } : { y: 0, scale: 1 }}
      transition={{ duration: selected ? 0.12 : 0.15, ease: 'easeOut' }}
      style={{
        position: 'relative',
        cursor: isMyTurn && !isDead ? 'pointer' : 'default',
        filter: isDead ? 'saturate(0.2) brightness(0.7)' : 'none',
        borderRadius: '8px',
        boxShadow: glowColor,
        border: selected ? '2px solid var(--signal-gold)' : jackCard ? `2px solid ${borderColor}` : '2px solid transparent',
        flexShrink: 0,
      }}
    >
      <CardFace card={card} width={62} height={88} />

      {/* Dead badge */}
      {isDead && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'rgba(0,0,0,0.8)',
          color: 'var(--signal-invalid)',
          fontFamily: 'var(--font-mono)',
          fontSize: '9px',
          fontWeight: 700,
          letterSpacing: '0.08em',
          padding: '3px 6px',
          borderRadius: '4px',
          border: '1px solid var(--signal-invalid)',
          pointerEvents: 'none',
        }}>
          DEAD
        </div>
      )}

      {/* Jack type badge */}
      {twoEyed && !isDead && (
        <div style={{
          position: 'absolute', bottom: 3, left: '50%', transform: 'translateX(-50%)',
          background: 'var(--signal-gold)', color: '#000', fontFamily: 'var(--font-mono)',
          fontSize: '8px', fontWeight: 700, padding: '1px 5px', borderRadius: '3px',
          whiteSpace: 'nowrap',
        }}>★ WILD</div>
      )}
      {oneEyed && !isDead && (
        <div style={{
          position: 'absolute', bottom: 3, left: '50%', transform: 'translateX(-50%)',
          background: 'var(--signal-invalid)', color: '#fff', fontFamily: 'var(--font-mono)',
          fontSize: '8px', fontWeight: 700, padding: '1px 5px', borderRadius: '3px',
          whiteSpace: 'nowrap',
        }}>✕ REMOVE</div>
      )}
    </motion.div>
  )
}
