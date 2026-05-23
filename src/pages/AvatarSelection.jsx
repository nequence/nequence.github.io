import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ref, update } from 'firebase/database'
import { db } from '../firebase'
import useGameStore from '../store/useGameStore'
import AvatarLayers from '../components/avatar/AvatarLayers'
import PageTransition from '../components/layout/PageTransition'

const SKIN_TONES  = ['#FDDBB4','#F1C27D','#E0AC69','#C68642','#8D5524','#4A2511']
const HAIR_COLORS = ['#1a1a1a','#3B1F0A','#7B3F00','#C49A6C','#F5D76E','#E8E8E8','#D94F5C','#7B2FBE','#2563EB','#16A34A','#EA580C','#0891B2']

const SECTIONS = {
  Body:        { key: 'body',       options: ['Standard','Broad','Slim','Athletic'] },
  Hair:        { key: 'hairStyle',  options: ['Short','Medium','Long','Curly','Fade','Bun','Braids','Afro','Mohawk','Ponytail'] },
  Face:        { key: 'expression', options: ['Neutral','Smile','Smirk','Focused','Fierce','Chill'] },
  Outfit:      { key: 'outfit',     options: ['Hoodie','Jacket','T-Shirt','Turtleneck','Zip-Up','Striped','Bomber','Parka'] },
  Accessories: { key: 'accessory',  options: ['None','Round Glasses','Cap','Studs','Rect Glasses','Hoops','Headband'] },
}
const TABS = Object.keys(SECTIONS)

export default function AvatarSelection() {
  const { roomCode } = useParams()
  const navigate     = useNavigate()
  const uid          = useGameStore(s => s.uid)
  const myAvatar     = useGameStore(s => s.myAvatar)
  const myUsername   = useGameStore(s => s.myUsername)
  const setMyAvatar  = useGameStore(s => s.setMyAvatar)
  const setMyUsername= useGameStore(s => s.setMyUsername)

  const [activeTab, setActiveTab] = useState('Body')
  const [saving, setSaving]       = useState(false)
  const [nameError, setNameError] = useState(false)

  function setKey(key, val) { setMyAvatar({ ...myAvatar, [key]: val }) }

  async function handleContinue() {
    if (!myUsername.trim()) { setNameError(true); return }
    setSaving(true)
    try {
      await update(ref(db, `rooms/${roomCode}/players/${uid}`), { username: myUsername.trim(), avatar: myAvatar })
      navigate(`/lobby/${roomCode}`)
    } catch (e) { console.error(e) } finally { setSaving(false) }
  }

  const { key, options } = SECTIONS[activeTab]
  const isHairTab = activeTab === 'Hair'

  return (
    <PageTransition>
      <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', flexDirection: 'column' }}>

        {/* ── Header ── */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 32px', borderBottom: '1px solid var(--border-dim)',
        }}>
          <button onClick={() => navigate(-1)} style={ghostBtn}>← Back</button>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '15px', letterSpacing: '0.06em' }}>
            CHOOSE YOUR AVATAR
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-muted)' }}>
            {roomCode}
          </span>
        </div>

        {/* ── Main two-column layout ── */}
        <div style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: '280px 1fr',
          gap: 0,
          overflow: 'hidden',
        }}>

          {/* ── LEFT: Preview + name ── */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '24px',
            padding: '40px 32px',
            borderRight: '1px solid var(--border-dim)',
            background: 'var(--bg-void)',
          }}>
            {/* Avatar circle */}
            <div style={{
              width: 200, height: 200,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid var(--border-subtle)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden',
              flexShrink: 0,
            }}>
              <AvatarLayers config={myAvatar} size={200} />
            </div>

            {/* Name input */}
            <div style={{ width: '100%' }}>
              <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '0.08em', marginBottom: '8px', fontFamily: 'var(--font-mono)' }}>
                DISPLAY NAME
              </label>
              <input
                value={myUsername}
                onChange={e => { setMyUsername(e.target.value.slice(0, 16)); setNameError(false) }}
                placeholder="Enter name…"
                style={{
                  width: '100%',
                  background: 'rgba(255,255,255,0.05)',
                  border: nameError ? '1px solid rgba(255,255,255,0.4)' : '1px solid var(--border-subtle)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-body)',
                  fontSize: '15px',
                  padding: '11px 14px',
                  outline: 'none',
                  transition: 'border 0.15s',
                  textAlign: 'center',
                }}
              />
              {nameError && (
                <p style={{ color: 'var(--text-secondary)', fontSize: '12px', marginTop: '6px', textAlign: 'center' }}>
                  Enter a name to continue
                </p>
              )}
            </div>

            {/* Continue */}
            <button
              onClick={handleContinue}
              disabled={saving}
              style={{
                width: '100%',
                padding: '13px',
                background: saving ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.92)',
                color: saving ? 'var(--text-muted)' : '#0E0E0E',
                border: 'none',
                borderRadius: '8px',
                fontFamily: 'var(--font-body)',
                fontWeight: 700,
                fontSize: '14px',
                cursor: saving ? 'not-allowed' : 'pointer',
                letterSpacing: '0.02em',
                transition: 'all 0.15s',
              }}
            >
              {saving ? 'Saving…' : 'Continue →'}
            </button>
          </div>

          {/* ── RIGHT: Builder ── */}
          <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

            {/* Tab bar */}
            <div style={{
              display: 'flex',
              borderBottom: '1px solid var(--border-dim)',
              padding: '0 32px',
              gap: 0,
              flexShrink: 0,
            }}>
              {TABS.map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    padding: '16px 18px',
                    background: 'none',
                    border: 'none',
                    borderBottom: activeTab === tab ? '2px solid var(--text-primary)' : '2px solid transparent',
                    color: activeTab === tab ? 'var(--text-primary)' : 'var(--text-muted)',
                    fontFamily: 'var(--font-body)',
                    fontSize: '13px',
                    fontWeight: activeTab === tab ? 600 : 400,
                    cursor: 'pointer',
                    marginBottom: '-1px',
                    transition: 'all 0.15s',
                    letterSpacing: '0.01em',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Options area */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.15 }}
                >
                  {/* Option tiles */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '8px', marginBottom: isHairTab ? '32px' : 0 }}>
                    {options.map((label, i) => {
                      const selected = myAvatar[key] === i
                      return (
                        <motion.button
                          key={i}
                          onClick={() => setKey(key, i)}
                          whileHover={{ background: 'rgba(255,255,255,0.08)' }}
                          whileTap={{ scale: 0.97 }}
                          style={{
                            padding: '12px 14px',
                            background: selected ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.03)',
                            border: selected ? '1px solid rgba(255,255,255,0.35)' : '1px solid var(--border-dim)',
                            borderRadius: '8px',
                            color: selected ? 'var(--text-primary)' : 'var(--text-secondary)',
                            fontFamily: 'var(--font-body)',
                            fontSize: '13px',
                            fontWeight: selected ? 600 : 400,
                            cursor: 'pointer',
                            textAlign: 'center',
                            transition: 'border 0.12s, color 0.12s',
                          }}
                        >
                          {label}
                        </motion.button>
                      )
                    })}
                  </div>

                  {/* Skin tone swatches (Body tab) */}
                  {activeTab === 'Body' && (
                    <div style={{ marginTop: '32px' }}>
                      <p style={{ fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '0.08em', fontFamily: 'var(--font-mono)', marginBottom: '12px' }}>
                        SKIN TONE
                      </p>
                      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        {SKIN_TONES.map((c, i) => (
                          <button
                            key={i}
                            onClick={() => setKey('skin', i)}
                            style={{
                              width: 36, height: 36, borderRadius: '50%', background: c, cursor: 'pointer',
                              border: myAvatar.skin === i ? '2px solid rgba(255,255,255,0.7)' : '2px solid transparent',
                              outline: myAvatar.skin === i ? '1px solid rgba(255,255,255,0.2)' : 'none',
                              outlineOffset: '3px',
                              transition: 'border 0.12s',
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Hair color swatches (Hair tab) */}
                  {isHairTab && (
                    <div style={{ marginTop: '32px' }}>
                      <p style={{ fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '0.08em', fontFamily: 'var(--font-mono)', marginBottom: '12px' }}>
                        HAIR COLOR
                      </p>
                      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        {HAIR_COLORS.map((c, i) => (
                          <button
                            key={i}
                            onClick={() => setKey('hairColor', i)}
                            style={{
                              width: 32, height: 32, borderRadius: '50%', background: c, cursor: 'pointer',
                              border: myAvatar.hairColor === i ? '2px solid rgba(255,255,255,0.7)' : '2px solid transparent',
                              outline: myAvatar.hairColor === i ? '1px solid rgba(255,255,255,0.2)' : 'none',
                              outlineOffset: '3px',
                              transition: 'border 0.12s',
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}

const ghostBtn = {
  background: 'none',
  border: 'none',
  color: 'var(--text-muted)',
  fontFamily: 'var(--font-body)',
  fontSize: '13px',
  cursor: 'pointer',
  padding: '4px 0',
}
