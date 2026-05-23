// SVG avatar compositor. All layers share viewBox="0 0 120 160".
// Accessories are anchored to correct face/head geometry.

const SKIN_TONES = ['#FDDBB4','#F1C27D','#E0AC69','#C68642','#8D5524','#4A2511']
const HAIR_COLORS = [
  '#1a1a1a','#3B1F0A','#7B3F00','#C49A6C','#F5D76E',
  '#E8E8E8','#D94F5C','#7B2FBE','#2563EB','#16A34A',
  '#EA580C','#0891B2',
]
const TEAM_COLORS = {
  aether: '#7C3AED', nova: '#D97706', pulse: '#E11D48', void: '#0D9488', none: 'transparent',
}

// Body silhouettes (4 options)
function Body({ index, skinTone }) {
  const bodies = [
    // 0: standard
    <g key="b0" data-layer="body">
      <ellipse cx="60" cy="110" rx="28" ry="18" fill={skinTone} />
      <rect x="32" y="100" width="56" height="32" rx="12" fill={skinTone} />
      <ellipse cx="60" cy="68" rx="22" ry="26" fill={skinTone} />
    </g>,
    // 1: broader
    <g key="b1" data-layer="body">
      <ellipse cx="60" cy="112" rx="32" ry="18" fill={skinTone} />
      <rect x="28" y="100" width="64" height="32" rx="14" fill={skinTone} />
      <ellipse cx="60" cy="68" rx="24" ry="26" fill={skinTone} />
    </g>,
    // 2: slim
    <g key="b2" data-layer="body">
      <ellipse cx="60" cy="110" rx="22" ry="16" fill={skinTone} />
      <rect x="38" y="100" width="44" height="32" rx="10" fill={skinTone} />
      <ellipse cx="60" cy="68" rx="20" ry="26" fill={skinTone} />
    </g>,
    // 3: athletic
    <g key="b3" data-layer="body">
      <ellipse cx="60" cy="110" rx="30" ry="18" fill={skinTone} />
      <path d="M30 100 Q60 95 90 100 L90 132 Q60 138 30 132Z" fill={skinTone} />
      <ellipse cx="60" cy="68" rx="23" ry="26" fill={skinTone} />
    </g>,
  ]
  return bodies[index % 4]
}

// Outfits — T-shirt silhouette path so sleeves always fit the selected body perfectly
function Outfit({ index, skinTone, bodyIndex = 0 }) {
  const cols = ['#2A2A2A','#1A1A1A','#3D3D3D','#4A4A4A','#141414','#555555','#222222','#383838']
  const col = cols[index % 8]

  // Match Body torso exactly
  const geos = [
    { x: 32, w: 56 },  // standard
    { x: 28, w: 64 },  // broad
    { x: 38, w: 44 },  // slim
    { x: 30, w: 60 },  // athletic
  ]
  const { x, w } = geos[bodyIndex % 4]
  const cx  = x + w / 2   // always 60

  const ext = Math.round(w * 0.23)  // sleeve extension past torso edge
  const lox = x - ext               // left outer sleeve edge
  const rox = x + w + ext           // right outer sleeve edge
  const fw  = Math.max(7, ext - 2)  // forearm width (skin)

  // Key y coordinates
  const nt  = 98            // collar/neckline top
  const sh  = nt + 5        // shoulder level
  const se  = sh + 24       // sleeve hem
  const tb  = nt + 35       // torso bottom

  // Single closed path: collar → left shoulder → left sleeve → torso base → right sleeve → right shoulder → collar
  function sil(neckW = 14) {
    return [
      `M${cx - neckW} ${nt}`,
      `L${x} ${sh}`,
      `L${lox} ${sh + 4}`,
      `L${lox} ${se}`,
      `L${x} ${se}`,
      `L${x} ${tb}`,
      `Q${cx} ${tb + 8} ${x + w} ${tb}`,
      `L${x + w} ${se}`,
      `L${rox} ${se}`,
      `L${rox} ${sh + 4}`,
      `L${x + w} ${sh}`,
      `L${cx + neckW} ${nt}`,
      'Z',
    ].join(' ')
  }

  // Forearms (skin) centered inside each sleeve
  const flx = lox + Math.round((ext - fw) / 2)
  const frx = rox - ext + Math.round((ext - fw) / 2)
  const forearms = <>
    <rect x={flx} y={se} width={fw} height={14} rx={4} fill={skinTone} />
    <rect x={frx} y={se} width={fw} height={14} rx={4} fill={skinTone} />
  </>

  const outfits = [
    // 0: hoodie
    <g key="o0">
      <path d={sil(14)} fill={col} opacity="0.93" />
      <rect x={cx - 10} y={tb - 11} width={20} height={10} rx={3} fill="rgba(255,255,255,0.06)" />
      {forearms}
    </g>,
    // 1: open jacket
    <g key="o1">
      <path d={sil(14)} fill={col} />
      <line x1={cx} y1={sh} x2={cx} y2={tb} stroke="rgba(0,0,0,0.4)" strokeWidth={2} />
      <rect x={x + 4}     y={sh + 3} width={8} height={10} rx={2} fill="rgba(255,255,255,0.1)" />
      <rect x={x + w - 12} y={sh + 3} width={8} height={10} rx={2} fill="rgba(255,255,255,0.1)" />
      {forearms}
    </g>,
    // 2: t-shirt (wide collar)
    <g key="o2">
      <path d={sil(20)} fill={col} />
      {forearms}
    </g>,
    // 3: turtleneck
    <g key="o3">
      <path d={sil(10)} fill={col} />
      <rect x={cx - 10} y={nt - 13} width={20} height={16} rx={6} fill={col} />
      {forearms}
    </g>,
    // 4: zip-up
    <g key="o4">
      <path d={sil(14)} fill={col} />
      <rect x={cx - 1.5} y={sh} width={3} height={tb - sh} fill="rgba(255,255,255,0.2)" />
      <circle cx={cx} cy={sh + 5} r={3.5} fill="rgba(255,255,255,0.28)" />
      {forearms}
    </g>,
    // 5: striped
    <g key="o5">
      <path d={sil(16)} fill={col} />
      <rect x={x + 4} y={sh + 4} width={w - 8} height={3} rx="1.5" fill="rgba(255,255,255,0.28)" />
      <rect x={x + 4} y={sh + 11} width={w - 8} height={3} rx="1.5" fill="rgba(255,255,255,0.14)" />
      {forearms}
    </g>,
    // 6: bomber
    <g key="o6">
      <path d={sil(14)} fill={col} />
      <rect x={x + 2} y={nt + 2} width={w - 4} height={6} rx={2} fill="rgba(255,255,255,0.1)" />
      <rect x={x + 4} y={nt + 10} width={w - 8} height={2} rx="1" fill="rgba(255,255,255,0.16)" />
      {forearms}
    </g>,
    // 7: mock-neck
    <g key="o7">
      <path d={sil(10)} fill={col} />
      <rect x={cx - 10} y={nt - 10} width={20} height={13} rx={5} fill={col} opacity="0.92" />
      {forearms}
    </g>,
  ]
  return outfits[index % 8]
}

// Hair styles (10 options)
function Hair({ styleIndex, colorIndex }) {
  const col = HAIR_COLORS[colorIndex % HAIR_COLORS.length]
  const styles = [
    // 0: short
    <g key="h0"><ellipse cx="60" cy="44" rx="23" ry="20" fill={col} /><rect x="37" y="44" width="46" height="8" fill={col} /></g>,
    // 1: medium
    <g key="h1"><ellipse cx="60" cy="42" rx="24" ry="22" fill={col} /><path d="M36 50 Q34 70 38 80" stroke={col} strokeWidth="8" fill="none" strokeLinecap="round" /><path d="M84 50 Q86 70 82 80" stroke={col} strokeWidth="8" fill="none" strokeLinecap="round" /></g>,
    // 2: long
    <g key="h2"><ellipse cx="60" cy="42" rx="24" ry="22" fill={col} /><rect x="35" y="50" width="9" height="55" rx="5" fill={col} /><rect x="76" y="50" width="9" height="55" rx="5" fill={col} /></g>,
    // 3: curly
    <g key="h3"><ellipse cx="60" cy="40" rx="26" ry="24" fill={col} /><ellipse cx="38" cy="50" rx="10" ry="12" fill={col} /><ellipse cx="82" cy="50" rx="10" ry="12" fill={col} /></g>,
    // 4: fade
    <g key="h4"><ellipse cx="60" cy="44" rx="23" ry="18" fill={col} /><path d="M37 52 Q37 62 42 62" stroke={col} strokeWidth="3" fill="none" /><path d="M83 52 Q83 62 78 62" stroke={col} strokeWidth="3" fill="none" /></g>,
    // 5: bun
    <g key="h5"><ellipse cx="60" cy="46" rx="22" ry="18" fill={col} /><circle cx="60" cy="26" r="11" fill={col} /></g>,
    // 6: braids
    <g key="h6"><ellipse cx="60" cy="42" rx="23" ry="20" fill={col} /><path d="M45 60 Q42 90 46 105" stroke={col} strokeWidth="7" strokeLinecap="round" fill="none" /><path d="M75 60 Q78 90 74 105" stroke={col} strokeWidth="7" strokeLinecap="round" fill="none" /></g>,
    // 7: afro
    <g key="h7"><ellipse cx="60" cy="40" rx="30" ry="28" fill={col} /></g>,
    // 8: mohawk
    <g key="h8"><ellipse cx="60" cy="52" rx="20" ry="14" fill={col} /><rect x="55" y="18" width="10" height="38" rx="5" fill={col} /></g>,
    // 9: ponytail
    <g key="h9"><ellipse cx="60" cy="44" rx="23" ry="20" fill={col} /><path d="M79 44 Q90 50 85 75 Q82 88 78 90" stroke={col} strokeWidth="8" fill="none" strokeLinecap="round" /></g>,
  ]
  return styles[styleIndex % 10]
}

// Face / expression (6 moods)
function Face({ index, skinTone }) {
  const brow = 'var(--text-primary)'
  const expressions = [
    // 0: neutral
    <g key="f0">
      <ellipse cx="50" cy="72" rx="5" ry="6" fill="#1a1a1a" />
      <ellipse cx="70" cy="72" rx="5" ry="6" fill="#1a1a1a" />
      <ellipse cx="51" cy="71" rx="2" ry="2" fill="rgba(255,255,255,0.6)" />
      <ellipse cx="71" cy="71" rx="2" ry="2" fill="rgba(255,255,255,0.6)" />
      <path d="M52 83 Q60 87 68 83" stroke="#555" strokeWidth="2" fill="none" strokeLinecap="round" />
    </g>,
    // 1: smile
    <g key="f1">
      <ellipse cx="50" cy="71" rx="5" ry="6" fill="#1a1a1a" />
      <ellipse cx="70" cy="71" rx="5" ry="6" fill="#1a1a1a" />
      <ellipse cx="51" cy="70" rx="2" ry="2" fill="rgba(255,255,255,0.6)" />
      <ellipse cx="71" cy="70" rx="2" ry="2" fill="rgba(255,255,255,0.6)" />
      <path d="M50 84 Q60 92 70 84" stroke="#888888" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M52 84 Q60 90 68 84" fill="rgba(255,255,255,0.2)" />
    </g>,
    // 2: smirk
    <g key="f2">
      <ellipse cx="50" cy="71" rx="5" ry="6" fill="#1a1a1a" />
      <ellipse cx="70" cy="71" rx="5" ry="6" fill="#1a1a1a" />
      <ellipse cx="51" cy="70" rx="2" ry="2" fill="rgba(255,255,255,0.6)" />
      <ellipse cx="71" cy="70" rx="2" ry="2" fill="rgba(255,255,255,0.6)" />
      <path d="M52 85 Q62 89 70 84" stroke="#888888" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    </g>,
    // 3: focused
    <g key="f3">
      <path d="M44 65 Q50 63 56 65" stroke={brow} strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M64 65 Q70 63 76 65" stroke={brow} strokeWidth="2" fill="none" strokeLinecap="round" />
      <ellipse cx="50" cy="72" rx="5" ry="5.5" fill="#1a1a1a" />
      <ellipse cx="70" cy="72" rx="5" ry="5.5" fill="#1a1a1a" />
      <ellipse cx="51" cy="71" rx="2" ry="2" fill="rgba(255,255,255,0.6)" />
      <ellipse cx="71" cy="71" rx="2" ry="2" fill="rgba(255,255,255,0.6)" />
      <path d="M52 84 Q60 87 68 84" stroke="#555" strokeWidth="2" fill="none" strokeLinecap="round" />
    </g>,
    // 4: fierce
    <g key="f4">
      <path d="M44 66 Q50 62 57 65" stroke={brow} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M63 65 Q70 62 76 66" stroke={brow} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <ellipse cx="50" cy="73" rx="5" ry="5" fill="#1a1a1a" />
      <ellipse cx="70" cy="73" rx="5" ry="5" fill="#1a1a1a" />
      <ellipse cx="51" cy="72" rx="2" ry="2" fill="rgba(255,255,255,0.5)" />
      <ellipse cx="71" cy="72" rx="2" ry="2" fill="rgba(255,255,255,0.5)" />
      <path d="M50 85 Q60 82 70 85" stroke="#888888" strokeWidth="2" fill="none" strokeLinecap="round" />
    </g>,
    // 5: chill
    <g key="f5">
      <path d="M45 70 Q50 72 55 70" stroke="#1a1a2e" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M65 70 Q70 72 75 70" stroke="#1a1a2e" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M52 83 Q60 89 68 83" stroke="#888888" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    </g>,
  ]
  return expressions[index % 6]
}

// Accessories (6 types + none)
function Accessory({ index }) {
  if (index === 0) return null // none
  const accessories = [
    null, // 0
    // 1: round glasses
    <g key="a1">
      <circle cx="48" cy="72" r="9" stroke="rgba(255,255,255,0.5)" strokeWidth="2" fill="rgba(255,255,255,0.05)" />
      <circle cx="68" cy="72" r="9" stroke="rgba(255,255,255,0.5)" strokeWidth="2" fill="rgba(255,255,255,0.05)" />
      <line x1="57" y1="72" x2="59" y2="72" stroke="rgba(255,255,255,0.5)" strokeWidth="2" />
      <line x1="37" y1="72" x2="39" y2="72" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" />
      <line x1="77" y1="72" x2="80" y2="72" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" />
    </g>,
    // 2: cap
    <g key="a2">
      <ellipse cx="60" cy="37" rx="26" ry="10" fill="#1a1a1a" />
      <rect x="34" y="30" width="52" height="12" rx="4" fill="#2a2a2a" />
      <rect x="34" y="36" width="65" height="5" rx="2" fill="#2a2a2a" />
    </g>,
    // 3: earrings (studs)
    <g key="a3">
      <circle cx="37" cy="74" r="3" fill="rgba(255,255,255,0.85)" />
      <circle cx="83" cy="74" r="3" fill="rgba(255,255,255,0.85)" />
    </g>,
    // 4: rectangular glasses
    <g key="a4">
      <rect x="39" y="66" width="18" height="12" rx="3" stroke="rgba(255,255,255,0.5)" strokeWidth="2" fill="rgba(255,255,255,0.05)" />
      <rect x="59" y="66" width="18" height="12" rx="3" stroke="rgba(255,255,255,0.5)" strokeWidth="2" fill="rgba(255,255,255,0.05)" />
      <line x1="57" y1="72" x2="59" y2="72" stroke="rgba(255,255,255,0.5)" strokeWidth="2" />
      <line x1="37" y1="72" x2="39" y2="72" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" />
      <line x1="77" y1="72" x2="80" y2="72" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" />
    </g>,
    // 5: hoop earrings
    <g key="a5">
      <circle cx="37" cy="76" r="5" stroke="#C8C8D8" strokeWidth="2" fill="none" />
      <circle cx="83" cy="76" r="5" stroke="#C8C8D8" strokeWidth="2" fill="none" />
    </g>,
    // 6: headband
    <g key="a6">
      <rect x="34" y="42" width="52" height="8" rx="4" fill="#3A3A3A" />
    </g>,
  ]
  return accessories[index % accessories.length] || null
}

export default function AvatarLayers({ config = {}, teamColor = 'none', size = 120 }) {
  const { body = 0, skin = 0, outfit = 0, hairStyle = 0, hairColor = 0, expression = 0, accessory = 0 } = config
  const skinTone = SKIN_TONES[skin % SKIN_TONES.length]
  const teamCol = TEAM_COLORS[teamColor] || 'transparent'

  return (
    <svg
      viewBox="0 0 120 160"
      width={size}
      height={size * (160 / 120)}
      style={{ display: 'block' }}
    >
      {/* Layer 0: team background ring */}
      <circle cx="60" cy="75" r="58" fill={teamCol} opacity="0.12" />

      {/* Layer 1+2: body + skin */}
      <Body index={body} skinTone={skinTone} />

      {/* Layer 3: outfit */}
      <Outfit index={outfit} skinTone={skinTone} bodyIndex={body} />

      {/* Layer 4+5: hair */}
      <Hair styleIndex={hairStyle} colorIndex={hairColor} />

      {/* Layer 6: face / expression */}
      <Face index={expression} skinTone={skinTone} />

      {/* Layer 7: accessory */}
      <Accessory index={accessory} />
    </svg>
  )
}
