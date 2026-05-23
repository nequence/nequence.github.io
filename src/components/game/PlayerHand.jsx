import { motion } from 'framer-motion'
import HandCard from '../cards/HandCard'
import { cellsForCard } from '../../utils/boardLayout'

export default function PlayerHand({ hand = [], selectedCard, onSelectCard, isMyTurn, boardState = {} }) {
  function isDeadCard(card) {
    const cells = cellsForCard(card)
    return cells.length > 0 && cells.every(id => boardState[id]?.team != null)
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'center',
      gap: '8px',
      padding: '16px 24px',
      overflowX: 'auto',
      flexShrink: 0,
    }}>
      {hand.map((card, i) => {
        const dead = isDeadCard(card)
        return (
          <motion.div
            key={`${card}-${i}`}
            initial={{ rotateY: 90, opacity: 0, x: 40 }}
            animate={{ rotateY: 0, opacity: 1, x: 0 }}
            transition={{ duration: 0.26, ease: 'easeOut', delay: i * 0.04 }}
          >
            <HandCard
              card={card}
              selected={selectedCard === card && !dead}
              isDead={dead}
              isMyTurn={isMyTurn}
              onClick={() => {
                if (selectedCard === card) onSelectCard(null)
                else onSelectCard(card)
              }}
            />
          </motion.div>
        )
      })}
      {hand.length === 0 && (
        <div style={{ color: 'var(--text-muted)', fontSize: '14px', padding: '20px' }}>
          Waiting for cards…
        </div>
      )}
    </div>
  )
}
