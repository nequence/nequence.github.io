import { useEffect } from 'react'
import { ref, onValue } from 'firebase/database'
import { db } from '../firebase'
import useGameStore from '../store/useGameStore'

export function useRoom(roomCode) {
  const setPlayers   = useGameStore(s => s.setPlayers)
  const setTeams     = useGameStore(s => s.setTeams)
  const setRoomMeta  = useGameStore(s => s.setRoomMeta)

  useEffect(() => {
    if (!roomCode) return

    const roomRef = ref(db, `rooms/${roomCode}`)
    const unsub = onValue(roomRef, snap => {
      const data = snap.val()
      if (!data) return
      if (data.players)  setPlayers(data.players)
      if (data.teams)    setTeams(data.teams)
      if (data.meta)     setRoomMeta(data.meta)
    })
    return () => unsub()
  }, [roomCode])
}
