// Card code format: {rank}{suit} e.g. "Ac", "10h", "Jd", "Ks"
// Ranks: 2–9, 10, J, Q, K, A
// Suits: c (clubs), h (hearts), d (diamonds), s (spades)

export function parseCard(code) {
  if (!code) return null
  const suit = code.slice(-1)
  const rank = code.slice(0, -1)
  return { rank, suit, code }
}

export function suitColor(suit) {
  return (suit === 'h' || suit === 'd') ? 'var(--suit-red)' : 'var(--suit-black)'
}

export function suitSymbol(suit) {
  const map = { c: '♣', h: '♥', d: '♦', s: '♠' }
  return map[suit] || '?'
}

export function isJack(code) {
  return code && code.startsWith('J')
}

export function isTwoEyedJack(code) {
  // J♦ and J♣ are two-eyed
  return code === 'Jd' || code === 'Jc'
}

export function isOneEyedJack(code) {
  // J♥ and J♠ are one-eyed
  return code === 'Jh' || code === 'Js'
}

export function rankLabel(rank) {
  return rank
}

export function isFaceCard(rank) {
  return rank === 'K' || rank === 'Q' || rank === 'J' || rank === 'A'
}

// Returns number of suit pips to show (for number cards)
export function pipCount(rank) {
  const n = parseInt(rank)
  return isNaN(n) ? 0 : n
}

// Build a full shuffled deck (2 copies of 52 cards, no jokers)
const RANKS = ['2','3','4','5','6','7','8','9','10','J','Q','K','A']
const SUITS = ['c','h','d','s']

export function buildDeck() {
  const single = []
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      single.push(`${rank}${suit}`)
    }
  }
  const deck = [...single, ...single] // two copies
  return shuffle(deck)
}

export function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function handSizeForPlayers(count) {
  if (count <= 2)  return 7
  if (count === 3) return 6
  if (count <= 6)  return 5
  if (count <= 10) return 4
  return 3
}

export function sequencesToWinFor(teamCount, playerCount) {
  if (playerCount >= 15) return 3 // Grand Mode
  if (teamCount === 2)   return playerCount >= 10 ? 2 : 3
  return 2 // 3 or 4 teams
}
