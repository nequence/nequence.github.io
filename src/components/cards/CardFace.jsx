// Renders a full card face SVG for any card code.
// Used inside board cells and in player hands.

import { parseCard, suitColor, suitSymbol, pipCount } from '../../utils/cardUtils'

function PipLayout({ count, color, vb = [0, 0, 60, 90] }) {
  // Standard playing card pip arrangement
  const [, , w, h] = vb
  const cx = w / 2, cy = h / 2
  const r = 7
  const positions = {
    1:  [[cx, cy]],
    2:  [[cx, h * 0.28], [cx, h * 0.72]],
    3:  [[cx, h * 0.2], [cx, cy], [cx, h * 0.8]],
    4:  [[w * 0.3, h * 0.28], [w * 0.7, h * 0.28], [w * 0.3, h * 0.72], [w * 0.7, h * 0.72]],
    5:  [[w * 0.3, h * 0.22], [w * 0.7, h * 0.22], [cx, cy], [w * 0.3, h * 0.78], [w * 0.7, h * 0.78]],
    6:  [[w * 0.3, h * 0.22], [w * 0.7, h * 0.22], [w * 0.3, cy], [w * 0.7, cy], [w * 0.3, h * 0.78], [w * 0.7, h * 0.78]],
    7:  [[w * 0.3, h * 0.2], [w * 0.7, h * 0.2], [cx, h * 0.38], [w * 0.3, h * 0.55], [w * 0.7, h * 0.55], [w * 0.3, h * 0.78], [w * 0.7, h * 0.78]],
    8:  [[w * 0.3, h * 0.18], [w * 0.7, h * 0.18], [w * 0.3, h * 0.4], [w * 0.7, h * 0.4], [w * 0.3, h * 0.6], [w * 0.7, h * 0.6], [w * 0.3, h * 0.82], [w * 0.7, h * 0.82]],
    9:  [[w * 0.28, h * 0.16], [w * 0.72, h * 0.16], [w * 0.28, h * 0.36], [w * 0.72, h * 0.36], [cx, cy], [w * 0.28, h * 0.64], [w * 0.72, h * 0.64], [w * 0.28, h * 0.84], [w * 0.72, h * 0.84]],
    10: [[w * 0.28, h * 0.15], [w * 0.72, h * 0.15], [cx, h * 0.27], [w * 0.28, h * 0.4], [w * 0.72, h * 0.4], [w * 0.28, h * 0.6], [w * 0.72, h * 0.6], [cx, h * 0.73], [w * 0.28, h * 0.85], [w * 0.72, h * 0.85]],
  }
  const pts = positions[Math.min(count, 10)] || []
  return (
    <g fill={color} fontSize={r * 1.8} textAnchor="middle" dominantBaseline="middle">
      {pts.map(([x, y], i) => (
        <text key={i} x={x} y={y}>{suitSymbol(undefined)}</text>
      ))}
    </g>
  )
}

function SuitPips({ count, suit, w = 60, h = 90 }) {
  const color = suitColor(suit)
  const sym = suitSymbol(suit)
  const cx = w / 2, cy = h / 2
  const positions = {
    2:  [[cx, h * 0.28], [cx, h * 0.72]],
    3:  [[cx, h * 0.2], [cx, cy], [cx, h * 0.8]],
    4:  [[w * 0.3, h * 0.28], [w * 0.7, h * 0.28], [w * 0.3, h * 0.72], [w * 0.7, h * 0.72]],
    5:  [[w * 0.3, h * 0.22], [w * 0.7, h * 0.22], [cx, cy], [w * 0.3, h * 0.78], [w * 0.7, h * 0.78]],
    6:  [[w * 0.3, h * 0.22], [w * 0.7, h * 0.22], [w * 0.3, cy], [w * 0.7, cy], [w * 0.3, h * 0.78], [w * 0.7, h * 0.78]],
    7:  [[w * 0.3, h * 0.2], [w * 0.7, h * 0.2], [cx, h * 0.38], [w * 0.3, h * 0.55], [w * 0.7, h * 0.55], [w * 0.3, h * 0.78], [w * 0.7, h * 0.78]],
    8:  [[w * 0.3, h * 0.18], [w * 0.7, h * 0.18], [w * 0.3, h * 0.4], [w * 0.7, h * 0.4], [w * 0.3, h * 0.6], [w * 0.7, h * 0.6], [w * 0.3, h * 0.82], [w * 0.7, h * 0.82]],
    9:  [[w * 0.28, h * 0.16], [w * 0.72, h * 0.16], [w * 0.28, h * 0.36], [w * 0.72, h * 0.36], [cx, cy], [w * 0.28, h * 0.64], [w * 0.72, h * 0.64], [w * 0.28, h * 0.84], [w * 0.72, h * 0.84]],
    10: [[w * 0.28, h * 0.15], [w * 0.72, h * 0.15], [cx, h * 0.27], [w * 0.28, h * 0.4], [w * 0.72, h * 0.4], [w * 0.28, h * 0.6], [w * 0.72, h * 0.6], [cx, h * 0.73], [w * 0.28, h * 0.85], [w * 0.72, h * 0.85]],
  }
  const pts = positions[count] || []
  const sz = Math.max(8, w * 0.22)
  return (
    <g>
      {pts.map(([x, y], i) => (
        <text key={i} x={x} y={y} textAnchor="middle" dominantBaseline="middle"
          fontSize={sz} fill={color} style={{ userSelect: 'none' }}>
          {sym}
        </text>
      ))}
    </g>
  )
}

function KingIllustration({ color, w, h }) {
  const cx = w / 2, cy = h / 2
  return (
    <g fill={color} opacity="0.85">
      {/* Crown */}
      <polygon points={`${cx-14},${cy-18} ${cx-14},${cy-6} ${cx},${cy-22} ${cx+14},${cy-6} ${cx+14},${cy-18} ${cx+14},${cy-6} ${cx-14},${cy-6}`} fill={color} />
      <rect x={cx - 14} y={cy - 6} width={28} height={8} rx={2} fill={color} />
      {/* Jewels */}
      <circle cx={cx} cy={cy - 19} r={3} fill="rgba(255,255,255,0.6)" />
      <circle cx={cx - 12} cy={cy - 14} r={2} fill="rgba(255,255,255,0.4)" />
      <circle cx={cx + 12} cy={cy - 14} r={2} fill="rgba(255,255,255,0.4)" />
      {/* Crossed swords */}
      <line x1={cx - 12} y1={cy + 4} x2={cx + 12} y2={cy + 18} stroke={color} strokeWidth={3} strokeLinecap="round" />
      <line x1={cx + 12} y1={cy + 4} x2={cx - 12} y2={cy + 18} stroke={color} strokeWidth={3} strokeLinecap="round" />
      {/* Sword handles */}
      <rect x={cx - 14} y={cy + 3} width={6} height={3} rx={1} fill={color} />
      <rect x={cx + 8} y={cy + 3} width={6} height={3} rx={1} fill={color} />
    </g>
  )
}

function QueenIllustration({ color, w, h }) {
  const cx = w / 2, cy = h / 2
  return (
    <g fill={color} opacity="0.85">
      {/* Crown */}
      <polygon points={`${cx-12},${cy-16} ${cx-12},${cy-6} ${cx-4},${cy-20} ${cx},${cy-14} ${cx+4},${cy-20} ${cx+12},${cy-6} ${cx+12},${cy-16}`} fill={color} />
      <rect x={cx - 12} y={cy - 6} width={24} height={7} rx={2} fill={color} />
      {/* Jewels */}
      <circle cx={cx - 4} cy={cy - 17} r={2.5} fill="rgba(255,255,255,0.6)" />
      <circle cx={cx + 4} cy={cy - 17} r={2.5} fill="rgba(255,255,255,0.6)" />
      <circle cx={cx} cy={cy - 10} r={2} fill="rgba(255,255,255,0.5)" />
      {/* Floral motif */}
      <circle cx={cx} cy={cy + 6} r={6} fill="none" stroke={color} strokeWidth={2} />
      <circle cx={cx} cy={cy + 6} r={2.5} fill={color} />
      <circle cx={cx - 7} cy={cy + 6} r={3.5} fill={color} opacity="0.6" />
      <circle cx={cx + 7} cy={cy + 6} r={3.5} fill={color} opacity="0.6" />
      <circle cx={cx} cy={cy - 1} r={3.5} fill={color} opacity="0.6" />
      <circle cx={cx} cy={cy + 13} r={3.5} fill={color} opacity="0.6" />
    </g>
  )
}

function JackIllustration({ suit, w, h, twoEyed = false }) {
  const color = suitColor(suit)
  const cx = w / 2, cy = h / 2
  return (
    <g>
      {/* Head */}
      <ellipse cx={cx} cy={cy - 4} rx={9} ry={11} fill="rgba(255,255,255,0.12)" stroke={color} strokeWidth={1.5} />
      {/* Eyes */}
      <circle cx={twoEyed ? cx - 4 : cx - 2} cy={cy - 6} r={2.5} fill={color} />
      {twoEyed && <circle cx={cx + 4} cy={cy - 6} r={2.5} fill={color} />}
      {/* Jester hat */}
      <path d={`M${cx - 10},${cy - 12} Q${cx},${cy - 28} ${cx + 10},${cy - 12}`} fill={color} opacity="0.7" />
      <circle cx={cx} cy={cy - 27} r={3} fill={color} />
      {/* Collar */}
      <path d={`M${cx - 9},${cy + 6} Q${cx},${cy + 14} ${cx + 9},${cy + 6}`} fill={color} opacity="0.5" />
    </g>
  )
}

function AceIllustration({ suit, w, h }) {
  const color = suitColor(suit)
  const sym = suitSymbol(suit)
  const cx = w / 2, cy = h / 2 + 4
  const sz = Math.min(w, h) * 0.55
  return (
    <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle"
      fontSize={sz} fill={color} style={{ userSelect: 'none' }}>
      {sym}
    </text>
  )
}

export default function CardFace({ card, width = 60, height = 84, compact = false }) {
  if (!card) return null

  const { rank, suit } = parseCard(card)
  const color = suitColor(suit)
  const sym = suitSymbol(suit)
  const w = width, h = height
  const pad = compact ? 3 : 5
  const cornerSize = compact ? 9 : 11
  const pipNum = parseInt(rank)

  return (
    <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} style={{ display: 'block', borderRadius: '6px', overflow: 'visible' }}>
      {/* Background */}
      <rect x={0} y={0} width={w} height={h} rx={6} fill="rgba(255,255,255,0.07)" stroke="rgba(255,255,255,0.12)" strokeWidth={1} />

      {/* Top-left rank + suit */}
      <text x={pad} y={pad + cornerSize} fontSize={cornerSize} fontFamily="'JetBrains Mono', monospace" fontWeight={600} fill={color} style={{ userSelect: 'none' }}>
        {rank}
      </text>
      <text x={pad} y={pad + cornerSize * 2 + 2} fontSize={cornerSize * 0.9} fontFamily="'JetBrains Mono', monospace" fill={color} style={{ userSelect: 'none' }}>
        {sym}
      </text>

      {/* Bottom-right rank + suit (inverted) */}
      <g transform={`rotate(180, ${w / 2}, ${h / 2})`}>
        <text x={pad} y={pad + cornerSize} fontSize={cornerSize} fontFamily="'JetBrains Mono', monospace" fontWeight={600} fill={color} style={{ userSelect: 'none' }}>
          {rank}
        </text>
        <text x={pad} y={pad + cornerSize * 2 + 2} fontSize={cornerSize * 0.9} fontFamily="'JetBrains Mono', monospace" fill={color} style={{ userSelect: 'none' }}>
          {sym}
        </text>
      </g>

      {/* Center illustration */}
      {rank === 'A' && <AceIllustration suit={suit} w={w} h={h} />}
      {rank === 'K' && <KingIllustration color={color} w={w} h={h} />}
      {rank === 'Q' && <QueenIllustration color={color} w={w} h={h} />}
      {rank === 'J' && <JackIllustration suit={suit} w={w} h={h} twoEyed={suit === 'd' || suit === 'c'} />}
      {!isNaN(pipNum) && pipNum >= 2 && <SuitPips count={pipNum} suit={suit} w={w} h={h} />}
    </svg>
  )
}
