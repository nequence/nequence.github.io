# Sequence Board Game — Full Product Plan

---

## 1. Product Overview

### What the App Is
A fully functional browser-based multiplayer Sequence board game that runs entirely in one frontend project. Players create or join private rooms using a shareable code, link, or QR code — then play a complete game of Sequence with up to 16+ players across dynamic teams.

### Core Features
- Create a private room (generates unique 6-char code + shareable link + QR code)
- Join room via code, link, or QR scan
- **2–16+ players** with dynamic team scaling
- **Standard Mode** (2–8 players) and **Party Mode** (9–16+ players)
- Full Sequence game logic (card dealing, chip placement, special Jacks, sequence detection, win conditions)
- Live multiplayer state sync via Firebase Realtime Database (free tier — no server setup, just a config key)
- Premium tabletop-inspired UI: green felt, warm wood, physical animations

### Design Goal
**"A real board game night experience — cinematic, smooth, and playable online with up to 16 players."**

The UI must feel:
- Like a luxury wooden table with green felt
- Warm lighting, physical card and chip interaction
- NOT dark futuristic / cyberpunk UI

---

## 2. Player System

### Player Limits
| Bound | Value |
|-------|-------|
| Minimum | 2 players |
| Maximum | 16+ players |

### Two Gameplay Modes

#### Standard Mode (2–8 players)
- Classic Sequence rules with balanced turn pacing
- Clear strategy gameplay
- Recommended experience for focused play

#### Party Mode (9–16+ players)
- Same core rules but with:
  - Faster turn pace
  - More chaotic board dynamics
  - Team-based dominance emphasized
  - Optional 20–30s turn timer auto-enabled
- Designed for group/friends party games

---

## 3. Team System (Dynamic)

### Auto-Scaling OR Host-Defined
Teams scale based on player count or are manually set by the host:

| Players | Default Teams |
|---------|--------------|
| 2–4 | 2 teams |
| 5–8 | 2–3 teams |
| 9–12 | 3–4 teams |
| 13–16+ | 4–6 teams |

### Key Rules
- Teams > individual identity at scale
- Wins belong to **teams**, not individual players
- Players are assigned to teams round-robin in join order (host can reassign)
- Team sizes don't need to be exactly equal

### Team Colors
| Slot | Color Name | Hex |
|------|-----------|-----|
| Team 1 | Ruby Red | `#c0392b` |
| Team 2 | Sapphire Blue | `#2471a3` |
| Team 3 | Emerald Green | `#1e8449` |
| Team 4 | Amber Gold | `#d4813a` |
| Team 5 | Deep Purple | `#7d3c98` |
| Team 6 | Teal | `#148f77` |

---

## 4. Win Conditions

### Team-Based Win System
| Teams | Sequences Required to Win |
|-------|--------------------------|
| 2 teams | 3 sequences |
| 3–4 teams | 2 sequences |
| 5–6 teams | 1–2 sequences |

### Sequence Definition
A sequence = **5 chips of the same team in a row**:
- Horizontal
- Vertical
- Diagonal (both directions)

Additional rules:
- Corner spaces = wild/free spaces (count for any team's sequence)
- A single chip can be shared between two intersecting sequences
- A completed sequence's chips cannot be removed by a One-Eyed Jack

---

## 5. Turn System

### Global Turn Rotation
Turns rotate through all players in join order:
```
P1 → P2 → P3 → ... → P16 → repeat
```

### Speed Scaling
| Players | Turn Feel |
|---------|-----------|
| 2–6 | Normal paced |
| 7–10 | Slightly faster |
| 11–16+ | Fast-paced / Party Mode |

### Turn Timer
- Off by default for Standard Mode (2–8 players)
- Auto-enabled (30s) for Party Mode (9–16+ players)
- Host can toggle timer on/off in lobby settings

### UI Compact Mode — Auto-Enabled at 12+ Players
When player count reaches 12 or more, the UI applies CSS adjustments only — no logic changes:
- Player avatars in the sidebar group by team (smaller avatar size, tighter spacing)
- Hand becomes a **horizontally scrollable strip** (`overflow-x: auto`, no wrapping)
- Board cell size reduced slightly via CSS to fit the screen better
- No new systems, no architecture changes — purely CSS class toggling

### A Turn Consists Of
1. Play 1 card from hand
2. Place 1 chip on the corresponding board space
3. Draw 1 card from the deck to refill hand
4. Turn passes to next player

### Dead Card Rule
If all board spaces for every card in your hand are already taken, you may discard one card and draw a replacement without placing a chip.

### Turn Progression
- Turn progression is controlled by `currentPlayerIndex` in Firebase
- The active player updates only the necessary fields using Firebase `.update()`:
  - `boardState` (the newly placed chip)
  - their own `hand` (card removed)
  - `deck` / `discardPile` (if a card was drawn)
  - `sequences` (if a sequence was formed)
  - `teamScores` (if score changed)
  - `currentPlayerIndex` (advance to next player)
- UI can optimistically reflect the player's own action immediately, then re-syncs from Firebase on the next `onValue()` update
- Any mismatch between local optimistic state and Firebase resolves by re-rendering from the Firebase snapshot

---

## 6. Card System

### Deck
- Standard Sequence deck = 2 full decks of 52 cards = **104 cards total**
- Jacks are NOT placed on the board (they're special action cards)
- Each non-Jack rank/suit appears exactly **twice** on the 10×10 board

### Hand Sizes
| Players | Cards Per Hand |
|---------|---------------|
| 2 players | 7 cards |
| 3–6 players | 6 cards |
| 7–10 players | 5 cards |
| 11–16+ players | 4 cards |

### Special Cards — Jacks
| Jack Type | Eyes | Suits | Action |
|-----------|------|-------|--------|
| Two-Eyed Jack | 2 | ♦ ♣ | Wild — place chip on ANY open space |
| One-Eyed Jack | 1 | ♠ ♥ | Remove ANY opponent chip (not in completed sequence) |

### Deck Mechanics
- After placing a chip, draw 1 card from the deck
- If the draw pile is empty, shuffle the discard pile to form a new draw pile

---

## 7. Sequence Detection

### Detection Logic
Sequence detection is **client-side only**, run by the active player's client after placing a chip.

Checks all 4 directions from the newly placed chip:
- Horizontal (←→)
- Vertical (↑↓)
- Diagonal down-right (↖↘)
- Diagonal down-left (↗↙)

Rules:
- Sequence = exactly 5 contiguous tiles in a straight line, no gaps
- All 5 tiles must belong to the same team ID
- Board is a fixed 10×10 grid — no edge wrapping
- Corner free spaces count as wild (match any team)

### Result of Detection
1. If a sequence is found → add it to `sequences[]` in the Firebase `.update()` call alongside the chip placement
2. Update `teamScores` in the same `.update()` call
3. Check if win condition is met (compare `teamScores[team]` against `winSequences`)
4. If win → set `winner` in the same `.update()` call
5. All other clients re-render from the Firebase snapshot — no ordering enforcement needed

### Logic Rule
Chips belong to **teams**. Sequence detection is triggered by the player who placed the chip, and the result is written to Firebase. Other clients render whatever Firebase reflects.

---

## 8. Room System (No Backend Server)

### Approach: Firebase Realtime Database (Free Tier)
Firebase RTDB is chosen because:
- **Completely free** for low-traffic use (Spark plan: 1GB data, 10GB/month transfer)
- No server to run or maintain
- Real-time WebSocket updates (~100–200ms latency)
- CDN-loaded SDK — no npm, no build steps
- Anyone opening `index.html` uses the shared database via an embedded config

### Room Creation
1. User submits name + avatar color → JS generates a **6-character alphanumeric room code** (e.g., `K7PQ3X`)
2. Room object written to Firebase at `/rooms/K7PQ3X`
3. User lands on the Lobby screen with code, copy-link button, and QR code

### Join Methods
| Method | How |
|--------|-----|
| Room code | Manually typed on landing page |
| Share link | URL hash: `index.html#K7PQ3X` — auto-fills join modal |
| QR code | Encodes the full share URL — scanned on mobile |

### State Sync
- Firebase is the source of truth. All game state lives at `/rooms/{code}`
- Every client subscribes with `onValue()` and re-renders on any update
- Only the active player writes their move each turn
- Local state is allowed for UI rendering and temporary interaction (e.g. optimistic chip display)
- Any mismatch between local state and Firebase resolves by re-rendering from the Firebase snapshot

### Room Lifecycle
```
Created → Lobby (waiting) → In Game → Game Over → (optional Rematch)
```
- Rooms expire after 2 hours of inactivity (`lastActivity` timestamp)
- If host leaves, next player in join order becomes host

### QR Code Generation (Frontend Only)
- **QRCode.js** (CDN, free, no API calls)
- Generates a QR `<canvas>` pointing to the shareable URL, entirely in-browser

---

## 9. UI / UX Design System

### Visual Style
**Theme: "Luxury pool table + casino board game night"**

Must feel:
- Warm green felt surface
- Rich walnut/mahogany wood framing
- Soft overhead lighting atmosphere
- Physical, tactile interactions

Must NOT feel:
- Dark/cyberpunk/neon
- Flat or clinical
- Generic web app

---

### Color Palette

#### Felt Table Surface
| Role | Hex | Use |
|------|-----|-----|
| Felt base | `#2d5a3d` | Page background, board area |
| Felt highlight | `#3a7a52` | Board cell default background |
| Felt shadow | `#1e3d2a` | Inset shadows, depth |
| Felt worn | `#2a5238` | Alternate cell tint |

#### Wood / Frame Tones
| Role | Hex | Use |
|------|-----|-----|
| Dark walnut | `#5c3d1e` | Board border, framing |
| Medium oak | `#8b5e3c` | Button borders, card backs |
| Wood highlight | `#c4956a` | Light wood grain accents |

#### Warm Ambient Lighting
| Role | Hex | Use |
|------|-----|-----|
| Warm white | `#f5efe0` | Text on dark backgrounds |
| Cream | `#f0e8d0` | Card faces, modal backgrounds |
| Gold | `#c9a84c` | Logo, sequence highlights, glow |
| Amber | `#d4813a` | Turn indicators, active states |

#### UI Feedback States
| State | Treatment |
|-------|-----------|
| Valid move target | Soft gold glow `#f0c040` at 60% opacity |
| Invalid / error | Muted red `#922b21` |
| Sequence formed | Bright gold `#ffd700` pulse |
| Disabled | Current color at 40% opacity |

---

### Typography
| Use | Font | Weight |
|-----|------|--------|
| Logo / headings | Playfair Display (serif) | 400, 700 |
| Body / UI labels | Inter (sans-serif) | 300, 400, 600 |
| Card values | Playfair Display | 400 |
| Room codes | Courier New (monospace) | 400 |

All fonts loaded from Google Fonts CDN (free).

---

### Button Styles
| Name | Style | Use |
|------|-------|-----|
| `btn-primary` | Cream bg, wood border, gold hover glow, 3D press | Create Game, Start Game |
| `btn-secondary` | Transparent bg, wood border, lighter weight | Join Game, Copy Link |
| `btn-danger` | Muted red, understated placement | Leave Game |
| `btn-icon` | Circular icon button | QR toggle, Copy |

All buttons: `border-radius: 8px`, warm amber box-shadow, 150ms transitions.

---

### UI Principle
> "Everything must feel physical — lift, drop, bounce, glow."

---

## 10. Pages Structure (SPA)

Single `index.html` with view sections, one visible at a time:

```
index.html
├── #view-landing     (default visible)
├── #view-lobby
├── #view-game
├── #modal-create
├── #modal-join
├── #modal-qr
└── #modal-gameover
```

### Landing Page (`#view-landing`)
- Full-viewport felt table background
- Centered gold serif "SEQUENCE" logo
- Animated card fan in background
- Two action buttons: **Create Game** | **Join Game**
- Tagline: "The classic strategy game, now online."

### Lobby Page (`#view-lobby`)
- Top bar: room code + copy link button + QR toggle
- Player list grouped by team with color-coded left border
- Each row: avatar chip | name | team badge | host crown
- Team count selector (host only): scales with player count or manual override
- Turn timer toggle (host only)
- **Start Game** button (host only, disabled until ≥2 players)
- Live-updating via Firebase listener

### Game Board Page (`#view-game`)
```
┌──────────────────────────────────────────────────┐
│  TOP BAR: Turn indicator | Scores | Timer        │
├────────────────────────────┬─────────────────────┤
│                            │  SIDEBAR            │
│   10×10 SEQUENCE BOARD     │  Team scores        │
│   (main content area)      │  Player list        │
│                            │  Deck count         │
│                            │  Discard pile top   │
├────────────────────────────┴─────────────────────┤
│  HAND: Your 4–7 cards (horizontal row)           │
└──────────────────────────────────────────────────┘
```

### Modals
| Modal | Contents |
|-------|----------|
| `#modal-create` | Name input, avatar color picker, Create Room button |
| `#modal-join` | Name input, avatar color picker, room code input (auto-filled from URL hash) |
| `#modal-qr` | Large QR canvas, shareable URL, copy button |
| `#modal-gameover` | Winning team banner, sequence replay highlight, Play Again / Back to Lobby |

---

## 11. Technical Architecture

### File Structure
```
Sequence/
├── index.html      # Full SPA — all views, modals, structure
├── style.css       # All styling — layout, components, animations
├── script.js       # All logic — game engine, Firebase sync, UI
└── PLAN.md         # This document
```

### External CDN Dependencies (all free, no accounts needed to play)
```html
<!-- Google Fonts -->
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Inter:wght@300;400;600&display=swap">

<!-- Firebase Realtime Database -->
<script src="https://www.gstatic.com/firebasejs/10.x.x/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.x.x/firebase-database-compat.js"></script>

<!-- QRCode.js (frontend QR generation, no API) -->
<script src="https://cdn.jsdelivr.net/npm/qrcodejs/qrcode.min.js"></script>
```

### State Management
**Single source of truth in Firebase RTDB.** Local UI is a pure render of the Firebase snapshot.

```
Firebase /rooms/{code}  →  onValue() listener  →  renderGame(state)  →  DOM
```

- `sessionStorage` holds only: `myPlayerId`, `myRoomCode`, `myName`
- No local state mutation without a matching Firebase write
- All renders are deterministic: same state = same DOM

### Multiplayer Sync Flow
1. Active player plays a card and places a chip
2. Client runs sequence detection locally
3. Client calls `firebase.update()` with only the changed fields: `boardState`, `hand`, `deck`, `discardPile`, `sequences`, `teamScores`, `currentPlayerIndex`, and `winner` if applicable
4. Firebase broadcasts the update to all connected clients
5. Every client's `onValue()` fires → `renderGame(snapshot)` called
6. Turn lock: action controls are disabled when `state.turnOrder[state.currentPlayerIndex] !== myPlayerId`

### Firebase Data Structure

#### Room Object (`/rooms/{code}`)
```json
{
  "code": "K7PQ3X",
  "hostId": "uuid-abc",
  "status": "lobby | playing | finished",
  "mode": "standard | party",
  "teamCount": 2,
  "winSequences": 3,
  "timerEnabled": false,
  "timerSeconds": 30,
  "createdAt": 1716000000000,
  "lastActivity": 1716000000000,
  "players": {
    "uuid-abc": {
      "id": "uuid-abc",
      "name": "Neel",
      "avatarColor": "#c0392b",
      "team": 1,
      "joinOrder": 0,
      "hand": ["2H", "KS", "JD", "7C", "AS"],
      "connected": true
    }
  },
  "turnOrder": ["uuid-abc", "uuid-xyz"],
  "currentPlayerIndex": 0,
  "deck": ["3H", "8C"],
  "discardPile": ["6D"],
  "boardState": {
    "0_0": null,
    "1_3": { "team": 1, "isSequencePart": false },
    "3_4": { "team": 2, "isSequencePart": true }
  },
  "sequences": [
    { "team": 1, "cells": ["1_0","2_1","3_2","4_3","5_4"] }
  ],
  "teamScores": { "1": 1, "2": 0 },
  "winner": null
}
```

#### Card Representation
Format: `"{rank}{suit}"` — e.g., `"2H"`, `"KS"`, `"JD"`, `"10C"`
- Ranks: `2 3 4 5 6 7 8 9 10 Q K A J`
- Suits: `H` `D` `C` `S`

#### Board Layout
The full 10×10 board must be **completely defined in code** — no placeholders, no `// ...` comments. All 10 rows with all 10 columns explicitly listed per the official Sequence board layout. `null` = corner free space.

```js
const BOARD_LAYOUT = [
  [null, "2S", "3S", "4S", "5S", "6S", "7S", "8S", "9S", null],
  ["6C", "5C", "4C", "3C", "2C", "AH", "KH", "QH", "10H", "10S"],
  ["7C", "AS", "2D", "3D", "4D", "5D", "6D", "7D", "8D", "QS"],
  ["8C", "KS", "6C", "5H", "4H", "3H", "2H", "AD", "9D", "KS"],
  ["9C", "QS", "7C", "6H", "5H", "4H", "3H", "KC", "10D", "AS"],
  ["10C", "10S", "8C", "7H", "6H", "5H", "QH", "AC", "QD", "2S"],
  ["QC", "9S", "9C", "8H", "9H", "10H", "KH", "KD", "JD", "3S"],
  ["KC", "8S", "10C", "QC", "KC", "AC", "AD", "QD", "2D", "4S"],
  ["AC", "7S", "6S", "5S", "4S", "3S", "2S", "2H", "3H", "5S"],
  [null, "2C", "3C", "4C", "5C", "6C", "7C", "8C", "9C", null]
];
```

Note: the above is a representative layout for planning purposes. The actual implementation must use the verified official Sequence board layout.

---

## 12. UI Components List

| Component | Description |
|-----------|-------------|
| `BoardCell` | 10×10 grid cell with card label, chip overlay, state classes |
| `CardInHand` | Playable card in local player's hand |
| `PlayerAvatar` | Team-colored circle with initials, crown for host, pulse on active turn |
| `TurnBanner` | Top indicator: "Your Turn!" or "{Name}'s Turn" |
| `TeamScoreCard` | Sidebar score display per team with sequence pip indicators |
| `SequenceHighlight` | Glowing overlay traced over a completed sequence's 5 cells |
| `QRModal` | QR canvas + share URL + copy button |
| `Toast` | 2.5s auto-dismiss notification pill (bottom-right) |
| `TimerRing` | Circular countdown ring around active player's avatar |

---

## 13. Animation System

### Performance Rule
- Animations use CSS `transform` and `opacity` only — no layout-triggering properties
- Firebase writes happen immediately; animations play in parallel and never block gameplay
- UI inputs remain responsive during any animation

### Card Draw
- New card slides from deck to hand position along a bezier curve
- Duration: 350ms | Easing: `cubic-bezier(0.34, 1.56, 0.64, 1)`
- Cards in initial deal stagger 150ms apart

### Chip Placement
- Chip drops from 150% scale to 100% with a bounce settle
- Duration: 250ms | Easing: `cubic-bezier(0.36, 0.07, 0.19, 0.97)`
- Cell briefly flashes gold to confirm placement

### Card Play
- Selected card slides from hand toward the discard pile with a slight rotation
- Duration: 300ms — feels like tossing a card onto the table

### One-Eyed Jack Remove
- Target chip shakes (rapid left-right, 200ms) then pops out (scale 1→0, 200ms)

### Sequence Formation
- 500ms pause after triggering chip placement
- Each of the 5 chips pulses in staggered order (80ms apart)
- Glowing gold line traces over the sequence
- Toast notification fires
- If win condition met → Game Over modal opens

### Turn Transition
- Previous player's avatar dims and shrinks
- New player's avatar brightens with a radial pulse ring
- "Your Turn!" banner drops in from top for local player
- Duration: 400ms total

### Game Start Cinematic
- Board scales from 90%→100% with fade in (500ms)
- Cards deal one-by-one into hand from center deck position (150ms stagger)
- First turn banner appears after dealing completes

### Win Celebration
- CSS-only confetti particles (`@keyframes` falling divs, no library)
- Winning team chips pulse gold in unison
- Game Over modal slides in: team name in large gold Playfair Display
- Losing teams listed below in smaller muted text

### Hover Interactions
| Element | Hover Effect | Duration |
|---------|-------------|----------|
| Board cell | Gold border appears | 100ms |
| Hand card | Floats up 10px, deeper shadow | 150ms |
| Button | Glow intensifies, slight scale | 100ms |
| Valid target cell | Pulsing gold shimmer | continuous while card selected |

---

## 14. Responsive + Mobile Rules

**"The game must feel like a physical board laid on a phone screen — everything scales, nothing breaks, nothing overflows."**

Phones are the **primary use case** (gatherings, parties). Tablets and desktop are secondary.

### Board Scaling
| Device | Scale |
|--------|-------|
| Desktop (≥1024px) | 1.0× — full size |
| Tablet (768–1023px) | ~0.85× |
| Phone (≤767px) | 0.7×–0.8× |

- Board scales via CSS `transform: scale()` or `clamp()`-based cell sizes
- Board must **always fit the viewport** without triggering horizontal page scroll
- No fixed-width board that overflows screen ever

### Hand Cards on Mobile
- Hand is always a **horizontally scrollable strip** on phones (`overflow-x: auto`, `white-space: nowrap`)
- Cards **never wrap** to a new line
- Card size shrinks slightly on phones via CSS — content stays legible

### Layout Stacking (screen width < 768px)
- Sidebar moves **below the board** (stacks vertically)
- Player list becomes a compact horizontal strip or collapsible section
- Turn indicator lives in the top bar only — not repeated elsewhere
- Score display becomes compact: team color chip + number only

### Touch Support (mandatory)
- All click handlers must also work with `touchstart` / `touchend`
- Card selection works with both click and touch
- No interaction relies on hover state to function

### Hover Fallback
- All hover effects have a mobile equivalent: tap triggers the same visual feedback
- Nothing breaks or stays invisible because hover is unavailable

### Mobile Animation Rules
On phones, automatically reduce animation intensity:
- Shorter durations (aim for ≤200ms)
- Fewer glow/shadow effects
- Sequence animation: simplified single pulse instead of staggered chip-by-chip trail
- No multi-step card arc animations — cards appear in hand directly

### Orientation Support
- Must work in both **portrait** (default) and **landscape** (preferred for gameplay)
- In landscape on phone: board takes full width, hand docks at bottom, sidebar hidden or toggled via a button

### Prohibited Bugs
- No horizontal page scrolling at any screen size
- No overflow caused by a fixed-width element
- No layout that assumes desktop viewport

---

## 15. Build Rules

| Rule | Requirement |
|------|-------------|
| Fully playable | No missing game logic, no placeholders |
| Player count | Must work at 2 and at 16+ without breaking |
| High player count | Degrades gracefully — smaller cards, scrollable hand |
| UI clarity | Gameplay clarity prioritized over visual effects |
| Animations | Must not block gameplay or feel laggy |
| Responsive | Playable on tablet-sized screens minimum |
| Run requirement | Works by opening `index.html` directly or via simple local server |

---

## 16. Summary

| Dimension | Choice |
|-----------|--------|
| Frontend | Vanilla HTML / CSS / JS only |
| Realtime sync | Firebase RTDB (free Spark plan) |
| QR generation | QRCode.js (CDN, free) |
| Fonts | Google Fonts (free) |
| Hosting needed | None — runs from `index.html` |
| Backend servers | None |
| Paid APIs | None |
| Frameworks | None |
| Build tools | None |
| Max players | 16+ |
| Game modes | Standard (2–8) + Party (9–16+) |

---

*End of Plan — awaiting review and approval before any code is written.*
