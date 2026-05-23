import { useMemo } from 'react'
import { BOARD_LAYOUT, FREE_CORNERS, cellsForCard } from '../../utils/boardLayout'
import { isJack, isTwoEyedJack, isOneEyedJack } from '../../utils/cardUtils'
import BoardCell from './BoardCell'

export default function GameBoard({
  boardState = {},     // { [cellId]: { team, inSequence, sequenceIds } }
  selectedCard,        // card code or null
  myTeam,              // current player's team
  onCellClick,
  cellWidth = 68,
  cellHeight = 94,
}) {
  const validTargets = useMemo(() => {
    if (!selectedCard) return new Set()

    if (isTwoEyedJack(selectedCard)) {
      // Any unoccupied non-FREE cell
      return new Set(
        BOARD_LAYOUT
          .filter(c => c.type !== 'free' && !boardState[c.id]?.team)
          .map(c => c.id)
      )
    }

    if (isOneEyedJack(selectedCard)) {
      // Any opponent chip that is not in a sequence
      return new Set(
        BOARD_LAYOUT
          .filter(c => {
            const s = boardState[c.id]
            return s?.team && s.team !== myTeam && !s.inSequence
          })
          .map(c => c.id)
      )
    }

    // Standard card — cells matching this card that are unoccupied
    return new Set(
      cellsForCard(selectedCard).filter(id => !boardState[id]?.team)
    )
  }, [selectedCard, boardState, myTeam])

  const rows = []
  for (let r = 0; r < 10; r++) {
    const cols = []
    for (let c = 0; c < 10; c++) {
      const cell = BOARD_LAYOUT[r * 10 + c]
      const state = boardState[cell.id] || null
      const isFree = FREE_CORNERS.has(cell.id)
      const isValid = validTargets.has(cell.id)
      const occupied = state?.team != null
      const isInvalid = selectedCard && !isValid && !isFree && occupied === false

      cols.push(
        <BoardCell
          key={cell.id}
          cell={cell}
          state={state}
          isValidTarget={isValid}
          isHighlighted={isValid}
          isInvalidTarget={false}
          onClick={() => isValid && onCellClick?.(cell.id)}
          cellWidth={cellWidth}
          cellHeight={cellHeight}
        />
      )
    }
    rows.push(
      <div key={r} style={{ display: 'flex', gap: 4 }}>
        {cols}
      </div>
    )
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 4,
      width: 'fit-content',
    }}>
      {rows}
    </div>
  )
}
