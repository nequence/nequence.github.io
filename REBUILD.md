# Sequence — Full UI Rebuild Plan

## Design Tokens
- Background: `#121212` dark grey (not black)
- Grid texture overlay: subtle white lines
- Glass panel: `rgba(255,255,255,.07)` + `blur(24px)` + `rgba(255,255,255,.14)` border
- Accent: `#ffffff` (white only — no purple)
- Team colors: red / blue / green / gold for gameplay chips only
- Base unit: 8px grid
- Font: system-ui / Inter

## Avatar System — CSS `--sz` variable
- Single `.av` component, size set via `style="--sz:Xpx"`
- `.av-face` — emoji at 60% of `--sz`, centered
- `.av-hat`  — emoji at 52% of `--sz`, `top: -26%`, floating above head
- `.av-extra` — emoji at 34% of `--sz`, `top: 18%`, overlaid on face (glasses position)
- Picker: Color (8) · Face (8) · Hat (6) · Extra (4), with large live preview

## Landing Page
- Centered glass card, max-width 520px, scrollable
- Logo → Name input → Avatar picker → Create/Join buttons → Rule pills

## Lobby Page (Kahoot-inspired)
- Full screen, dark bg with diagonal pattern
- Top bar: brand left, BIG room code center, leave right
- Main area: SEQUENCE logo + player count → player chip grid
- Player chips: `av` + name, color left-border accent (teams hidden from guests)
- Host extras: team count toggle + team dots on tiles + start button
- Non-host: animated "Waiting for host..." pill at bottom

## Game Screen
- Header: slim (44px) — room code + turn banner
- Score strip: compact (38px)  
- Game layout: full width, no max-width cap
- Mid-row: left info (80px) → poker table (flex:1) → right info (80px)
- Poker table: glass panel, edge card zones 40px, board fills rest
- Board: `gap:3px`, cells fill available space via grid fractions
- Board cells: cream bg, corner labels, face-body for Q/K, large suit for A
- Bottom player: my info bar (44px) + hand cards (5 units) with overflow:visible

## Hand Cards
- Width: 84px, height: 118px (standard)
- Hover: `translateY(-18px) scale(1.09)` — needs `padding-top:24px` on hand container
- Selected: white glow border

## Responsive Breakpoints
- `≤1100px`: reduce info zones to 70px
- `≤900px`:  reduce edge zones to 32px
- `≤680px`:  hide side info zones, smaller cards (64×90px), wrap header
- `≤440px`:  cards 54×76px
- `max-height:500px` (landscape phone): hide info zones, hide edges

## Bug Fixes in JS
- `startGame()`: use stored teamAssignments directly (round-robin on join = random enough)
- Avatar: `renderAvatar(str, sz='44px')` outputs `<div class="av" style="--sz:${sz}; background:...">`
- Lobby: hide `#team-view` always; non-host tiles no team badge
- `#active-hand`: `overflow:visible; padding-top:24px; margin-top:-14px`
- All board/table ancestors: `overflow:visible`
