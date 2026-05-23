// Avatar SVG renderer — viewBox 0 0 120 160
// Layer order (bottom → top): torso → shirt → hairBack → head → hairFront → face → accessory
// This z-order ensures long hair strands go BEHIND the face skin.

export const SKIN_TONES = [
  '#FDDBB4','#F1C27D','#E0AC69','#C68642','#8D5524','#4A2511'
]

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

const TEAM_RING = {
  aether: '#7C3AED', nova: '#D97706',
  pulse: '#E11D48',  void: '#0D9488',
}

// ─── Body (torso only — head is rendered separately after hair back) ──────────
function torso(skin) {
  return `
    <ellipse cx="60" cy="110" rx="28" ry="18" fill="${skin}"/>
    <rect x="32" y="100" width="56" height="32" rx="12" fill="${skin}"/>
  `
}

// ─── Shirt (always a t-shirt, standard body) ──────────────────────────────────
function shirt(col, skin) {
  // T-shirt path: collar points → shoulders → sleeves → hem
  const p = 'M40 98 L32 103 L19 107 L19 127 L32 127 L32 133 Q60 141 88 133 L88 127 L101 127 L101 107 L88 103 L80 98 Z'
  return `
    <path d="${p}" fill="${col}" opacity="0.95"/>
    <!-- forearms (skin exposed below sleeve) -->
    <rect x="20" y="127" width="11" height="14" rx="4" fill="${skin}"/>
    <rect x="89" y="127" width="11" height="14" rx="4" fill="${skin}"/>
  `
}

// ─── Hair — split into BACK (behind head) and FRONT (on top of head) ─────────
function hairBack(styleIdx, col) {
  // Only styles with strands/braids that should go BEHIND the face
  const s = [
    '',   // 0 short — no back
    // 1 medium — side strands behind ear level
    `<path d="M35 58 Q29 75 34 92" stroke="${col}" stroke-width="11" fill="none" stroke-linecap="round"/>
     <path d="M85 58 Q91 75 86 92" stroke="${col}" stroke-width="11" fill="none" stroke-linecap="round"/>`,
    // 2 long — full back strands + center
    `<path d="M34 56 Q27 90 33 120" stroke="${col}" stroke-width="12" fill="none" stroke-linecap="round"/>
     <path d="M86 56 Q93 90 87 120" stroke="${col}" stroke-width="12" fill="none" stroke-linecap="round"/>
     <rect x="49" y="62" width="22" height="62" rx="9" fill="${col}"/>`,
    '',   // 3 curly — volume only on top/sides, no back needed
    '',   // 4 fade
    '',   // 5 bun
    // 6 braids — long braids behind
    `<path d="M37 59 Q31 82 36 110" stroke="${col}" stroke-width="10" fill="none" stroke-linecap="round"/>
     <path d="M36 59 Q41 82 37 110" stroke="${col}" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.4"/>
     <path d="M83 59 Q89 82 84 110" stroke="${col}" stroke-width="10" fill="none" stroke-linecap="round"/>
     <path d="M84 59 Q79 82 83 110" stroke="${col}" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.4"/>`,
    // 7 afro — wide sides behind
    `<ellipse cx="35" cy="57" rx="13" ry="16" fill="${col}"/>
     <ellipse cx="85" cy="57" rx="13" ry="16" fill="${col}"/>`,
    '',   // 8 mohawk
    // 9 ponytail — tail goes behind
    `<path d="M80 55 Q93 70 88 102" stroke="${col}" stroke-width="11" fill="none" stroke-linecap="round"/>`,
  ]
  return s[styleIdx % s.length] || ''
}

function hairFront(styleIdx, col) {
  const s = [
    // 0 short / crew cut
    `<ellipse cx="60" cy="50" rx="24" ry="17" fill="${col}"/>
     <rect x="36" y="51" width="8" height="15" rx="4" fill="${col}"/>
     <rect x="76" y="51" width="8" height="15" rx="4" fill="${col}"/>`,
    // 1 medium — cap only (strands are in back)
    `<ellipse cx="60" cy="47" rx="25" ry="19" fill="${col}"/>`,
    // 2 long — cap only (strands are in back)
    `<ellipse cx="60" cy="46" rx="26" ry="20" fill="${col}"/>`,
    // 3 curly / voluminous
    `<ellipse cx="60" cy="43" rx="29" ry="23" fill="${col}"/>
     <ellipse cx="60" cy="35" rx="22" ry="11" fill="${col}"/>`,
    // 4 fade
    `<ellipse cx="60" cy="50" rx="22" ry="14" fill="${col}"/>
     <rect x="37" y="52" width="6" height="13" rx="3" fill="${col}" opacity="0.45"/>
     <rect x="77" y="52" width="6" height="13" rx="3" fill="${col}" opacity="0.45"/>`,
    // 5 top bun
    `<ellipse cx="60" cy="54" rx="22" ry="13" fill="${col}"/>
     <rect x="37" y="53" width="7" height="11" rx="3" fill="${col}"/>
     <rect x="76" y="53" width="7" height="11" rx="3" fill="${col}"/>
     <circle cx="60" cy="31" r="14" fill="${col}"/>
     <circle cx="60" cy="31" r="9" fill="${col}" opacity="0.55"/>`,
    // 6 braids — cap only
    `<ellipse cx="60" cy="47" rx="25" ry="18" fill="${col}"/>`,
    // 7 afro — center dome
    `<circle cx="60" cy="50" r="30" fill="${col}"/>
     <circle cx="60" cy="50" r="25" fill="${col}" opacity="0.7"/>`,
    // 8 mohawk
    `<ellipse cx="60" cy="56" rx="21" ry="11" fill="${col}" opacity="0.25"/>
     <rect x="54" y="22" width="12" height="38" rx="6" fill="${col}"/>
     <ellipse cx="60" cy="22" rx="8" ry="6" fill="${col}"/>`,
    // 9 ponytail — front cap + scrunchie
    `<ellipse cx="60" cy="50" rx="24" ry="16" fill="${col}"/>
     <rect x="37" y="52" width="7" height="12" rx="3" fill="${col}"/>
     <ellipse cx="86" cy="56" rx="7" ry="4" fill="${col}" opacity="0.5"/>`,
  ]
  return s[styleIdx % s.length] || ''
}

// ─── Face / Expression — realistic layered eyes ───────────────────────────────
function eye(cx, cy, squint = 0) {
  const IRIS = '#6B4226'
  return `
    <ellipse cx="${cx}" cy="${cy}" rx="7" ry="${5.5 - squint}" fill="white"/>
    <circle cx="${cx}" cy="${cy + 0.4}" r="3.8" fill="${IRIS}"/>
    <circle cx="${cx}" cy="${cy + 0.4}" r="2" fill="#0c0c0c"/>
    <circle cx="${cx + 2}" cy="${cy - 1.5}" r="1.2" fill="rgba(255,255,255,0.9)"/>
    <path d="M${cx - 7} ${cy - 1.5 + squint} Q${cx} ${cy - 6 + squint * 0.4} ${cx + 7} ${cy - 1.5 + squint}"
          stroke="#1a1a1a" stroke-width="1.4" fill="none"/>
  `
}

function brow(cx, yOff = 0, tilt = 0) {
  return `<path d="M${cx - 7} ${62 + yOff + tilt} Q${cx} ${59 + yOff} ${cx + 7} ${62 + yOff - tilt}"
        stroke="#1a1a1a" stroke-width="1.9" fill="none" stroke-linecap="round"/>`
}

const nose = `<path d="M58 78 Q60 81.5 62 78" stroke="rgba(0,0,0,0.17)" stroke-width="1.5" fill="none" stroke-linecap="round"/>`

function faceFeatures(expressionIdx) {
  const e = [
    // 0 neutral
    `${brow(50)}${brow(70)}${eye(50,70)}${eye(70,70)}${nose}
     <path d="M53 84 Q60 87.5 67 84" stroke="#b06868" stroke-width="2" fill="none" stroke-linecap="round"/>`,
    // 1 big smile
    `${brow(50,-2)}${brow(70,-2)}${eye(50,70,1.5)}${eye(70,70,1.5)}${nose}
     <path d="M51 83 Q60 92 69 83" stroke="#b06868" stroke-width="2.5" fill="none" stroke-linecap="round"/>
     <path d="M52.5 84.5 Q60 91 67.5 84.5" fill="rgba(255,255,255,0.55)"/>
     <ellipse cx="44" cy="77" rx="5" ry="3.5" fill="rgba(220,100,100,0.13)"/>
     <ellipse cx="76" cy="77" rx="5" ry="3.5" fill="rgba(220,100,100,0.13)"/>`,
    // 2 smirk
    `${brow(50,1)}${brow(70,-2,-1)}${eye(50,70)}${eye(70,70,0.8)}${nose}
     <path d="M53 85 Q60 87.5 68 83" stroke="#b06868" stroke-width="2" fill="none" stroke-linecap="round"/>`,
    // 3 focused
    `${brow(50,2,1)}${brow(70,2,-1)}${eye(50,70)}${eye(70,70)}${nose}
     <path d="M53 85 Q60 86.5 67 85" stroke="#b06868" stroke-width="1.8" fill="none" stroke-linecap="round"/>`,
    // 4 fierce
    `<path d="M43 64 Q50 60 57 63" stroke="#1a1a1a" stroke-width="2.2" fill="none" stroke-linecap="round"/>
     <path d="M63 63 Q70 60 77 64" stroke="#1a1a1a" stroke-width="2.2" fill="none" stroke-linecap="round"/>
     ${eye(50,71,0.5)}${eye(70,71,0.5)}${nose}
     <path d="M53 85 Q60 83.5 67 85" stroke="#b06868" stroke-width="2" fill="none" stroke-linecap="round"/>`,
    // 5 chill / heavy-lidded
    `${brow(50)}${brow(70)}
     <ellipse cx="50" cy="70" rx="7" ry="4" fill="white"/>
     <circle cx="50" cy="70.4" r="3.5" fill="#6B4226"/>
     <circle cx="50" cy="70.4" r="1.8" fill="#0c0c0c"/>
     <circle cx="52" cy="68.8" r="1.1" fill="rgba(255,255,255,0.9)"/>
     <path d="M43 67 Q50 65.5 57 67" stroke="#1a1a1a" stroke-width="1.8" fill="none"/>
     <ellipse cx="70" cy="70" rx="7" ry="4" fill="white"/>
     <circle cx="70" cy="70.4" r="3.5" fill="#6B4226"/>
     <circle cx="70" cy="70.4" r="1.8" fill="#0c0c0c"/>
     <circle cx="72" cy="68.8" r="1.1" fill="rgba(255,255,255,0.9)"/>
     <path d="M63 67 Q70 65.5 77 67" stroke="#1a1a1a" stroke-width="1.8" fill="none"/>
     ${nose}
     <path d="M54 84 Q60 88 66 84" stroke="#b06868" stroke-width="2" fill="none" stroke-linecap="round"/>`,
  ]
  return e[expressionIdx % e.length]
}

// ─── Accessories ──────────────────────────────────────────────────────────────
function accessory(idx) {
  if (idx === 0) return ''
  const acc = [
    '', // 0 none
    // 1 round glasses
    `<circle cx="48" cy="70" r="9.5" fill="rgba(200,230,255,0.07)" stroke="#2a2a2a" stroke-width="2"/>
     <circle cx="72" cy="70" r="9.5" fill="rgba(200,230,255,0.07)" stroke="#2a2a2a" stroke-width="2"/>
     <line x1="57.5" y1="70" x2="62.5" y2="70" stroke="#2a2a2a" stroke-width="2"/>
     <line x1="38.5" y1="67" x2="35.5" y2="65" stroke="#2a2a2a" stroke-width="2" stroke-linecap="round"/>
     <line x1="81.5" y1="67" x2="84.5" y2="65" stroke="#2a2a2a" stroke-width="2" stroke-linecap="round"/>`,
    // 2 baseball cap
    `<path d="M35 53 Q35 34 60 34 Q85 34 85 53 Q80 47 60 45 Q40 47 35 53Z" fill="#1a1a1a"/>
     <path d="M31 55 Q60 59 89 55 L89 53 Q60 57 31 53Z" fill="#141414"/>
     <circle cx="60" cy="34" r="3.5" fill="#2a2a2a"/>`,
    // 3 gold stud earrings
    `<circle cx="36" cy="73" r="4" fill="#C8A040"/>
     <circle cx="36" cy="73" r="2" fill="#F0C848"/>
     <circle cx="84" cy="73" r="4" fill="#C8A040"/>
     <circle cx="84" cy="73" r="2" fill="#F0C848"/>`,
    // 4 rectangular frames
    `<rect x="39" y="64.5" width="19" height="13" rx="2.5" fill="rgba(200,230,255,0.07)" stroke="#2a2a2a" stroke-width="2"/>
     <rect x="62" y="64.5" width="19" height="13" rx="2.5" fill="rgba(200,230,255,0.07)" stroke="#2a2a2a" stroke-width="2"/>
     <line x1="58" y1="71" x2="62" y2="71" stroke="#2a2a2a" stroke-width="2"/>
     <line x1="39" y1="68" x2="35.5" y2="65" stroke="#2a2a2a" stroke-width="2" stroke-linecap="round"/>
     <line x1="81" y1="68" x2="84.5" y2="65" stroke="#2a2a2a" stroke-width="2" stroke-linecap="round"/>`,
    // 5 silver hoop earrings
    `<circle cx="36" cy="76" r="7" stroke="#b8b8b8" stroke-width="2.5" fill="none"/>
     <circle cx="84" cy="76" r="7" stroke="#b8b8b8" stroke-width="2.5" fill="none"/>`,
    // 6 headband
    `<path d="M34 51 Q60 45 86 51 Q84 47 60 41 Q36 47 34 51Z" fill="#2a2a2a"/>`,
  ]
  return acc[idx % acc.length] || ''
}

// ─── Main renderer ────────────────────────────────────────────────────────────
export function renderAvatar(config = {}, size = 120, teamColor = '') {
  const {
    skin = 0, outfit = 0, hairStyle = 0, hairColor = 0,
    expression = 0, accessory: acc = 0
  } = config

  const skinTone  = SKIN_TONES[skin  % SKIN_TONES.length]
  const hairCol   = HAIR_COLORS[hairColor % HAIR_COLORS.length]
  const shirtCol  = SHIRT_COLORS[outfit % SHIRT_COLORS.length]
  const ringColor = TEAM_RING[teamColor] || 'transparent'
  const h = Math.round(size * (160 / 120))

  return `<svg viewBox="0 0 120 160" width="${size}" height="${h}" style="display:block">
    <!-- Team ring -->
    <circle cx="60" cy="75" r="58" fill="${ringColor}" opacity="0.12"/>
    <!-- Body torso -->
    ${torso(skinTone)}
    <!-- Shirt -->
    ${shirt(shirtCol, skinTone)}
    <!-- Hair BACK (behind head) -->
    ${hairBack(hairStyle, hairCol)}
    <!-- Head / face skin -->
    <ellipse cx="60" cy="68" rx="22" ry="26" fill="${skinTone}"/>
    <!-- Neck (bridge between head and shirt) -->
    <rect x="54" y="92" width="12" height="8" rx="3" fill="${skinTone}"/>
    <!-- Hair FRONT (cap on top of head) -->
    ${hairFront(hairStyle, hairCol)}
    <!-- Face features -->
    ${faceFeatures(expression)}
    <!-- Accessory -->
    ${accessory(acc)}
  </svg>`
}
