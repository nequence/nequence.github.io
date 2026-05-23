import { useState, useCallback, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ref, update, get } from 'firebase/database'
import { db } from '../firebase'
import useGameStore from '../store/useGameStore'
import { useRoom } from '../hooks/useRoom'
import { useGame } from '../hooks/useGame'
import { useHand } from '../hooks/useHand'
import { detectNewSequences } from '../utils/sequenceDetector'
import { cellsForCard, FREE_CORNERS } from '../utils/boardLayout'
import { isOneEyedJack, isTwoEyedJack } from '../utils/cardUtils'
import GameHeader from '../components/game/GameHeader'
import GameBoard from '../components/board/GameBoard'
import ScorePanel from '../components/game/ScorePanel'
import GameLog from '../components/game/GameLog'
import PlayerHand from '../components/game/PlayerHand'
import WinScreen from '../components/game/WinScreen'
import Modal from '../components/ui/Modal'
import Button from '../components/ui/Button'
import PageTransition from '../components/layout/PageTransition'

export default function GamePage() {
  const { roomCode } = useParams()
  const navigate = useNavigate()
  const uid = useGameStore(s => s.uid)
  const players = useGameStore(s => s.players)
  const teams = useGameStore(s => s.teams)
  const roomMeta = useGameStore(s => s.roomMeta)
  const game = useGameStore(s => s.game)
  const myHand = useGameStore(s => s.myHand)
  const selectedCard = useGameStore(s => s.selectedCard)
  const setSelectedCard = useGameStore(s => s.setSelectedCard)

  const [confirmCell, setConfirmCell] = useState(null)
  const [playing, setPlaying] = useState(false)
  const [error, setError] = useState('')
  const [winner, setWinner] = useState(null)

  useRoom(roomCode)
  useGame(roomCode)
  useHand(roomCode, uid)

  const isMyTurn = game?.currentTurn === uid
  const myTeam = players[uid]?.team
  const board = game?.board || {}
  const log = game?.log ? Object.values(game.log) : []
  const sequences = game?.sequences || []
  const settings = game?.settings || roomMeta?.settings || {}
  const sequencesToWin = settings.sequencesToWin || 3
  const isHost = roomMeta?.host === uid

  // Check for win
  useEffect(() => {
    if (!teams) return
    for (const [team, data] of Object.entries(teams)) {
      if ((data.sequencesCompleted || 0) >= sequencesToWin) {
        setWinner(team)
        return
      }
    }
  }, [teams, sequencesToWin])

  const handleCellClick = useCallback(async (cellId) => {
    if (!isMyTurn || !selectedCard || playing) return

    if (settings.confirmPlacement) {
      setConfirmCell(cellId)
      return
    }
    await executePlay(cellId)
  }, [isMyTurn, selectedCard, playing, settings])

  async function executePlay(cellId) {
    if (playing) return
    setPlaying(true)
    setError('')
    try {
      const currentGame = (await get(ref(db, `rooms/${roomCode}/game`))).val()
      if (!currentGame) throw new Error('Game not found')
      if (currentGame.currentTurn !== uid) throw new Error('Not your turn')

      const boardSnap = currentGame.board || {}
      const cardCode = selectedCard
      const oneEyed = isOneEyedJack(cardCode)
      const twoEyed = isTwoEyedJack(cardCode)

      // Validate move
      if (oneEyed) {
        const cell = boardSnap[cellId]
        if (!cell?.team || cell.team === myTeam || cell.inSequence) throw new Error('Invalid One-Eyed Jack target')
      } else if (twoEyed) {
        if (boardSnap[cellId]?.team) throw new Error('Cell is occupied')
      } else {
        const validCells = cellsForCard(cardCode)
        if (!validCells.includes(cellId)) throw new Error('Card does not match cell')
        if (boardSnap[cellId]?.team) throw new Error('Cell is occupied')
      }

      // Remove card from hand
      const handSnap = (await get(ref(db, `rooms/${roomCode}/hands/${uid}`))).val() || []
      const cardIdx = handSnap.indexOf(cardCode)
      if (cardIdx === -1) throw new Error('Card not in hand')
      const newHand = [...handSnap]
      newHand.splice(cardIdx, 1)

      // Draw replacement from deck
      const deckArr = currentGame.deck || []
      let newCard = null
      let newDeck = [...deckArr]
      if (newDeck.length > 0) {
        newCard = newDeck.shift()
        newHand.push(newCard)
      }

      // Update board
      const newBoard = { ...boardSnap }
      if (oneEyed) {
        delete newBoard[cellId]
      } else {
        newBoard[cellId] = { team: myTeam, inSequence: false, sequenceIds: [] }
      }

      // Detect sequences
      const teamNames = Object.keys(currentGame.teams || teams || {})
      const existingSeqs = currentGame.sequences || []
      const newSeqs = oneEyed ? [] : detectNewSequences(newBoard, existingSeqs, teamNames)

      // Lock cells in new sequences
      for (const seq of newSeqs) {
        for (const cid of seq.cells) {
          if (newBoard[cid]) newBoard[cid] = { ...newBoard[cid], inSequence: true, sequenceIds: [seq.id] }
        }
      }

      // Advance turn
      const turnOrder = currentGame.turnOrder || []
      const curIdx = turnOrder.indexOf(uid)
      const nextIdx = (curIdx + 1) % turnOrder.length
      const nextUid = turnOrder[nextIdx]

      // Update teams
      const newTeams = { ...(currentGame.teams || {}) }
      if (!oneEyed && newBoard[cellId]) {
        newTeams[myTeam] = {
          ...(newTeams[myTeam] || {}),
          chipsOnBoard: ((newTeams[myTeam]?.chipsOnBoard) || 0) + 1,
          sequencesCompleted: ((newTeams[myTeam]?.sequencesCompleted) || 0) + newSeqs.length,
        }
      }

      // Log entry
      const logEntry = {
        id: `log_${Date.now()}`,
        turn: currentGame.turnNumber || 1,
        ts: Date.now(),
        uid,
        username: players[uid]?.username || 'Player',
        team: myTeam,
        action: oneEyed ? 'removeChip' : twoEyed ? 'wildJack' : 'place',
        card: cardCode,
        cell: cellId,
        resultedInSequence: newSeqs.length > 0,
      }

      const updates = {
        [`rooms/${roomCode}/game/board`]: newBoard,
        [`rooms/${roomCode}/game/deck`]: newDeck,
        [`rooms/${roomCode}/game/currentTurn`]: nextUid,
        [`rooms/${roomCode}/game/turnNumber`]: (currentGame.turnNumber || 1) + 1,
        [`rooms/${roomCode}/game/turnStartedAt`]: Date.now(),
        [`rooms/${roomCode}/game/deckRemaining`]: newDeck.length,
        [`rooms/${roomCode}/game/sequences`]: [...existingSeqs, ...newSeqs],
        [`rooms/${roomCode}/game/log/${logEntry.id}`]: logEntry,
        [`rooms/${roomCode}/hands/${uid}`]: newHand,
        [`rooms/${roomCode}/teams`]: newTeams,
      }

      await update(ref(db, '/'), updates)
      setSelectedCard(null)
      setConfirmCell(null)
    } catch (e) {
      setError(e.message)
      setTimeout(() => setError(''), 3000)
    } finally {
      setPlaying(false)
    }
  }

  const cellWidth = window.innerWidth >= 1280 ? 68 : window.innerWidth >= 1024 ? 60 : window.innerWidth >= 768 ? 52 : 42
  const cellHeight = Math.round(cellWidth * 1.38)

  return (
    <PageTransition>
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-base)', overflow: 'hidden' }}>
        {/* Header */}
        <GameHeader
          roomCode={roomCode}
          currentPlayer={game?.currentTurn}
          players={players}
          game={{ ...game, settings }}
        />

        {/* Error toast */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ position: 'fixed', top: 80, left: '50%', transform: 'translateX(-50%)', background: 'var(--signal-invalid)', color: '#fff', padding: '10px 20px', borderRadius: '10px', zIndex: 900, fontSize: '14px', fontWeight: 600 }}
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main content */}
        <div style={{ flex: 1, display: 'flex', gap: '16px', padding: '16px', overflow: 'hidden', minHeight: 0 }}>
          {/* Score panel */}
          <div style={{ flexShrink: 0, overflowY: 'auto' }}>
            <ScorePanel teams={teams || {}} players={players} sequencesToWin={sequencesToWin} />
          </div>

          {/* Board + hand */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', overflow: 'auto', minWidth: 0 }}>
            {/* Turn indicator */}
            <div style={{ fontSize: '13px', color: isMyTurn ? 'var(--signal-gold)' : 'var(--text-muted)', fontWeight: isMyTurn ? 700 : 400, transition: 'color 0.3s' }}>
              {isMyTurn ? '✦ Your turn' : `${players[game?.currentTurn]?.username || '...'}'s turn`}
            </div>

            {/* Board */}
            <div style={{ overflow: 'auto' }}>
              <GameBoard
                boardState={board}
                selectedCard={selectedCard}
                myTeam={myTeam}
                onCellClick={handleCellClick}
                cellWidth={cellWidth}
                cellHeight={cellHeight}
              />
            </div>

            {/* Hand */}
            {isMyTurn && (
              <PlayerHand
                hand={myHand}
                selectedCard={selectedCard}
                onSelectCard={setSelectedCard}
                isMyTurn={isMyTurn}
                boardState={board}
              />
            )}
            {!isMyTurn && myHand.length > 0 && (
              <div style={{ display: 'flex', gap: '6px', padding: '12px 16px', opacity: 0.4 }}>
                {myHand.map((_, i) => (
                  <div key={i} style={{ width: 44, height: 62, borderRadius: '6px', background: 'var(--bg-elevated)', border: '1px solid var(--border-dim)' }} />
                ))}
              </div>
            )}
          </div>

          {/* Game log */}
          <div style={{ width: 220, flexShrink: 0, overflowY: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <GameLog log={log} players={players} />
          </div>
        </div>

        {/* Confirm placement modal */}
        <Modal open={!!confirmCell} onClose={() => setConfirmCell(null)} title="Confirm Placement" maxWidth={360}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', fontSize: '15px' }}>
            Place chip on <strong style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{confirmCell}</strong> using <strong style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{selectedCard}</strong>?
          </p>
          <div style={{ display: 'flex', gap: '10px' }}>
            <Button onClick={() => { executePlay(confirmCell); setConfirmCell(null) }} fullWidth disabled={playing}>
              {playing ? 'Placing…' : 'Confirm'}
            </Button>
            <Button onClick={() => setConfirmCell(null)} variant="secondary" fullWidth>Cancel</Button>
          </div>
        </Modal>

        {/* Win screen */}
        <WinScreen
          winner={winner}
          players={players}
          teams={teams || {}}
          isHost={isHost}
          onPlayAgain={() => { setWinner(null); navigate(`/lobby/${roomCode}`) }}
          onClose={() => { setWinner(null); navigate('/') }}
        />
      </div>
    </PageTransition>
  )
}
