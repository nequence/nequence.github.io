// SVG avatar compositor — viewBox="0 0 120 160"

const SKIN_TONES = ['#FDDBB4','#F1C27D','#E0AC69','#C68642','#8D5524','#4A2511']

export const HAIR_COLORS = [
  '#0d0805','#2a1505','#5c3010','#8a5018',
  '#c49050','#e8d080','#d8d8d8','#f5f5f5',
  '#b03030','#802cb0','#2855d0','#28a040',
]

export const SHIRT_COLORS = [
  '#222222','#F2F2F0','#1C3454','#1a3d28',
  '#4a1820','#2a2040','#6B4C1E','#1e3a50',
  '#5a3050','#888888',
]

const TEAM_COLORS = { aether:'#7C3AED', nova:'#D97706', pulse:'#E11D48', void:'#0D9488', none:'transparent' }

// ─── Body ───────────────────────────────────────────────────────────────────
function Body({ index, skinTone }) {
  const bodies = [
    <g key="b0" data-layer="body">
      <ellipse cx="60" cy="110" rx="28" ry="18" fill={skinTone} />
      <rect x="32" y="100" width="56" height="32" rx="12" fill={skinTone} />
      <ellipse cx="60" cy="68" rx="22" ry="26" fill={skinTone} />
    </g>,
    <g key="b1" data-layer="body">
      <ellipse cx="60" cy="112" rx="32" ry="18" fill={skinTone} />
      <rect x="28" y="100" width="64" height="32" rx="14" fill={skinTone} />
      <ellipse cx="60" cy="68" rx="24" ry="26" fill={skinTone} />
    </g>,
    <g key="b2" data-layer="body">
      <ellipse cx="60" cy="110" rx="22" ry="16" fill={skinTone} />
      <rect x="38" y="100" width="44" height="32" rx="10" fill={skinTone} />
      <ellipse cx="60" cy="68" rx="20" ry="26" fill={skinTone} />
    </g>,
    <g key="b3" data-layer="body">
      <ellipse cx="60" cy="110" rx="30" ry="18" fill={skinTone} />
      <path d="M30 100 Q60 95 90 100 L90 132 Q60 138 30 132Z" fill={skinTone} />
      <ellipse cx="60" cy="68" rx="23" ry="26" fill={skinTone} />
    </g>,
  ]
  return bodies[index % 4]
}

// ─── Outfit — always a t-shirt, color chosen by shirtColorIndex ──────────────
function Outfit({ shirtColorIndex = 0, skinTone, bodyIndex = 0 }) {
  const col = SHIRT_COLORS[shirtColorIndex % SHIRT_COLORS.length]

  const geos = [
    { x: 32, w: 56 }, { x: 28, w: 64 },
    { x: 38, w: 44 }, { x: 30, w: 60 },
  ]
  const { x, w } = geos[bodyIndex % 4]
  const cx  = x + w / 2
  const ext = Math.round(w * 0.23)
  const lox = x - ext
  const rox = x + w + ext
  const fw  = Math.max(7, ext - 2)
  const nt = 98, sh = nt + 5, se = sh + 24, tb = nt + 35

  // wide-collar t-shirt silhouette
  const path = [
    `M${cx - 20} ${nt}`,
    `L${x} ${sh}`, `L${lox} ${sh + 4}`, `L${lox} ${se}`,
    `L${x} ${se}`, `L${x} ${tb}`,
    `Q${cx} ${tb + 8} ${x + w} ${tb}`,
    `L${x + w} ${se}`, `L${rox} ${se}`, `L${rox} ${sh + 4}`,
    `L${x + w} ${sh}`, `L${cx + 20} ${nt}`, 'Z',
  ].join(' ')

  const flx = lox + Math.round((ext - fw) / 2)
  const frx = rox - ext + Math.round((ext - fw) / 2)

  return (
    <g>
      <path d={path} fill={col} opacity="0.94" />
      {/* Forearms */}
      <rect x={flx} y={se} width={fw} height={14} rx={4} fill={skinTone} />
      <rect x={frx} y={se} width={fw} height={14} rx={4} fill={skinTone} />
    </g>
  )
}

// ─── Hair ───────────────────────────────────────────────────────────────────
function Hair({ styleIndex, colorIndex }) {
  const col = HAIR_COLORS[colorIndex % HAIR_COLORS.length]

  const styles = [
    // 0: short / crew cut
    <g key="h0">
      <ellipse cx={60} cy={50} rx={24} ry={17} fill={col} />
      <rect x={36} y={51} width={8} height={15} rx={4} fill={col} />
      <rect x={76} y={51} width={8} height={15} rx={4} fill={col} />
    </g>,
    // 1: medium — chin length with side flow
    <g key="h1">
      <ellipse cx={60} cy={47} rx={25} ry={19} fill={col} />
      <path d="M35 58 Q29 75 34 92" stroke={col} strokeWidth={11} fill="none" strokeLinecap="round" />
      <path d="M85 58 Q91 75 86 92" stroke={col} strokeWidth={11} fill="none" strokeLinecap="round" />
    </g>,
    // 2: long straight
    <g key="h2">
      <ellipse cx={60} cy={46} rx={26} ry={20} fill={col} />
      <path d="M34 56 Q27 90 33 120" stroke={col} strokeWidth={12} fill="none" strokeLinecap="round" />
      <path d="M86 56 Q93 90 87 120" stroke={col} strokeWidth={12} fill="none" strokeLinecap="round" />
      <rect x={49} y={62} width={22} height={62} rx={9} fill={col} />
    </g>,
    // 3: curly / voluminous
    <g key="h3">
      <ellipse cx={60} cy={43} rx={29} ry={23} fill={col} />
      <ellipse cx={35} cy={57} rx={13} ry={16} fill={col} />
      <ellipse cx={85} cy={57} rx={13} ry={16} fill={col} />
      <ellipse cx={60} cy={35} rx={22} ry={11} fill={col} />
    </g>,
    // 4: fade (textured top, tight sides)
    <g key="h4">
      <ellipse cx={60} cy={50} rx={22} ry={14} fill={col} />
      <rect x={37} y={52} width={6} height={13} rx={3} fill={col} opacity="0.42" />
      <rect x={77} y={52} width={6} height={13} rx={3} fill={col} opacity="0.42" />
    </g>,
    // 5: top bun
    <g key="h5">
      <ellipse cx={60} cy={54} rx={22} ry={13} fill={col} />
      <circle cx={60} cy={31} r={14} fill={col} />
      <circle cx={60} cy={31} r={9} fill={col} opacity="0.55" />
      <rect x={37} y={53} width={7} height={11} rx={3} fill={col} />
      <rect x={76} y={53} width={7} height={11} rx={3} fill={col} />
    </g>,
    // 6: braids (two thick braids)
    <g key="h6">
      <ellipse cx={60} cy={47} rx={25} ry={18} fill={col} />
      <path d="M37 59 Q31 82 36 110" stroke={col} strokeWidth={10} fill="none" strokeLinecap="round" />
      <path d="M36 59 Q41 82 37 110" stroke={col} strokeWidth={5} fill="none" strokeLinecap="round" opacity="0.4" />
      <path d="M83 59 Q89 82 84 110" stroke={col} strokeWidth={10} fill="none" strokeLinecap="round" />
      <path d="M84 59 Q79 82 83 110" stroke={col} strokeWidth={5} fill="none" strokeLinecap="round" opacity="0.4" />
    </g>,
    // 7: afro / natural coils
    <g key="h7">
      <circle cx={60} cy={50} r={32} fill={col} />
      <circle cx={60} cy={50} r={28} fill={col} opacity="0.7" />
      <circle cx={60} cy={50} r={23} fill={col} opacity="0.45" />
    </g>,
    // 8: mohawk / faux hawk
    <g key="h8">
      <ellipse cx={60} cy={56} rx={21} ry={11} fill={col} opacity="0.28" />
      <rect x={54} y={22} width={12} height={38} rx={6} fill={col} />
      <ellipse cx={60} cy={22} rx={8} ry={6} fill={col} />
    </g>,
    // 9: ponytail
    <g key="h9">
      <ellipse cx={60} cy={50} rx={24} ry={16} fill={col} />
      <path d="M80 55 Q93 70 88 102" stroke={col} strokeWidth={11} fill="none" strokeLinecap="round" />
      <rect x={37} y={52} width={7} height={12} rx={3} fill={col} />
      <ellipse cx={86} cy={56} rx={7} ry={4} fill={col} opacity="0.5" />
    </g>,
  ]
  return styles[styleIndex % 10]
}

// ─── Face / Expression — realistic eyes with sclera + iris + pupil ──────────
function Face({ index }) {
  const IRIS = '#6B4226'

  function eye(cx, cy, squint = 0) {
    return (
      <g>
        <ellipse cx={cx} cy={cy} rx={7} ry={5.5 - squint} fill="white" />
        <circle  cx={cx} cy={cy + 0.4} r={3.8} fill={IRIS} />
        <circle  cx={cx} cy={cy + 0.4} r={2}   fill="#0c0c0c" />
        <circle  cx={cx + 2} cy={cy - 1.5} r={1.2} fill="rgba(255,255,255,0.9)" />
        <path d={`M${cx - 7} ${cy - 1.5 + squint} Q${cx} ${cy - 6 + squint * 0.4} ${cx + 7} ${cy - 1.5 + squint}`}
              stroke="#1a1a1a" strokeWidth={1.4} fill="none" />
      </g>
    )
  }

  function brow(cx, yOff = 0, tilt = 0) {
    return (
      <path d={`M${cx - 7} ${62 + yOff + tilt} Q${cx} ${59 + yOff} ${cx + 7} ${62 + yOff - tilt}`}
            stroke="#1a1a1a" strokeWidth={1.9} fill="none" strokeLinecap="round" />
    )
  }

  const nose = <path d="M58 78 Q60 81.5 62 78" stroke="rgba(0,0,0,0.17)" strokeWidth={1.5} fill="none" strokeLinecap="round" />

  const exprs = [
    // 0: neutral
    <g key="f0">
      {brow(50)}{brow(70)}
      {eye(50,70)}{eye(70,70)}
      {nose}
      <path d="M53 84 Q60 87.5 67 84" stroke="#b06868" strokeWidth={2} fill="none" strokeLinecap="round" />
    </g>,
    // 1: big smile
    <g key="f1">
      {brow(50,-2)}{brow(70,-2)}
      {eye(50,70,1.5)}{eye(70,70,1.5)}
      {nose}
      <path d="M51 83 Q60 92 69 83" stroke="#b06868" strokeWidth={2.5} fill="none" strokeLinecap="round" />
      <path d="M52.5 84.5 Q60 91 67.5 84.5" fill="rgba(255,255,255,0.55)" />
      <ellipse cx={44} cy={77} rx={5} ry={3.5} fill="rgba(220,100,100,0.13)" />
      <ellipse cx={76} cy={77} rx={5} ry={3.5} fill="rgba(220,100,100,0.13)" />
    </g>,
    // 2: smirk
    <g key="f2">
      {brow(50,1)}{brow(70,-2,-1)}
      {eye(50,70)}{eye(70,70,0.8)}
      {nose}
      <path d="M53 85 Q60 87.5 68 83" stroke="#b06868" strokeWidth={2} fill="none" strokeLinecap="round" />
    </g>,
    // 3: focused / serious
    <g key="f3">
      {brow(50,2,1)}{brow(70,2,-1)}
      {eye(50,70)}{eye(70,70)}
      {nose}
      <path d="M53 85 Q60 86.5 67 85" stroke="#b06868" strokeWidth={1.8} fill="none" strokeLinecap="round" />
    </g>,
    // 4: fierce / intense
    <g key="f4">
      <path d="M43 64 Q50 60 57 63" stroke="#1a1a1a" strokeWidth={2.2} fill="none" strokeLinecap="round" />
      <path d="M63 63 Q70 60 77 64" stroke="#1a1a1a" strokeWidth={2.2} fill="none" strokeLinecap="round" />
      {eye(50,71,0.5)}{eye(70,71,0.5)}
      {nose}
      <path d="M53 85 Q60 83.5 67 85" stroke="#b06868" strokeWidth={2} fill="none" strokeLinecap="round" />
    </g>,
    // 5: chill / heavy-lidded
    <g key="f5">
      {brow(50)}{brow(70)}
      <ellipse cx={50} cy={70} rx={7} ry={4} fill="white" />
      <circle  cx={50} cy={70.4} r={3.5} fill={IRIS} />
      <circle  cx={50} cy={70.4} r={1.8} fill="#0c0c0c" />
      <circle  cx={52} cy={68.8} r={1.1} fill="rgba(255,255,255,0.9)" />
      <path d="M43 67 Q50 65.5 57 67" stroke="#1a1a1a" strokeWidth={1.8} fill="none" />
      <ellipse cx={70} cy={70} rx={7} ry={4} fill="white" />
      <circle  cx={70} cy={70.4} r={3.5} fill={IRIS} />
      <circle  cx={70} cy={70.4} r={1.8} fill="#0c0c0c" />
      <circle  cx={72} cy={68.8} r={1.1} fill="rgba(255,255,255,0.9)" />
      <path d="M63 67 Q70 65.5 77 67" stroke="#1a1a1a" strokeWidth={1.8} fill="none" />
      {nose}
      <path d="M54 84 Q60 88 66 84" stroke="#b06868" strokeWidth={2} fill="none" strokeLinecap="round" />
    </g>,
  ]
  return exprs[index % 6]
}

// ─── Accessories ────────────────────────────────────────────────────────────
function Accessory({ index }) {
  if (index === 0) return null
  const acc = [
    null,
    // 1: round glasses
    <g key="a1">
      <circle cx={48} cy={70} r={9.5} fill="rgba(200,230,255,0.07)" stroke="#2a2a2a" strokeWidth={2} />
      <circle cx={72} cy={70} r={9.5} fill="rgba(200,230,255,0.07)" stroke="#2a2a2a" strokeWidth={2} />
      <line x1="57.5" y1="70" x2="62.5" y2="70" stroke="#2a2a2a" strokeWidth={2} />
      <line x1="38.5" y1="67" x2="35.5" y2="65" stroke="#2a2a2a" strokeWidth={2} strokeLinecap="round" />
      <line x1="81.5" y1="67" x2="84.5" y2="65" stroke="#2a2a2a" strokeWidth={2} strokeLinecap="round" />
    </g>,
    // 2: baseball cap (sits over hair)
    <g key="a2">
      <path d="M35 53 Q35 34 60 34 Q85 34 85 53 Q80 47 60 45 Q40 47 35 53Z" fill="#1a1a1a" />
      <path d="M31 55 Q60 59 89 55 L89 53 Q60 57 31 53Z" fill="#141414" />
      <circle cx={60} cy={34} r={3.5} fill="#2a2a2a" />
      <path d="M35 53 Q60 55 85 53" stroke="rgba(255,255,255,0.1)" strokeWidth={1.5} fill="none" />
    </g>,
    // 3: gold stud earrings
    <g key="a3">
      <circle cx={36} cy={73} r={4}   fill="#C8A040" />
      <circle cx={36} cy={73} r={2}   fill="#F0C848" />
      <circle cx={84} cy={73} r={4}   fill="#C8A040" />
      <circle cx={84} cy={73} r={2}   fill="#F0C848" />
    </g>,
    // 4: rectangular frames
    <g key="a4">
      <rect x={39} y={64.5} width={19} height={13} rx={2.5} fill="rgba(200,230,255,0.07)" stroke="#2a2a2a" strokeWidth={2} />
      <rect x={62} y={64.5} width={19} height={13} rx={2.5} fill="rgba(200,230,255,0.07)" stroke="#2a2a2a" strokeWidth={2} />
      <line x1="58" y1="71" x2="62" y2="71" stroke="#2a2a2a" strokeWidth={2} />
      <line x1="39" y1="68" x2="35.5" y2="65" stroke="#2a2a2a" strokeWidth={2} strokeLinecap="round" />
      <line x1="81" y1="68" x2="84.5" y2="65" stroke="#2a2a2a" strokeWidth={2} strokeLinecap="round" />
    </g>,
    // 5: silver hoop earrings
    <g key="a5">
      <circle cx={36} cy={76} r={7} stroke="#b8b8b8" strokeWidth={2.5} fill="none" />
      <circle cx={84} cy={76} r={7} stroke="#b8b8b8" strokeWidth={2.5} fill="none" />
    </g>,
    // 6: dark fabric headband (over hair)
    <g key="a6">
      <path d="M34 51 Q60 45 86 51 Q84 47 60 41 Q36 47 34 51Z" fill="#2a2a2a" />
      <path d="M34 51 Q60 47 86 51" stroke="rgba(255,255,255,0.1)" strokeWidth={1} fill="none" />
    </g>,
  ]
  return acc[index % acc.length] || null
}

// ─── Compositor ─────────────────────────────────────────────────────────────
export default function AvatarLayers({ config = {}, teamColor = 'none', size = 120 }) {
  const { body = 0, skin = 0, outfit = 0, hairStyle = 0, hairColor = 0, expression = 0, accessory = 0 } = config
  const skinTone = SKIN_TONES[skin % SKIN_TONES.length]
  const teamCol  = TEAM_COLORS[teamColor] || 'transparent'

  return (
    <svg viewBox="0 0 120 160" width={size} height={size * (160 / 120)} style={{ display: 'block' }}>
      <circle cx="60" cy="75" r="58" fill={teamCol} opacity="0.12" />
      <Body index={body} skinTone={skinTone} />
      <Outfit shirtColorIndex={outfit} skinTone={skinTone} bodyIndex={body} />
      <Hair styleIndex={hairStyle} colorIndex={hairColor} />
      <Face index={expression} />
      <Accessory index={accessory} />
    </svg>
  )
}
