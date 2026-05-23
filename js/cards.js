const RANKS = ['2','3','4','5','6','7','8','9','10','J','Q','K','A']
const SUITS = ['c','h','d','s']

export const SUIT_SYMBOL = { c:'♣', h:'♥', d:'♦', s:'♠' }
export const SUIT_COLOR  = { c:'black', h:'red', d:'red', s:'black' }

export function parseCard(code) {
  if (!code) return null
  const suit = code.slice(-1)
  const rank = code.slice(0,-1)
  return { rank, suit, code }
}

export function isTwoEyedJack(code) { return code === 'Jd' || code === 'Jc' }
export function isOneEyedJack(code)  { return code === 'Jh' || code === 'Js' }
export function isJack(code)         { return code && code[0] === 'J' }

export function buildDeck() {
  const single = []
  for (const suit of SUITS) for (const rank of RANKS) single.push(`${rank}${suit}`)
  return shuffle([...single, ...single])
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
  if (count <= 2) return 7
  if (count === 3) return 6
  if (count <= 6) return 5
  if (count <= 10) return 4
  return 3
}

export function sequencesToWinFor(teamCount, playerCount) {
  if (playerCount >= 15) return 3
  if (teamCount === 2) return playerCount >= 10 ? 2 : 3
  return 2
}
