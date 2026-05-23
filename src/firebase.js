import { initializeApp } from 'firebase/app'
import { getDatabase } from 'firebase/database'
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth'
import { getFunctions } from 'firebase/functions'

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

export const db        = getDatabase(app)
export const auth      = getAuth(app)
export const functions = getFunctions(app)

function localFallbackUser() {
  let uid = localStorage.getItem('nequence_uid')
  if (!uid) {
    uid = 'local_' + Math.random().toString(36).slice(2, 10)
    localStorage.setItem('nequence_uid', uid)
  }
  return { uid }
}

export function ensureAuth() {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      unsubscribe()
      if (user) { resolve(user); return }
      signInAnonymously(auth)
        .then(cred => resolve(cred.user))
        .catch(() => resolve(localFallbackUser()))
    }, () => resolve(localFallbackUser()))
  })
}
