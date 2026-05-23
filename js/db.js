// Firebase — loaded from CDN, no build step needed
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js'
import {
  getDatabase, ref, set, get, update, onValue, off, remove
} from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js'

const firebaseConfig = {
  apiKey:            'AIzaSyPlaceholderKeyForNequence',
  authDomain:        'nequence-default-rtdb.firebaseapp.com',
  databaseURL:       'https://nequence-default-rtdb.firebaseio.com',
  projectId:         'nequence-default-rtdb',
  storageBucket:     'nequence-default-rtdb.appspot.com',
  messagingSenderId: '000000000000',
  appId:             '1:000000000000:web:placeholder',
}

const app = initializeApp(firebaseConfig)
export const db = getDatabase(app)
export { ref, set, get, update, onValue, off, remove }

// ── UID: uses localStorage so it survives page reloads ──
export function getUid() {
  let uid = localStorage.getItem('nequence_uid')
  if (!uid) {
    uid = 'u_' + Math.random().toString(36).slice(2, 10)
    localStorage.setItem('nequence_uid', uid)
  }
  return uid
}

// ── Room code helpers ──
export function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)]
  return code
}

export function normalizeCode(s) {
  return s.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6)
}

// ── Simple toast notification ──
export function toast(msg, duration = 2500) {
  let el = document.getElementById('toast')
  if (!el) {
    el = document.createElement('div')
    el.id = 'toast'
    document.body.appendChild(el)
  }
  el.textContent = msg
  el.classList.add('show')
  clearTimeout(el._t)
  el._t = setTimeout(() => el.classList.remove('show'), duration)
}

// ── Navigate to another page ──
export function go(path) { window.location.href = path }
