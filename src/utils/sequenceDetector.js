import { FREE_CORNERS } from './boardLayout.js'

const DIRECTIONS = [
  [0, 1],   // horizontal →
  [1, 0],   // vertical ↓
  [1, 1],   // diagonal ↘
  [1, -1],  // diagonal ↙
]

// board: { [cellId]: { team, inSequence, sequenceIds } | null }
// existingSequences: array of { id, cells: [cellId,...] }
export function detectNewSequences(board, existingSequences, teams) {
  const lockedCells = new Set()
  for (const seq of existingSequences) {
    for (const c of seq.cells) lockedCells.add(c)
  }

  const newSequences = []

  for (const team of teams) {
    for (const [dr, dc] of DIRECTIONS) {
      for (let r = 0; r < 10; r++) {
        for (let c = 0; c < 10; c++) {
          const window = []
          let valid = true
          for (let i = 0; i < 5; i++) {
            const nr = r + dr * i
            const nc = c + dc * i
            if (nr < 0 || nr > 9 || nc < 0 || nc > 9) { valid = false; break }
            window.push(`r${nr}c${nc}`)
          }
          if (!valid) continue

          let count = 0
          for (const cid of window) {
            const isFree = FREE_CORNERS.has(cid)
            const cell = board[cid]
            if (isFree || (cell && cell.team === team)) count++
          }

          if (count === 5) {
            const alreadyKnown = existingSequences.some(seq =>
              seq.team === team && arraysEqual(seq.cells.slice().sort(), window.slice().sort())
            )
            if (alreadyKnown) continue

            // Check overlap rule: may share at most 1 chip with any existing sequence
            const overlapCount = window.filter(cid => lockedCells.has(cid)).length
            if (overlapCount > 1) continue

            newSequences.push({
              id: `seq_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
              team,
              cells: window,
              direction: directionName(dr, dc),
            })
            // Lock these cells for subsequent checks
            for (const cid of window) lockedCells.add(cid)
          }
        }
      }
    }
  }
  return newSequences
}

function directionName(dr, dc) {
  if (dr === 0)  return 'horizontal'
  if (dc === 0)  return 'vertical'
  if (dc === 1)  return 'diagonal-se'
  return 'diagonal-sw'
}

function arraysEqual(a, b) {
  return a.length === b.length && a.every((v, i) => v === b[i])
}
