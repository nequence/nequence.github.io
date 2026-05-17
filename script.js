'use strict';

/* ══════════════════════════════════════════════════════════════════════════
   SEQUENCE  —  Online Multiplayer via Firebase RTDB
   ══════════════════════════════════════════════════════════════════════════ */

/* ── Firebase ────────────────────────────────────────────────────────────── */
firebase.initializeApp({ databaseURL: 'https://nequence-default-rtdb.firebaseio.com' });
const db = firebase.database();

/* ── Session identity ────────────────────────────────────────────────────── */
let myId = sessionStorage.getItem('seq_uid');
if (!myId) { myId = crypto.randomUUID(); sessionStorage.setItem('seq_uid', myId); }
let myName   = '';
let myAvatar = '🦁';
let myCode   = '';
let roomRef  = null;
let roomOff  = null;

/* ── URL hash (invite link) ──────────────────────────────────────────────── */
const urlCode = (location.hash.slice(1) || '').toUpperCase().trim();

/* ── Avatar options ──────────────────────────────────────────────────────── */
const AVATARS = ['🦁','🐯','🐺','🦊','🐻','🐸','🐵','🦄','🐲','🦅','🤠','😎','🧙','👑','🥷','🎭'];

/* ── Board layout (official Sequence — Jacks in center) ──────────────────── */
const BOARD_LAYOUT = [
  [null, '2S','3S','4S','5S','6S','7S','8S','9S', null],
  ['6C', '5C','4C','3C','2C','AH','KH','QH','10H','10S'],
  ['7C', 'AS','2D','3D','4D','5D','6D','7D','8D', 'QS'],
  ['8C', 'KS','6C','5H','4H','3H','2H','AD','9D', 'KS'],
  ['9C', 'QS','7C','6H','JH','JD','3H','KC','10D','AS'],
  ['10C','10S','8C','7H','JC','JS','QH','AC','QD','2S'],
  ['QC', '9S','9C','8H','9H','10H','KH','KD','2D','3S'],
  ['KC', '8S','10C','QC','KC','AC','AD','QD','3D','4S'],
  ['AC', '7S','6S','5S','4S','3S','2S','2H','3H','5S'],
  [null, '2C','3C','4C','5C','6C','7C','8C','9C', null],
];

const SUIT_SYM  = { H:'♥', D:'♦', C:'♣', S:'♠' };
const SUIT_RED  = { H:true, D:true, C:false, S:false };
const DIRS      = [[0,1],[1,0],[1,1],[1,-1]];
const WIN_SEQS  = 2;

const P_COLORS = [
  { color:'#c0392b', chipClass:'p1' },
  { color:'#1a5cb5', chipClass:'p2' },
  { color:'#1e8449', chipClass:'p3' },
  { color:'#c89010', chipClass:'p4' },
  { color:'#7d3c98', chipClass:'p5' },
  { color:'#d4601a', chipClass:'p6' },
  { color:'#c0388a', chipClass:'p7' },
  { color:'#0fa8b8', chipClass:'p8' },
];

/* ── Card helpers ────────────────────────────────────────────────────────── */
const cardRank      = c => c.slice(0, -1);
const cardSuit      = c => c.slice(-1);
const isRed         = c => !!SUIT_RED[cardSuit(c)];
const symOf         = c => SUIT_SYM[cardSuit(c)] || '';
const isJack        = c => cardRank(c) === 'J';
const isTwoEyedJack = c => isJack(c) && isRed(c);
const isOneEyedJack = c => isJack(c) && !isRed(c);

function handSize(n) {
  if (n <= 2) return 7;
  if (n <= 6) return 6;
  return 5;
}

function genCode() {
  const ch = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 6 }, () => ch[Math.floor(Math.random() * ch.length)]).join('');
}

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

const pack   = arr => (arr || []).join(',');
const unpack = str => str ? str.split(',').filter(Boolean) : [];

/* ── Local game state ────────────────────────────────────────────────────── */
const G = {
  players:      [],
  deck:         [],
  hands:        {},
  boardState:   {},
  seqCells:     new Set(),
  seqLines:     [],
  scores:       {},
  currentIdx:   0,
  winner:       null,
  selectedCard: null,
  selIdx:       null,
  animating:    false,
  panelsBuilt:  false,
  get cur()     { return this.players[this.currentIdx]; },
};

/* ══════════════════════════════════════════════════════════════════════════
   AVATAR PICKER INIT
   ══════════════════════════════════════════════════════════════════════════ */

function buildAvatarPicker() {
  const picker = document.getElementById('avatar-picker');
  AVATARS.forEach((emoji, i) => {
    const btn = document.createElement('button');
    btn.className = 'avatar-opt' + (i === 0 ? ' selected' : '');
    btn.textContent = emoji;
    btn.setAttribute('type', 'button');
    btn.addEventListener('click', () => {
      myAvatar = emoji;
      document.querySelectorAll('.avatar-opt').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
    });
    picker.appendChild(btn);
  });
}

/* ══════════════════════════════════════════════════════════════════════════
   LANDING MODE SETUP
   ══════════════════════════════════════════════════════════════════════════ */

function setupLanding() {
  if (!urlCode) return;
  // Invite mode: hide normal create/join, show invite UI
  document.getElementById('normal-landing').classList.add('hidden');
  document.getElementById('invite-header').classList.remove('hidden');
  document.getElementById('invite-code-badge').textContent = urlCode;
  document.getElementById('invite-join-btn').classList.remove('hidden');
  document.getElementById('name-input').focus();
}

/* ══════════════════════════════════════════════════════════════════════════
   ROOM OPERATIONS
   ══════════════════════════════════════════════════════════════════════════ */

async function createRoom() {
  myName = document.getElementById('name-input').value.trim();
  if (!myName) return showError('Enter your name first');

  const code = genCode();
  myCode  = code;
  roomRef = db.ref('rooms/' + code);

  await roomRef.set({
    hostId:    myId,
    status:    'lobby',
    createdAt: Date.now(),
    players:   { [myId]: { name: myName, avatar: myAvatar, joinOrder: 0 } },
  });

  location.hash = code;
  subscribeRoom();
  showView('lobby-screen');
  document.getElementById('room-code-display').textContent = code;
}

async function joinRoom(code) {
  myName = document.getElementById('name-input').value.trim();
  if (!myName) {
    document.getElementById('name-input').focus();
    return showError('Enter your name first');
  }
  code = code.toUpperCase().trim();
  if (code.length !== 6) return showError('Enter a valid 6-character room code');

  const snap = await db.ref('rooms/' + code).get();
  if (!snap.exists()) return showError('Room not found — check the code');
  const room = snap.val();
  if (room.status !== 'lobby') return showError('Game already started in that room');
  const count = Object.keys(room.players || {}).length;
  if (count >= 8) return showError('Room is full (max 8 players)');

  myCode  = code;
  roomRef = db.ref('rooms/' + code);

  await roomRef.child('players').child(myId).set({
    name: myName, avatar: myAvatar, joinOrder: count,
  });

  location.hash = code;
  subscribeRoom();
  showView('lobby-screen');
  document.getElementById('room-code-display').textContent = code;
}

function subscribeRoom() {
  if (roomOff) roomOff();
  const ref = roomRef;
  const handler = snap => {
    const room = snap.val();
    if (!room) return;
    if (room.status === 'lobby')    return renderLobby(room);
    if (room.status === 'playing')  return applyRoomState(room);
    if (room.status === 'finished') return applyRoomState(room);
  };
  ref.on('value', handler);
  roomOff = () => ref.off('value', handler);
}

async function startGame() {
  const snap = await roomRef.get();
  const room = snap.val();

  // Only host can start
  if (room.hostId !== myId) return;
  if ((room.players ? Object.keys(room.players).length : 0) < 2)
    return showError('Need at least 2 players');

  const entries = Object.entries(room.players || {})
    .sort(([, a], [, b]) => a.joinOrder - b.joinOrder);

  const n    = entries.length;
  const hs   = handSize(n);
  const deck = shuffle(buildDeck());
  const hands = {}, scores = {};

  entries.forEach(([id]) => {
    hands[id]  = pack(deck.splice(0, hs));
    scores[id] = 0;
  });

  await roomRef.update({
    status:             'playing',
    turnOrder:          entries.map(([id]) => id).join(','),
    currentPlayerIndex: 0,
    deck:               pack(deck),
    hands,
    boardState:         {},
    seqCells:           '',
    seqLines:           '[]',
    scores,
    winner:             null,
  });
}

/* ══════════════════════════════════════════════════════════════════════════
   STATE SYNC  (Firebase → local G → render)
   ══════════════════════════════════════════════════════════════════════════ */

function applyRoomState(room) {
  if (G.animating) return;

  const turnOrder = unpack(room.turnOrder);
  G.players    = turnOrder.map((id, i) => ({
    id,
    name:      (room.players[id] || {}).name   || id,
    avatar:    (room.players[id] || {}).avatar  || '🃏',
    color:     P_COLORS[i].color,
    chipClass: P_COLORS[i].chipClass,
  }));
  G.deck       = unpack(room.deck);
  G.hands      = {};
  turnOrder.forEach(id => { G.hands[id] = unpack((room.hands || {})[id]); });
  G.boardState = room.boardState || {};
  G.seqCells   = new Set(unpack(room.seqCells));
  G.seqLines   = JSON.parse(room.seqLines || '[]');
  G.scores     = room.scores || {};
  G.currentIdx = room.currentPlayerIndex || 0;
  G.winner     = room.winner || null;

  showView('game-screen');

  const needBuild = !G.panelsBuilt || document.querySelectorAll('.player-block').length !== G.players.length;
  if (needBuild) {
    Renderer.buildPanels();
    Renderer.buildScoreStrip();
    G.panelsBuilt = true;
  }

  Renderer.renderBoard();
  Renderer.renderHands();
  Renderer.updateScore();

  requestAnimationFrame(() => {
    document.getElementById('seq-lines').innerHTML = '';
    G.seqLines.forEach(({ key, pid }) => {
      const cells  = key.split('|').map(s => s.split(',').map(Number));
      const player = G.players.find(p => p.id === pid);
      if (player) Renderer.drawSequenceLineInstant(cells, player);
    });
  });

  if (room.status === 'finished' && G.winner) {
    const w = G.players.find(p => p.id === G.winner);
    if (w) showWin(w);
  }
}

/* ══════════════════════════════════════════════════════════════════════════
   LOBBY RENDERER  (circle table)
   ══════════════════════════════════════════════════════════════════════════ */

function renderLobby(room) {
  if (!document.getElementById('game-screen').classList.contains('hidden')) return;

  showView('lobby-screen');
  document.getElementById('room-code-display').textContent = myCode;

  const isHost = room.hostId === myId;
  document.getElementById('start-game-btn').classList.toggle('hidden', !isHost);
  document.getElementById('lobby-waiting-msg').classList.toggle('hidden', isHost);

  const players = Object.entries(room.players || {})
    .sort(([, a], [, b]) => a.joinOrder - b.joinOrder);

  const table = document.getElementById('lobby-table');
  // Remove old seats (keep the label)
  table.querySelectorAll('.lobby-seat').forEach(s => s.remove());

  const n  = players.length;
  // Table is 280×180px; seats orbit inside the oval
  const cx = 140, cy = 90, rx = 108, ry = 72;

  players.forEach(([id, p], i) => {
    const angle = (2 * Math.PI * i / n) - Math.PI / 2;
    const x     = cx + rx * Math.cos(angle);
    const y     = cy + ry * Math.sin(angle);
    const color = P_COLORS[i].color;

    const seat  = document.createElement('div');
    seat.className = 'lobby-seat' + (id === myId ? ' lobby-seat-me' : '');
    seat.style.left      = x + 'px';
    seat.style.top       = y + 'px';
    seat.style.borderColor = color;

    const av  = document.createElement('div');
    av.className = 'lobby-seat-avatar';
    av.textContent = p.avatar || '🃏';

    const nm  = document.createElement('div');
    nm.className = 'lobby-seat-name';
    nm.style.color = color;
    nm.textContent = p.name
      + (id === myId      ? ' (you)' : '')
      + (id === room.hostId ? ' 👑'  : '');

    seat.appendChild(av);
    seat.appendChild(nm);
    table.appendChild(seat);
  });
}

/* ══════════════════════════════════════════════════════════════════════════
   DECK
   ══════════════════════════════════════════════════════════════════════════ */

function buildDeck() {
  const RANKS = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
  const SUITS = ['H','D','C','S'];
  const d = [];
  for (let i = 0; i < 2; i++)
    for (const s of SUITS)
      for (const r of RANKS) d.push(r + s);
  return d;
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/* ══════════════════════════════════════════════════════════════════════════
   BOARD MANAGER
   ══════════════════════════════════════════════════════════════════════════ */

const BM = {
  key:        (r, c) => `${r}_${c}`,
  isCorner:   (r, c) => BOARD_LAYOUT[r][c] === null,
  owner:      (r, c) => G.boardState[`${r}_${c}`] || null,
  isOccupied: (r, c) => !!G.boardState[`${r}_${c}`],
  isSeqCell:  (r, c) => G.seqCells.has(`${r},${c}`),
};

/* ══════════════════════════════════════════════════════════════════════════
   RULE ENGINE
   ══════════════════════════════════════════════════════════════════════════ */

const RE = {
  cellBelongsTo(r, c, pid) {
    if (BM.isCorner(r, c)) return true;
    return BM.owner(r, c) === pid;
  },

  lineKey(line) {
    return line.map(([r, c]) => `${r},${c}`).sort().join('|');
  },

  lineAlreadyCounted(line) {
    const key = this.lineKey(line);
    return G.seqLines.some(sl => sl.key === key);
  },

  findNewSequences(r, c, pid) {
    const found = [], seenKeys = new Set();
    for (const [dr, dc] of DIRS) {
      for (let offset = 0; offset < 5; offset++) {
        const sr = r - dr * offset, sc = c - dc * offset;
        const line = [];
        let valid = true;
        for (let k = 0; k < 5; k++) {
          const nr = sr + dr * k, nc = sc + dc * k;
          if (nr < 0 || nr >= 10 || nc < 0 || nc >= 10) { valid = false; break; }
          if (!this.cellBelongsTo(nr, nc, pid))          { valid = false; break; }
          line.push([nr, nc]);
        }
        if (!valid || line.length !== 5) continue;
        const key = this.lineKey(line);
        if (seenKeys.has(key)) continue;
        seenKeys.add(key);
        if (this.lineAlreadyCounted(line)) continue;
        const hasNew = line.some(([lr, lc]) => !BM.isSeqCell(lr, lc));
        if (!hasNew) continue;
        found.push(line);
      }
    }
    return found;
  },

  canRemove(r, c) {
    if (BM.isCorner(r, c)) return false;
    const owner = BM.owner(r, c);
    if (!owner || owner === G.cur.id) return false;
    if (BM.isSeqCell(r, c)) return false;
    return true;
  },
};

/* ══════════════════════════════════════════════════════════════════════════
   RENDERER
   ══════════════════════════════════════════════════════════════════════════ */

const Renderer = {
  renderBoard() {
    const board = document.getElementById('board');
    board.innerHTML = '';
    for (let r = 0; r < 10; r++) {
      for (let c = 0; c < 10; c++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        const code = BOARD_LAYOUT[r][c];

        if (code === null) {
          cell.classList.add('corner');
          cell.innerHTML = '<span class="free-star">★</span><span class="free-label">FREE</span>';
        } else {
          const red = isRed(code);
          const rc  = red ? ' red' : '';
          const rk  = cardRank(code);
          const sym = symOf(code);
          const isJ = isJack(code);
          if (isJ) cell.classList.add('jack-cell');
          cell.innerHTML =
            `<span class="cell-tl${rc}">${rk}<span class="cell-ts">${sym}</span></span>` +
            `<span class="cell-mid${rc}">${sym}</span>` +
            `<span class="cell-br${rc}">${rk}<span class="cell-ts">${sym}</span></span>`;
        }

        const owner = BM.owner(r, c);
        if (owner) {
          const p    = G.players.find(x => x.id === owner);
          const chip = document.createElement('div');
          chip.className = 'chip ' + (p ? p.chipClass : 'p1');
          cell.appendChild(chip);
        }
        if (BM.isSeqCell(r, c)) cell.classList.add('seq-cell');
        cell.addEventListener('click', () => GF.handleCellClick(r, c));
        board.appendChild(cell);
      }
    }
  },

  buildPanels() {
    const left  = document.getElementById('left-panel');
    const right = document.getElementById('right-panel');
    left.innerHTML = ''; right.innerHTML = '';
    G.players.forEach((p, i) => {
      const block  = document.createElement('div');
      block.className = 'player-block';
      block.id     = 'block-' + p.id;

      const tag    = document.createElement('div');
      tag.className = 'player-name-tag';
      tag.style.borderColor = p.color;
      tag.style.color       = p.color;

      const av = document.createElement('span');
      av.className = 'panel-avatar';
      av.textContent = p.avatar || '🃏';

      const nm = document.createElement('span');
      nm.textContent = p.name + (p.id === myId ? ' (you)' : '');

      tag.appendChild(av); tag.appendChild(nm);

      const col    = document.createElement('div');
      col.className = 'player-hand-col'; col.id = 'hand-col-' + p.id;
      block.appendChild(tag); block.appendChild(col);
      (i < Math.ceil(G.players.length / 2) ? left : right).appendChild(block);
    });
  },

  renderHands() {
    const cur = G.cur;
    G.players.forEach(p => {
      const block = document.getElementById('block-' + p.id);
      if (block) block.classList.toggle('active-pb', p.id === cur.id);
      const col   = document.getElementById('hand-col-' + p.id);
      if (col) this._fillHandEl(col, p);
    });

    const me = G.players.find(p => p.id === myId);
    if (me) {
      const label = document.getElementById('active-hand-label');
      const hand  = document.getElementById('active-hand');
      label.textContent = me.name + "'s Hand";
      label.style.color = me.color;
      this._fillHandEl(hand, me);
    }

    const banner = document.getElementById('turn-banner');
    banner.classList.remove('banner-pop');
    void banner.offsetWidth;
    banner.className    = 'banner-pop';
    banner.textContent  = cur.id === myId ? 'Your Turn!' : cur.name + "'s Turn";
    banner.style.borderColor = cur.color;
    banner.style.color       = cur.color;
    document.getElementById('deck-count').textContent = G.deck.length;

    // Show/hide deck pile cards based on deck size
    const piles = document.querySelectorAll('.deck-card-b');
    piles.forEach((p, i) => {
      p.style.opacity = G.deck.length > i * 30 ? '1' : '0.15';
    });
  },

  _fillHandEl(el, player) {
    el.innerHTML = '';
    const hand  = G.hands[player.id] || [];
    const isMe  = player.id === myId;
    const isCur = player.id === G.cur.id;

    if (!isMe) {
      hand.forEach(() => {
        const back = document.createElement('div');
        back.className = 'card card-back';
        el.appendChild(back);
      });
      return;
    }

    hand.forEach((code, i) => {
      const cardEl = document.createElement('div');
      cardEl.className = 'card' + (isRed(code) ? ' red-card' : '');
      let badge = '';
      if (isTwoEyedJack(code))      badge = '<span class="jack-badge wild">WILD</span>';
      else if (isOneEyedJack(code)) badge = '<span class="jack-badge remove">RMV</span>';
      const red = isRed(code), rk = cardRank(code), s = symOf(code);
      cardEl.innerHTML =
        `<span class="card-tl${red ? ' red' : ''}">${rk}<br><small>${s}</small></span>` +
        `<span class="card-center${red ? ' red' : ''}">${s}</span>` +
        `<span class="card-br${red ? ' red' : ''}">${rk}<br><small>${s}</small></span>` +
        badge;
      if (!isCur) {
        cardEl.classList.add('disabled');
      } else {
        if (G.selectedCard === code && G.selIdx === i) cardEl.classList.add('selected');
        cardEl.addEventListener('click', () => GF.handleCardSelect(code, i));
      }
      el.appendChild(cardEl);
    });
  },

  buildScoreStrip() {
    const strip = document.getElementById('score-strip');
    strip.innerHTML = '';
    G.players.forEach(p => {
      const block  = document.createElement('div');
      block.className = 'score-block'; block.id = 'score-block-' + p.id;
      const av     = document.createElement('span');
      av.className = 'score-avatar'; av.textContent = p.avatar || '🃏';
      const name   = document.createElement('span');
      name.style.color = p.color; name.style.fontSize = '.75rem';
      name.textContent = p.name;
      const pips   = document.createElement('div');
      pips.className = 'score-pips'; pips.id = 'pips-' + p.id;
      for (let i = 0; i < WIN_SEQS; i++) {
        const pip = document.createElement('span');
        pip.className = 'pip'; pip.style.color = p.color;
        pips.appendChild(pip);
      }
      block.appendChild(av); block.appendChild(name); block.appendChild(pips);
      strip.appendChild(block);
    });
  },

  updateScore() {
    G.players.forEach(p => {
      const pips = document.querySelectorAll(`#pips-${p.id} .pip`);
      pips.forEach((pip, i) => {
        const fill = i < (G.scores[p.id] || 0);
        if (fill && !pip.classList.contains('filled')) {
          pip.classList.add('filled', 'filling');
          pip.style.background = p.color;
          setTimeout(() => pip.classList.remove('filling'), 450);
        } else if (!fill) {
          pip.classList.remove('filled'); pip.style.background = '';
        }
      });
    });
  },

  clearHighlights() {
    document.querySelectorAll('.cell').forEach(c => c.classList.remove('valid', 'valid-remove'));
  },

  highlightValidCells() {
    this.clearHighlights();
    const card = G.selectedCard;
    if (!card) return;
    const cells = document.querySelectorAll('.cell');
    if (isTwoEyedJack(card)) {
      for (let r = 0; r < 10; r++) for (let c = 0; c < 10; c++)
        if (!BM.isCorner(r, c) && !BM.isOccupied(r, c))
          cells[r * 10 + c].classList.add('valid');
      return;
    }
    if (isOneEyedJack(card)) {
      for (let r = 0; r < 10; r++) for (let c = 0; c < 10; c++)
        if (RE.canRemove(r, c)) cells[r * 10 + c].classList.add('valid-remove');
      return;
    }
    for (let r = 0; r < 10; r++) for (let c = 0; c < 10; c++) {
      const code = BOARD_LAYOUT[r][c];
      if (code && code === card && !BM.isOccupied(r, c))
        cells[r * 10 + c].classList.add('valid');
    }
  },

  animateChip(r, c) {
    const cell = document.getElementById('board').children[r * 10 + c];
    const chip = cell && cell.querySelector('.chip');
    if (!chip) return;
    chip.classList.add('dropping');
    chip.addEventListener('animationend', () => chip.classList.remove('dropping'), { once: true });
  },

  drawSequenceLine(line5, player) {
    const svg  = document.getElementById('seq-lines');
    const cont = document.getElementById('board-container');
    const brd  = document.getElementById('board');
    const cR   = cont.getBoundingClientRect();
    const cx   = (r, c) => {
      const e = brd.children[r * 10 + c].getBoundingClientRect();
      return { x: e.left - cR.left + e.width / 2, y: e.top - cR.top + e.height / 2 };
    };
    const a = cx(line5[0][0], line5[0][1]);
    const b = cx(line5[4][0], line5[4][1]);
    const el = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    el.setAttribute('x1', a.x); el.setAttribute('y1', a.y);
    el.setAttribute('x2', b.x); el.setAttribute('y2', b.y);
    el.setAttribute('stroke', player.color);
    el.setAttribute('class', 'seq-svg-line');
    const len = Math.hypot(b.x - a.x, b.y - a.y) + 20;
    el.style.strokeDasharray = len; el.style.strokeDashoffset = len;
    svg.appendChild(el);
    void el.getBoundingClientRect();
    el.style.strokeDashoffset = '0';
    el.style.transition = 'stroke-dashoffset .55s ease';
  },

  drawSequenceLineInstant(cells, player) {
    const svg  = document.getElementById('seq-lines');
    const cont = document.getElementById('board-container');
    const brd  = document.getElementById('board');
    const cR   = cont.getBoundingClientRect();
    const cx   = (r, c) => {
      const e = brd.children[r * 10 + c].getBoundingClientRect();
      return { x: e.left - cR.left + e.width / 2, y: e.top - cR.top + e.height / 2 };
    };
    const a = cx(cells[0][0], cells[0][1]);
    const b = cx(cells[4][0], cells[4][1]);
    const el = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    el.setAttribute('x1', a.x); el.setAttribute('y1', a.y);
    el.setAttribute('x2', b.x); el.setAttribute('y2', b.y);
    el.setAttribute('stroke', player.color);
    el.setAttribute('class', 'seq-svg-line');
    el.style.strokeDasharray  = 'none';
    el.style.strokeDashoffset = '0';
    el.style.animation        = 'none';
    el.style.opacity          = '0.88';
    svg.appendChild(el);
  },
};

/* ══════════════════════════════════════════════════════════════════════════
   GAME FLOW
   ══════════════════════════════════════════════════════════════════════════ */

const GF = {
  handleCardSelect(card, idx) {
    if (G.animating)       return;
    if (G.cur.id !== myId) return;
    G.selectedCard = (G.selectedCard === card && G.selIdx === idx) ? null : card;
    G.selIdx       = (G.selectedCard === null) ? null : idx;
    Renderer.highlightValidCells();
    Renderer.renderHands();
  },

  handleCellClick(r, c) {
    if (G.animating || !G.selectedCard) return;
    if (G.cur.id !== myId) return;

    const card = G.selectedCard;

    if (isOneEyedJack(card)) {
      if (!RE.canRemove(r, c)) return;
      this._commit(r, c, false);
    } else if (isTwoEyedJack(card)) {
      if (BM.isCorner(r, c) || BM.isOccupied(r, c)) return;
      this._commit(r, c, true);
    } else {
      const code = BOARD_LAYOUT[r][c];
      if (!code || BM.isOccupied(r, c) || code !== card) return;
      this._commit(r, c, true);
    }
  },

  async _commit(r, c, placed) {
    G.animating = true;
    document.body.classList.add('locked');

    const player  = G.cur;
    const cardIdx = G.selIdx;

    const newHand = G.hands[player.id].slice();
    newHand.splice(cardIdx, 1);
    const newDeck = G.deck.slice();
    if (newDeck.length) newHand.push(newDeck.pop());
    G.hands[player.id] = newHand;
    G.deck = newDeck;

    if (placed) G.boardState[BM.key(r, c)] = player.id;
    else        delete G.boardState[BM.key(r, c)];

    G.selectedCard = null; G.selIdx = null;

    Renderer.renderBoard();
    Renderer.clearHighlights();
    if (placed) Renderer.animateChip(r, c);

    const newSeqs = placed ? RE.findNewSequences(r, c, player.id) : [];
    if (newSeqs.length) {
      newSeqs.forEach(line => {
        const key = RE.lineKey(line);
        G.seqLines.push({ key, pid: player.id });
        line.forEach(([lr, lc]) => G.seqCells.add(`${lr},${lc}`));
        G.scores[player.id] = (G.scores[player.id] || 0) + 1;
      });
      Renderer.updateScore();
      await delay(260);
      Renderer.renderBoard();
      newSeqs.forEach(line => Renderer.drawSequenceLine(line, player));
      await delay(600);
    }

    const isWinner = (G.scores[player.id] || 0) >= WIN_SEQS;
    const nextIdx  = isWinner ? G.currentIdx : (G.currentIdx + 1) % G.players.length;

    const update = {};
    update[`hands/${player.id}`]        = pack(newHand);
    update['deck']                      = pack(newDeck);
    update[`boardState/${BM.key(r,c)}`] = placed ? player.id : null;
    update['seqCells']                  = pack([...G.seqCells]);
    update['seqLines']                  = JSON.stringify(G.seqLines);
    update[`scores/${player.id}`]       = G.scores[player.id] || 0;
    update['currentPlayerIndex']        = nextIdx;
    update['status']                    = isWinner ? 'finished' : 'playing';
    if (isWinner) update['winner']      = player.id;

    G.animating = false;
    document.body.classList.remove('locked');

    await roomRef.update(update);

    if (isWinner) showWin(player);
    else Renderer.renderHands();
  },
};

/* ══════════════════════════════════════════════════════════════════════════
   UI HELPERS
   ══════════════════════════════════════════════════════════════════════════ */

function showView(id) {
  ['landing-screen', 'lobby-screen', 'game-screen'].forEach(v => {
    const el = document.getElementById(v);
    if (el) el.classList.toggle('hidden', v !== id);
  });
}

function showError(msg) {
  const el = document.getElementById('landing-error');
  if (!el) return;
  el.textContent = msg;
  setTimeout(() => { el.textContent = ''; }, 3500);
}

function showWin(player) {
  const isMe = player.id === myId;
  document.getElementById('win-text').textContent = isMe ? 'You Win! 🎉' : player.name + ' Wins! 🎉';
  document.getElementById('win-sub').textContent  = WIN_SEQS + ' sequences — well played!';
  document.getElementById('win-overlay').classList.remove('hidden');
}

/* ══════════════════════════════════════════════════════════════════════════
   EVENT HANDLERS
   ══════════════════════════════════════════════════════════════════════════ */

document.getElementById('create-btn').addEventListener('click', createRoom);

document.getElementById('join-btn').addEventListener('click', () => {
  joinRoom(document.getElementById('code-input').value);
});

document.getElementById('invite-join-btn').addEventListener('click', () => {
  joinRoom(urlCode);
});

document.getElementById('code-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') joinRoom(document.getElementById('code-input').value);
});

document.getElementById('name-input').addEventListener('keydown', e => {
  if (e.key !== 'Enter') return;
  if (urlCode) {
    joinRoom(urlCode);
  } else {
    const code = document.getElementById('code-input').value.trim();
    if (code) joinRoom(code); else createRoom();
  }
});

document.getElementById('start-game-btn').addEventListener('click', startGame);

document.getElementById('copy-link-btn').addEventListener('click', () => {
  const url = location.href.split('#')[0] + '#' + myCode;
  navigator.clipboard.writeText(url).then(() => {
    const btn = document.getElementById('copy-link-btn');
    const orig = btn.textContent;
    btn.textContent = '✓ Copied!';
    setTimeout(() => { btn.textContent = orig; }, 2000);
  });
});

document.getElementById('leave-lobby-btn').addEventListener('click', () => {
  if (roomOff) roomOff();
  location.hash = '';
  location.reload();
});

document.getElementById('play-again-btn').addEventListener('click', () => {
  if (roomOff) roomOff();
  location.hash = '';
  location.reload();
});

/* ══════════════════════════════════════════════════════════════════════════
   INIT
   ══════════════════════════════════════════════════════════════════════════ */

buildAvatarPicker();
setupLanding();
showView('landing-screen');
