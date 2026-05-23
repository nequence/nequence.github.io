import { create } from 'zustand'

const useGameStore = create((set) => ({
  // Auth
  uid: null,
  setUid: (uid) => set({ uid }),

  // Room
  roomCode: null,
  setRoomCode: (roomCode) => set({ roomCode }),

  // Players
  players: {},
  setPlayers: (players) => set({ players }),

  // My avatar config
  myAvatar: { body: 0, skin: 0, outfit: 0, hairStyle: 0, hairColor: 0, expression: 0, accessory: 0 },
  setMyAvatar: (myAvatar) => set({ myAvatar }),

  myUsername: '',
  setMyUsername: (myUsername) => set({ myUsername }),

  // Teams
  teams: {},
  setTeams: (teams) => set({ teams }),

  // Game state
  game: null,
  setGame: (game) => set({ game }),

  myHand: [],
  setMyHand: (myHand) => set({ myHand }),

  // UI state
  selectedCard: null,
  setSelectedCard: (selectedCard) => set({ selectedCard }),

  roomMeta: null,
  setRoomMeta: (roomMeta) => set({ roomMeta }),

  // Error/loading
  error: null,
  setError: (error) => set({ error }),

  loading: false,
  setLoading: (loading) => set({ loading }),
}))

export default useGameStore
