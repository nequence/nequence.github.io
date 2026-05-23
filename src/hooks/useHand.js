import { useEffect } from 'react'
import { ref, onValue } from 'firebase/database'
import { db } from '../firebase'
import useGameStore from '../store/useGameStore'

export function useHand(roomCode, uid) {
  const setMyHand = useGameStore(s => s.setMyHand)

  useEffect(() => {
    if (!roomCode || !uid) return
    const handRef = ref(db, `rooms/${roomCode}/hands/${uid}`)
    const unsub = onValue(handRef, snap => {
      setMyHand(snap.val() || [])
    })
    return () => unsub()
  }, [roomCode, uid])
}
