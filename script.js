'use strict';

/* ══════════════════════════════════════════════════════════════════════════
   SEQUENCE  —  Online Multiplayer via Firebase RTDB
   ══════════════════════════════════════════════════════════════════════════ */

firebase.initializeApp({ databaseURL: 'https://nequence-default-rtdb.firebaseio.com' });
const db = firebase.database();

/* ── Session identity ────────────────────────────────────────────────────── */
let myId = sessionStorage.getItem('seq_uid');
if (!myId) { myId = crypto.randomUUID(); sessionStorage.setItem('seq_uid', myId); }
let myName   = '';
let myAvatar = '0|0|0|0';
let myCode   = '';
let roomRef  = null;
let roomOff  = null;

const urlCode = (location.hash.slice(1) || '').toUpperCase().trim();

/* ── Avatar system ───────────────────────────────────────────────────────── */
const AV_COLORS = [
  ['#1a1a2e','#16213e'],  // Dark navy
  ['#1a0a2e','#2d1b69'],  // Deep purple
  ['#0a1a0a','#1a3a1a'],  // Dark forest
  ['#2e0a0a','#5a1a1a'],  // Dark crimson
  ['#0a1a2e','#1a3a5a'],  // Dark ocean
  ['#2e2a0a','#5a4a1a'],  // Dark gold
  ['#1a1a1a','#2a2a2a'],  // Charcoal
  ['#1a0a1a','#3a1a3a'],  // Dark plum
];
const AV_FACES = ['🦊','🐺','🐸','🐱','🦁','🐧','🐮','🐻'];
const AV_HATS  = ['','👑','🎩','🧢','🪖','🎭'];
const AV_ACCS  = ['','👓','✨','🎀'];

const TEAM_COLORS = ['#c0392b','#1a5cb5','#1e8449','#c89010'];
const TEAM_CLS    = ['team-0','team-1','team-2','team-3'];
const TEAM_LABELS = ['Red','Blue','Green','Gold'];

// Board layout: rows top→bottom, columns left→right
// Verified from physical board (col 1–10 given by user, transposed to rows)
const BOARD_LAYOUT = [
  [null, 'AC', 'KC', 'QC', '10C', '9C',  '8C', '7C', '6C', null],
  ['AD', '7S', '8S', '9S', '10S', 'QC',  'KC', 'AC', '5C', '2C'],
  ['KD', '6S', '10C','9C', '8C',  '7S',  '6C', '2D', '4C', '3C'],
  ['QD', '5S', 'QC', '8H', '7H',  '6H',  '5C', '3D', '3C', '4C'],
  ['10D','4S', 'KC', '9H', '2H',  '5H',  '4C', '4D', '2C', '5C'],
  ['9D', '3S', 'AC', '10H','3H',  '4H',  '3C', '5D', 'AH', '6C'],
  ['8D', '2S', 'AD', 'QH', 'KH',  'AH',  '2C', '6D', 'KH', '7C'],
  ['7D', '2H', 'KD', 'QD', '10D', '9D',  '8D', '7D', 'QH', '8C'],
  ['6D', '3H', '4H', '5H', '6H',  '7H',  '8H', '9H', '10H','9C'],
  [null, '5D', '4D', '3D', '2D',  'AS',  'KS', 'QS', '10S',null],
];

const SUIT_SYM  = { H:'♥', D:'♦', C:'♣', S:'♠' };
const SUIT_RED  = { H:true, D:true, C:false, S:false };
const DIRS      = [[0,1],[1,0],[1,1],[1,-1]];
const WIN_SEQS  = 2;

const PIP_LAYOUTS = {
  '2':  [[50,26,0],[50,74,1]],
  '3':  [[50,22,0],[50,50,0],[50,78,1]],
  '4':  [[32,26,0],[68,26,0],[32,74,1],[68,74,1]],
  '5':  [[32,24,0],[68,24,0],[50,50,0],[32,76,1],[68,76,1]],
  '6':  [[32,24,0],[68,24,0],[32,50,0],[68,50,0],[32,76,1],[68,76,1]],
  '7':  [[32,20,0],[68,20,0],[50,36,0],[32,54,0],[68,54,0],[32,80,1],[68,80,1]],
  '8':  [[32,20,0],[68,20,0],[50,33,0],[32,50,0],[68,50,0],[50,67,1],[32,80,1],[68,80,1]],
  '9':  [[32,20,0],[68,20,0],[32,37,0],[68,37,0],[50,50,0],[32,63,1],[68,63,1],[32,80,1],[68,80,1]],
  '10': [[32,18,0],[68,18,0],[32,33,0],[68,33,0],[50,43,0],[50,57,1],[32,67,1],[68,67,1],[32,82,1],[68,82,1]],
};

/* ── Card helpers ────────────────────────────────────────────────────────── */
const cardRank      = c => c.slice(0, -1);
const cardSuit      = c => c.slice(-1);
const isRed         = c => !!SUIT_RED[cardSuit(c)];
const symOf         = c => SUIT_SYM[cardSuit(c)] || '';
const isJack        = c => cardRank(c) === 'J';
const isTwoEyedJack = c => isJack(c) && isRed(c);
const isOneEyedJack = c => isJack(c) && !isRed(c);

function buildCardFaceHTML(code) {
  const rk  = cardRank(code);
  const sym = symOf(code);
  const red = isRed(code);
  const rc  = red ? ' red' : '';
  const corners =
    `<span class="card-tl${rc}">${rk}<br><small>${sym}</small></span>` +
    `<span class="card-br${rc}">${rk}<br><small>${sym}</small></span>`;
  let badge = '';
  if (isTwoEyedJack(code))      badge = '<span class="jack-badge wild">WILD</span>';
  else if (isOneEyedJack(code)) badge = '<span class="jack-badge remove">RMV</span>';
  if (rk === 'J' || rk === 'Q' || rk === 'K') {
    return corners +
      `<div class="card-face-body${rc}"><span class="face-letter${rc}">${rk}</span><span class="face-sym${rc}">${sym}</span></div>` +
      badge;
  }
  if (rk === 'A') return corners + `<span class="card-ace${rc}">${sym}</span>`;
  const layout = PIP_LAYOUTS[rk];
  if (!layout) return corners + `<span class="card-center${rc}">${sym}</span>`;
  let html = corners + '<div class="card-pip-area">';
  layout.forEach(([x, y, flip]) => {
    html += `<span class="pip-s${rc}${flip ? ' pip-down' : ''}" style="left:${x}%;top:${y}%">${sym}</span>`;
  });
  return html + '</div>';
}

/* ── Team helpers ────────────────────────────────────────────────────────── */
const getTeamIdx   = pid => G.teamAssignments[pid] ?? 0;
const teamColor    = pid => TEAM_COLORS[getTeamIdx(pid)] || TEAM_COLORS[0];
const teamChipCls  = pid => TEAM_CLS[getTeamIdx(pid)] || 'team-0';

/* ── Misc ────────────────────────────────────────────────────────────────── */
function handSize(n) { return n <= 2 ? 7 : n <= 6 ? 6 : 5; }
function genCode() {
  const ch = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 6 }, () => ch[Math.floor(Math.random() * ch.length)]).join('');
}
function delay(ms) { return new Promise(r => setTimeout(r, ms)); }
const pack   = arr => (arr || []).join(',');
const unpack = str => str ? str.split(',').filter(Boolean) : [];

/* ── Local state ─────────────────────────────────────────────────────────── */
const G = {
  players:         [],
  deck:            [],
  hands:           {},
  boardState:      {},
  seqCells:        new Set(),
  seqLines:        [],
  scores:          {},      // team scores: { 0: n, 1: n, ... }
  teamAssignments: {},      // { playerId: teamIdx }
  teamCount:       2,
  currentIdx:      0,
  winner:          null,   // winning team index or null
  selectedCard:    null,
  selIdx:          null,
  animating:       false,
  seatsBuilt:      false,
  get cur() { return this.players[this.currentIdx]; },
};

/* ══════════════════════════════════════════════════════════════════════════
   AVATAR HELPERS
   ══════════════════════════════════════════════════════════════════════════ */

function parseAvatar(str) {
  if (!str || !str.includes('|')) return { c:0, f:0, h:0, a:0 };
  const [c,f,h,a] = str.split('|').map(Number);
  return { c: c||0, f: f||0, h: h||0, a: a||0 };
}

function renderAvatar(str, size = 'md') {
  const { c, f, h, a } = parseAvatar(str);
  const [c1,c2] = AV_COLORS[c] || AV_COLORS[0];
  const face = AV_FACES[f] || AV_FACES[0];
  const hat  = AV_HATS[h]  || '';
  const acc  = AV_ACCS[a]  || '';
  return `<div class="av-frame av-${size}" style="background:radial-gradient(circle at 38% 32%,${c1},${c2})">` +
    (hat ? `<span class="av-hat-el">${hat}</span>` : '') +
    `<span class="av-face-el">${face}</span>` +
    (acc ? `<span class="av-acc-el">${acc}</span>` : '') +
    `</div>`;
}

function buildAvatarPicker() {
  const picker = document.getElementById('avatar-picker');
  picker.innerHTML = '';

  let sel = parseAvatar(myAvatar);

  // Preview
  const previewWrap = document.createElement('div');
  previewWrap.className = 'av-preview-wrap';
  previewWrap.innerHTML = renderAvatar(myAvatar, 'lg');
  picker.appendChild(previewWrap);

  function refresh() {
    myAvatar = `${sel.c}|${sel.f}|${sel.h}|${sel.a}`;
    previewWrap.innerHTML = renderAvatar(myAvatar, 'lg');
    picker.querySelectorAll('.av-opt').forEach(btn => {
      const { cat, idx } = btn.dataset;
      btn.classList.toggle('selected', sel[cat] === Number(idx));
    });
  }

  function makeRow(label, cat, items, renderFn) {
    const wrap = document.createElement('div');
    wrap.className = 'av-cat';
    wrap.innerHTML = `<div class="av-cat-label">${label}</div>`;
    const row = document.createElement('div');
    row.className = 'av-row';
    items.forEach((item, i) => {
      const btn = document.createElement('button');
      btn.className = 'av-opt' + (sel[cat] === i ? ' selected' : '');
      btn.setAttribute('type', 'button');
      btn.dataset.cat = cat;
      btn.dataset.idx = i;
      btn.innerHTML = renderFn(item, i);
      btn.addEventListener('click', () => { sel[cat] = i; refresh(); });
      row.appendChild(btn);
    });
    wrap.appendChild(row);
    picker.appendChild(wrap);
  }

  makeRow('Color', 'c', AV_COLORS, ([c1,c2]) =>
    `<div class="av-color-swatch" style="background:radial-gradient(circle,${c1},${c2})"></div>`);
  makeRow('Face',  'f', AV_FACES, f => f);
  makeRow('Hat',   'h', AV_HATS,  h => h || '∅');
  makeRow('Extra', 'a', AV_ACCS,  a => a || '∅');
}

/* ══════════════════════════════════════════════════════════════════════════
   LANDING
   ══════════════════════════════════════════════════════════════════════════ */

function setupLanding() {
  if (!urlCode) return;
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
    hostId:          myId,
    status:          'lobby',
    createdAt:       Date.now(),
    teamCount:       2,
    teamAssignments: { [myId]: 0 },
    players:         { [myId]: { name: myName, avatar: myAvatar, joinOrder: 0 } },
  });
  location.hash = code;
  subscribeRoom();
  showView('lobby-screen');
  document.getElementById('room-code-display').textContent = code;
}

async function joinRoom(code) {
  myName = document.getElementById('name-input').value.trim();
  if (!myName) { document.getElementById('name-input').focus(); return showError('Enter your name first'); }
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

  // Auto-assign to smallest team
  const assignments = room.teamAssignments || {};
  const tc = room.teamCount || 2;
  const teamCounts = Array.from({ length: tc }, (_, i) =>
    Object.values(assignments).filter(t => t === i).length
  );
  const smallestTeam = teamCounts.indexOf(Math.min(...teamCounts));

  await roomRef.child('players').child(myId).set({ name: myName, avatar: myAvatar, joinOrder: count });
  await roomRef.child('teamAssignments').child(myId).set(smallestTeam);

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
  if (room.hostId !== myId) return;

  const playerIds = Object.keys(room.players || {});
  if (playerIds.length < 2) return showError('Need at least 2 players');

  const tc          = room.teamCount || 2;
  const assignments = room.teamAssignments || {};
  const teamCounts  = Array.from({ length: tc }, (_, i) =>
    playerIds.filter(id => (assignments[id] ?? 0) === i).length
  );
  if (teamCounts.some(c => c === 0)) return showError('Each team needs at least 1 player');

  const entries = Object.entries(room.players || {})
    .sort(([, a], [, b]) => a.joinOrder - b.joinOrder);
  const n   = entries.length;
  const hs  = handSize(n);
  const deck = shuffle(buildDeck());
  const hands = {};
  const teamScores = {};
  entries.forEach(([id]) => { hands[id] = pack(deck.splice(0, hs)); });
  for (let i = 0; i < tc; i++) teamScores[i] = 0;

  await roomRef.update({
    status:             'playing',
    turnOrder:          entries.map(([id]) => id).join(','),
    currentPlayerIndex: 0,
    deck:               pack(deck),
    hands,
    boardState:         {},
    seqCells:           '',
    seqLines:           '[]',
    teamScores,
    winner:             null,
  });
}

/* ══════════════════════════════════════════════════════════════════════════
   TEAM MANAGEMENT
   ══════════════════════════════════════════════════════════════════════════ */

async function setTeamCount(tc) {
  const snap = await roomRef.get();
  const room = snap.val();
  if (room.hostId !== myId) return;
  const playerIds = Object.keys(room.players || {});
  const newAssignments = {};
  playerIds.forEach((id, i) => { newAssignments[id] = i % tc; });
  await roomRef.update({ teamCount: tc, teamAssignments: newAssignments });
}

async function moveToTeam(pid, teamIdx) {
  const snap = await roomRef.get();
  const room = snap.val();
  if (room.hostId !== myId && pid !== myId) return;
  await roomRef.child('teamAssignments').child(pid).set(teamIdx);
}

/* ══════════════════════════════════════════════════════════════════════════
   STATE SYNC
   ══════════════════════════════════════════════════════════════════════════ */

function applyRoomState(room) {
  if (G.animating) return;

  const prevHandSizes = {};
  G.players.forEach(p => { prevHandSizes[p.id] = (G.hands[p.id] || []).length; });

  const turnOrder = unpack(room.turnOrder);
  G.teamAssignments = room.teamAssignments || {};
  G.teamCount       = room.teamCount || 2;

  G.players = turnOrder.map(id => {
    const ti = G.teamAssignments[id] ?? 0;
    return {
      id,
      name:      (room.players[id] || {}).name   || id,
      avatar:    (room.players[id] || {}).avatar  || '🃏',
      teamIdx:   ti,
      color:     TEAM_COLORS[ti] || TEAM_COLORS[0],
      chipClass: TEAM_CLS[ti]    || 'team-0',
    };
  });

  G.deck       = unpack(room.deck);
  G.hands      = {};
  turnOrder.forEach(id => { G.hands[id] = unpack((room.hands || {})[id]); });
  G.boardState = room.boardState || {};
  G.seqCells   = new Set(unpack(room.seqCells));
  G.seqLines   = JSON.parse(room.seqLines || '[]');
  G.scores     = room.teamScores || {};
  G.currentIdx = room.currentPlayerIndex || 0;
  G.winner     = room.winner !== undefined ? room.winner : null;

  showView('game-screen');

  // Update room badge in header
  const badge = document.getElementById('room-badge-header');
  if (badge) badge.textContent = 'ROOM: ' + myCode;

  const needBuild = !G.seatsBuilt ||
    document.querySelectorAll('.pil').length !== G.players.length - 1;
  if (needBuild) {
    Renderer.buildTableLayout();
    Renderer.buildScoreStrip();
    G.seatsBuilt = true;
  }

  Renderer.renderBoard();
  Renderer.renderHands();
  Renderer.updateScore();

  G.players.forEach(p => {
    if (p.id !== myId && (G.hands[p.id] || []).length > (prevHandSizes[p.id] || 0)) {
      animateCardDraw(p.id);
    }
  });

  requestAnimationFrame(() => {
    document.getElementById('seq-lines').innerHTML = '';
    G.seqLines.forEach(({ key, pid }) => {
      const cells  = key.split('|').map(s => s.split(',').map(Number));
      const player = G.players.find(p => p.id === pid);
      if (player) Renderer.drawSequenceLineInstant(cells, player);
    });
  });

  if (room.status === 'finished' && G.winner !== null) showWin(G.winner);
}

/* ══════════════════════════════════════════════════════════════════════════
   LOBBY RENDERER
   ══════════════════════════════════════════════════════════════════════════ */

function renderLobby(room) {
  if (!document.getElementById('game-screen').classList.contains('hidden')) return;
  showView('lobby-screen');
  document.getElementById('room-code-display').textContent = myCode;

  const isHost      = room.hostId === myId;
  const tc          = room.teamCount || 2;
  const assignments = room.teamAssignments || {};
  const players     = Object.entries(room.players || {})
    .sort(([, a], [, b]) => a.joinOrder - b.joinOrder);

  document.getElementById('start-game-btn').classList.toggle('hidden', !isHost);
  document.getElementById('lobby-waiting-msg').classList.toggle('hidden', isHost);
  document.getElementById('team-setup').classList.toggle('hidden', !isHost);
  document.getElementById('team-view').classList.toggle('hidden', isHost);

  // Player count
  const n = players.length;
  const countEl = document.getElementById('lobby-player-count');
  if (countEl) countEl.textContent = `${n} player${n !== 1 ? 's' : ''} joined`;
  const guestCountEl = document.getElementById('lobby-player-count-guest');
  if (guestCountEl) guestCountEl.textContent = `${n} player${n !== 1 ? 's' : ''} in the room`;

  // Team count button states (host)
  if (isHost) {
    document.querySelectorAll('.team-count-opt').forEach(btn => {
      btn.classList.toggle('active', parseInt(btn.dataset.count) === tc);
    });
  }

  // Render player tiles (Kahoot-style grid)
  const grid = document.getElementById('player-grid');
  grid.innerHTML = '';
  players.forEach(([id, p], i) => {
    const ti    = assignments[id] ?? 0;
    const color = TEAM_COLORS[ti] || TEAM_COLORS[0];

    const tile = document.createElement('div');
    tile.className = 'player-tile' + (id === myId ? ' player-tile-me' : '');
    tile.style.animationDelay = (i * 0.06) + 's';
    tile.style.setProperty('--tile-color', color);

    // Kick button (host only, not for self)
    let kickHTML = '';
    if (isHost && id !== myId) {
      kickHTML = `<button class="tile-kick-btn" title="Kick player">✕</button>`;
    }

    // Team reassign dots (host only)
    let dotsHTML = '';
    if (isHost) {
      dotsHTML = '<div class="tile-team-dots">';
      for (let t = 0; t < tc; t++) {
        dotsHTML +=
          `<div class="tile-team-dot${t === ti ? ' active' : ''}"` +
          ` style="background:${TEAM_COLORS[t]}"` +
          ` data-team="${t}" data-pid="${id}"` +
          ` title="Move to Team ${TEAM_LABELS[t]}"></div>`;
      }
      dotsHTML += '</div>';
    }
    tile.innerHTML =
      kickHTML +
      `<div class="tile-avatar-wrap">${renderAvatar(p.avatar, 'sm')}</div>` +
      `<div class="tile-name">${p.name}${id === room.hostId ? ' <span class="tile-host-badge">👑</span>' : ''}</div>` +
      `<div class="tile-team-badge" style="color:${color};border-color:${color}55;background:${color}15">` +
        TEAM_LABELS[ti] +
      `</div>` +
      dotsHTML;

    // Wire kick
    const kb = tile.querySelector('.tile-kick-btn');
    if (kb) kb.addEventListener('click', e => { e.stopPropagation(); kickPlayer(id); });

    // Wire team dots
    tile.querySelectorAll('.tile-team-dot').forEach(dot => {
      dot.addEventListener('click', () => moveToTeam(dot.dataset.pid, parseInt(dot.dataset.team)));
    });

    grid.appendChild(tile);
  });

  // Non-host: team join buttons
  if (!isHost) {
    const joinArea = document.getElementById('team-join-btns');
    joinArea.innerHTML = '';
    for (let t = 0; t < tc; t++) {
      const memberCount = players.filter(([id]) => (assignments[id] ?? 0) === t).length;
      const amOnTeam    = (assignments[myId] ?? 0) === t;
      const btn         = document.createElement('button');
      btn.className = 'team-join-opt' + (amOnTeam ? ' active' : '');
      btn.style.setProperty('--tc', TEAM_COLORS[t]);
      if (amOnTeam) btn.style.borderColor = TEAM_COLORS[t];
      btn.innerHTML =
        `<span class="tjb-dot" style="background:${TEAM_COLORS[t]}"></span>` +
        `<span class="tjb-label">Team ${TEAM_LABELS[t]}</span>` +
        `<span class="tjb-count">${memberCount}p</span>`;
      if (!amOnTeam) btn.addEventListener('click', () => moveToTeam(myId, t));
      joinArea.appendChild(btn);
    }
  }
}

async function kickPlayer(pid) {
  const snap = await roomRef.get();
  if (snap.val()?.hostId !== myId) return;
  const updates = {};
  updates[`players/${pid}`] = null;
  updates[`teamAssignments/${pid}`] = null;
  await roomRef.update(updates);
}

/* ══════════════════════════════════════════════════════════════════════════
   DECK / SHUFFLE
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
   RULE ENGINE  (team-aware)
   ══════════════════════════════════════════════════════════════════════════ */

const RE = {
  cellBelongsTo(r, c, pid) {
    if (BM.isCorner(r, c)) return true;
    const owner = BM.owner(r, c);
    if (!owner) return false;
    return (G.teamAssignments[pid] ?? 0) === (G.teamAssignments[owner] ?? 0);
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
    if (!owner) return false;
    if ((G.teamAssignments[G.cur.id] ?? 0) === (G.teamAssignments[owner] ?? 0)) return false;
    if (BM.isSeqCell(r, c)) return false;
    return true;
  },
};

/* ══════════════════════════════════════════════════════════════════════════
   RENDERER
   ══════════════════════════════════════════════════════════════════════════ */

const Renderer = {
  buildTableLayout() {
    ['top-info-zone','left-info-zone','right-info-zone',
     'table-top-edge','table-left-edge','table-right-edge',
     'table-bottom-edge','my-info-bar'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.innerHTML = '';
    });

    const myIdx     = G.players.findIndex(p => p.id === myId);
    const pivot     = myIdx < 0 ? 0 : myIdx;
    const ordered   = [...G.players.slice(pivot), ...G.players.slice(0, pivot)];
    const me        = ordered[0];
    const opponents = ordered.slice(1);

    const zones = this._assignOpponentZones(opponents.length);
    zones.forEach((zone, i) => {
      const p          = opponents[i];
      const infoZoneId = zone + '-info-zone';
      const edgeId     = 'table-' + zone + '-edge';
      const isVert     = zone === 'left' || zone === 'right';
      const infoZoneEl = document.getElementById(infoZoneId);
      const edgeEl     = document.getElementById(edgeId);
      if (infoZoneEl) infoZoneEl.appendChild(this._makePil(p));
      if (edgeEl)     edgeEl.appendChild(this._makeEdgeSlot(p, isVert));
    });

    const myBar = document.getElementById('my-info-bar');
    if (myBar && me) {
      myBar.innerHTML =
        `<div class="my-bar-avatar">${renderAvatar(me.avatar, 'md')}</div>` +
        `<div>` +
          `<div class="my-bar-name" style="color:${me.color}">${me.name} ✦</div>` +
          `<div class="my-bar-team" style="color:${me.color}">Team ${TEAM_LABELS[me.teamIdx ?? 0]}</div>` +
        `</div>`;
    }
  },

  _assignOpponentZones(n) {
    const map = {
      0: [],
      1: ['top'],
      2: ['left','right'],
      3: ['left','top','right'],
      4: ['left','top','top','right'],
      5: ['left','top','top','right','right'],
      6: ['left','left','top','top','right','right'],
      7: ['left','left','top','top','top','right','right'],
    };
    return map[Math.min(n, 7)] || map[7];
  },

  _makePil(player) {
    const el = document.createElement('div');
    el.className = 'pil';
    el.id = 'pil-' + player.id;
    el.innerHTML =
      `<div class="pil-avatar">${renderAvatar(player.avatar, 'sm')}</div>` +
      `<div class="pil-name">${player.name}</div>` +
      `<div class="pil-team" style="color:${player.color}">Team ${TEAM_LABELS[player.teamIdx ?? 0]}</div>`;
    return el;
  },

  _makeEdgeSlot(player, isVert) {
    const slot = document.createElement('div');
    slot.className = 'edge-slot';
    slot.id = 'edge-slot-' + player.id;
    return slot;
  },

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
          cell.innerHTML =
            `<span class="cell-tl${rc}">${rk}<span class="cell-ts">${sym}</span></span>` +
            `<span class="cell-mid${rc}">${sym}</span>` +
            `<span class="cell-br${rc}">${rk}<span class="cell-ts">${sym}</span></span>`;
        }

        const owner = BM.owner(r, c);
        if (owner) {
          const chip = document.createElement('div');
          chip.className = 'chip ' + teamChipCls(owner);
          cell.appendChild(chip);
        }
        if (BM.isSeqCell(r, c)) cell.classList.add('seq-cell');
        cell.addEventListener('click', () => GF.handleCellClick(r, c));
        board.appendChild(cell);
      }
    }
  },

  renderHands() {
    const cur = G.cur;

    // Active player glow on PILs and my-info-bar
    document.querySelectorAll('.pil').forEach(el => {
      el.classList.toggle('active-pil', el.id === 'pil-' + cur.id);
    });
    const myBar = document.getElementById('my-info-bar');
    if (myBar) myBar.classList.toggle('active-pil', cur.id === myId);

    // Fill edge slots for opponents
    G.players.forEach(p => {
      if (p.id === myId) return;
      const slot = document.getElementById('edge-slot-' + p.id);
      if (slot) this._fillEdgeSlot(slot, p);
    });

    // My interactive hand
    const me = G.players.find(p => p.id === myId);
    if (me) this._fillHandEl(document.getElementById('active-hand'), me);

    // Turn banner
    const banner = document.getElementById('turn-banner');
    banner.classList.remove('banner-pop');
    void banner.offsetWidth;
    banner.classList.add('banner-pop');
    banner.textContent       = cur.id === myId ? 'Your Turn!' : cur.name + "'s Turn";
    banner.style.borderColor = cur.color;
    banner.style.color       = cur.color;

    document.getElementById('deck-count').textContent = G.deck.length;
    document.querySelectorAll('.deck-card-b').forEach((p, i) => {
      p.style.opacity = G.deck.length > i * 30 ? '1' : '0.15';
    });
  },

  _fillEdgeSlot(slot, player) {
    slot.innerHTML = '';
    const hand  = G.hands[player.id] || [];
    const team  = player.teamIdx ?? 0;
    const count = hand.length;
    const show  = Math.min(count, 7);
    for (let i = 0; i < show; i++) {
      const card = document.createElement('div');
      card.className = 'edge-card';
      card.setAttribute('data-team', team);
      slot.appendChild(card);
    }
    if (count > 0) {
      const badge = document.createElement('div');
      badge.className = 'edge-count';
      badge.textContent = count;
      slot.appendChild(badge);
    }
  },

  _fillHandEl(el, player) {
    el.innerHTML = '';
    const hand  = G.hands[player.id] || [];
    const isCur = player.id === G.cur.id;
    hand.forEach((code, i) => {
      const cardEl = document.createElement('div');
      cardEl.className = 'card' + (isRed(code) ? ' red-card' : '');
      cardEl.innerHTML = buildCardFaceHTML(code);
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
    for (let t = 0; t < G.teamCount; t++) {
      const color   = TEAM_COLORS[t];
      const members = G.players.filter(p => p.teamIdx === t);
      const block   = document.createElement('div');
      block.className = 'score-block';
      block.id = `score-block-team-${t}`;
      block.innerHTML =
        `<span class="score-dot" style="background:${color}"></span>` +
        `<span class="score-label" style="color:${color}">Team ${TEAM_LABELS[t]}</span>` +
        `<span class="score-avs">${members.map(p => renderAvatar(p.avatar, 'sm')).join('')}</span>` +
        `<div class="score-pips" id="pips-team-${t}">` +
          Array.from({ length: WIN_SEQS }, () =>
            `<span class="pip" style="color:${color}"></span>`).join('') +
        `</div>`;
      strip.appendChild(block);
    }
  },

  updateScore() {
    for (let t = 0; t < G.teamCount; t++) {
      const color = TEAM_COLORS[t];
      document.querySelectorAll(`#pips-team-${t} .pip`).forEach((pip, i) => {
        const fill = i < (G.scores[t] || 0);
        if (fill && !pip.classList.contains('filled')) {
          pip.classList.add('filled','filling');
          pip.style.background = color;
          setTimeout(() => pip.classList.remove('filling'), 450);
        } else if (!fill) {
          pip.classList.remove('filled');
          pip.style.background = '';
        }
      });
    }
  },

  clearHighlights() {
    document.querySelectorAll('.cell').forEach(c => c.classList.remove('valid','valid-remove'));
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
    if (G.animating || G.cur.id !== myId) return;
    G.selectedCard = (G.selectedCard === card && G.selIdx === idx) ? null : card;
    G.selIdx       = G.selectedCard === null ? null : idx;
    Renderer.highlightValidCells();
    Renderer.renderHands();
  },

  handleCellClick(r, c) {
    if (G.animating || !G.selectedCard || G.cur.id !== myId) return;
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

    const player     = G.cur;
    const cardIdx    = G.selIdx;
    const myTeam     = G.teamAssignments[player.id] ?? 0;
    const hadDeckCard = G.deck.length > 0;

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
    if (placed)      Renderer.animateChip(r, c);
    if (hadDeckCard) animateCardDraw(player.id);

    const newSeqs = placed ? RE.findNewSequences(r, c, player.id) : [];
    if (newSeqs.length) {
      newSeqs.forEach(line => {
        G.seqLines.push({ key: RE.lineKey(line), pid: player.id });
        line.forEach(([lr, lc]) => G.seqCells.add(`${lr},${lc}`));
        G.scores[myTeam] = (G.scores[myTeam] || 0) + 1;
      });
      Renderer.updateScore();
      await delay(260);
      Renderer.renderBoard();
      newSeqs.forEach(line => Renderer.drawSequenceLine(line, player));
      await delay(600);
    }

    const teamScore = G.scores[myTeam] || 0;
    const isWinner  = teamScore >= WIN_SEQS;
    const nextIdx   = isWinner ? G.currentIdx : (G.currentIdx + 1) % G.players.length;

    const update = {};
    update[`hands/${player.id}`]        = pack(newHand);
    update['deck']                      = pack(newDeck);
    update[`boardState/${BM.key(r,c)}`] = placed ? player.id : null;
    update['seqCells']                  = pack([...G.seqCells]);
    update['seqLines']                  = JSON.stringify(G.seqLines);
    update[`teamScores/${myTeam}`]      = teamScore;
    update['currentPlayerIndex']        = nextIdx;
    update['status']                    = isWinner ? 'finished' : 'playing';
    if (isWinner) update['winner']      = myTeam;

    G.animating = false;
    document.body.classList.remove('locked');

    await roomRef.update(update);

    if (isWinner) showWin(myTeam);
    else Renderer.renderHands();
  },
};

/* ══════════════════════════════════════════════════════════════════════════
   UI HELPERS
   ══════════════════════════════════════════════════════════════════════════ */

function animateCardDraw(playerId) {
  const deckEl = document.getElementById('deck-pile');
  if (!deckEl) return;
  const isMe  = playerId === myId;
  let handEl  = isMe
    ? document.getElementById('active-hand')
    : document.getElementById('edge-slot-' + playerId);
  if (!handEl || handEl.offsetParent === null) return;

  const fromR  = deckEl.getBoundingClientRect();
  const toR    = handEl.getBoundingClientRect();
  const startX = fromR.left + fromR.width  / 2 - 22;
  const startY = fromR.top  + fromR.height / 2 - 30;
  const endX   = toR.right  - 48;
  const endY   = toR.top    + toR.height / 2 - 30;

  const fly = document.createElement('div');
  fly.className = 'flying-card-anim';
  fly.style.left = startX + 'px';
  fly.style.top  = startY + 'px';
  document.body.appendChild(fly);

  requestAnimationFrame(() => requestAnimationFrame(() => {
    fly.style.transform  = `translate(${endX - startX}px,${endY - startY}px) rotate(8deg) scale(.82)`;
    fly.style.opacity    = '0';
    fly.style.transition = 'transform .42s cubic-bezier(.22,.68,0,1.28), opacity .16s ease .3s';
  }));
  setTimeout(() => fly.remove(), 600);
}

function showView(id) {
  ['landing-screen','lobby-screen','game-screen'].forEach(v => {
    const el = document.getElementById(v);
    if (el) el.classList.toggle('hidden', v !== id);
  });
  document.body.classList.toggle('in-game', id === 'game-screen');
}

function showError(msg) {
  const el = document.getElementById('landing-error');
  if (!el) return;
  el.textContent = msg;
  setTimeout(() => { el.textContent = ''; }, 3500);
}

function showWin(winTeamIdx) {
  const isMyTeam = (G.teamAssignments[myId] ?? 0) === winTeamIdx;
  document.getElementById('win-text').textContent =
    isMyTeam ? 'Your Team Wins! 🎉' : `Team ${TEAM_LABELS[winTeamIdx]} Wins!`;
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
document.getElementById('invite-join-btn').addEventListener('click', () => joinRoom(urlCode));
document.getElementById('code-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') joinRoom(document.getElementById('code-input').value);
});
document.getElementById('name-input').addEventListener('keydown', e => {
  if (e.key !== 'Enter') return;
  if (urlCode) joinRoom(urlCode);
  else {
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

document.querySelectorAll('.team-count-opt').forEach(btn => {
  btn.addEventListener('click', () => setTeamCount(parseInt(btn.dataset.count)));
});

/* ── Init ─────────────────────────────────────────────────────────────────── */
buildAvatarPicker();
setupLanding();
showView('landing-screen');
