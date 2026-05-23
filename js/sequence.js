import { FREE_CORNERS } from './board.js'

const DIRECTIONS = [[0,1],[1,0],[1,1],[1,-1]]

export function detectNewSequences(board, existingSequences, teams) {
  const lockedCells = new Set()
  for (const seq of existingSequences) for (const c of seq.cells) lockedCells.add(c)

  const newSequences = []
  for (const team of teams) {
    for (const [dr,dc] of DIRECTIONS) {
      for (let r = 0; r < 10; r++) {
        for (let c = 0; c < 10; c++) {
          const window = []
          let valid = true
          for (let i = 0; i < 5; i++) {
            const nr = r + dr*i, nc = c + dc*i
            if (nr < 0 || nr > 9 || nc < 0 || nc > 9) { valid = false; break }
            window.push(`r${nr}c${nc}`)
          }
          if (!valid) continue

          let count = 0
          for (const cid of window) {
            if (FREE_CORNERS.has(cid) || (board[cid] && board[cid].team === team)) count++
          }
          if (count < 5) continue

          const alreadyKnown = existingSequences.some(seq =>
            seq.team === team && arrEq(seq.cells.slice().sort(), window.slice().sort())
          )
          if (alreadyKnown) continue

          const overlap = window.filter(cid => lockedCells.has(cid)).length
          if (overlap > 1) continue

          newSequences.push({
            id: `seq_${Date.now()}_${Math.random().toString(36).slice(2,7)}`,
            team, cells: window,
          })
          for (const cid of window) lockedCells.add(cid)
        }
      }
    }
  }
  return newSequences
}

function arrEq(a, b) { return a.length === b.length && a.every((v,i) => v === b[i]) }
