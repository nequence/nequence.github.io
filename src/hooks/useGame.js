import { useEffect } from 'react'
import { ref, onValue } from 'firebase/database'
import { db } from '../firebase'
import useGameStore from '../store/useGameStore'

export function useGame(roomCode) {
  const setGame = useGameStore(s => s.setGame)

  useEffect(() => {
    if (!roomCode) return
    const gameRef = ref(db, `rooms/${roomCode}/game`)
    const unsub = onValue(gameRef, snap => {
      setGame(snap.val())
    })
    return () => unsub()
  }, [roomCode])
}
