import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import AvatarPreview from '../avatar/AvatarPreview'
import Button from '../ui/Button'

const TEAM_COLORS = { aether: '#7C3AED', nova: '#D97706', pulse: '#E11D48', void: '#0D9488' }
const TEAM_NAMES  = { aether: 'Aether',  nova: 'Nova',    pulse: 'Pulse',   void: 'Void'  }

function Confetti({ color }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const particles = Array.from({ length: 220 }, () => ({
      x: Math.random() * canvas.width,
      y: -20,
      vx: (Math.random() - 0.5) * 4,
      vy: Math.random() * 3 + 2,
      size: Math.random() * 8 + 4,
      rot: Math.random() * 360,
      rotV: (Math.random() - 0.5) * 6,
      color: [color, '#fff', 'rgba(255,255,255,0.6)'][Math.floor(Math.random() * 3)],
      opacity: Math.random() * 0.5 + 0.5,
    }))

    let raf
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      for (const p of particles) {
        ctx.save()
        ctx.globalAlpha = p.opacity
        ctx.translate(p.x, p.y)
        ctx.rotate((p.rot * Math.PI) / 180)
        ctx.fillStyle = p.color
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2)
        ctx.restore()
        p.x  += p.vx
        p.y  += p.vy
        p.rot += p.rotV
        p.vy += 0.05
        if (p.y > canvas.height + 20) {
          p.y = -20
          p.x = Math.random() * canvas.width
          p.vy = Math.random() * 3 + 2
        }
      }
      raf = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(raf)
  }, [color])

  return <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }} />
}

export default function WinScreen({ winner, players = {}, teams = {}, stats = {}, isHost, onPlayAgain, onClose }) {
  const color = TEAM_COLORS[winner] || '#888'
  const name  = TEAM_NAMES[winner]  || winner
  const winningPlayers = Object.values(players).filter(p => p.team === winner)

  return (
    <AnimatePresence>
      {winner && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(6,6,12,0.92)',
            backdropFilter: 'blur(20px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 2000,
          }}
        >
          <Confetti color={color} />

          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            style={{
              position: 'relative', zIndex: 1,
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px',
              textAlign: 'center', padding: '48px', maxWidth: 520,
            }}
          >
            <div style={{
              fontFamily: 'var(--font-display)', fontSize: '48px', fontWeight: 800,
              color, textShadow: `0 0 40px ${color}`, letterSpacing: '0.04em',
              lineHeight: 1.1,
            }}>
              TEAM {name.toUpperCase()}<br />
              <span style={{ fontSize: '28px', color: '#fff', textShadow: 'none' }}>WINS!</span>
            </div>

            {/* Winner avatars */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              {winningPlayers.map(p => (
                <div key={p.uid || p.username} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                  <AvatarPreview config={p.avatar} teamColor={winner} size={64} />
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{p.username}</span>
                </div>
              ))}
            </div>

            {/* Stats */}
            {Object.keys(stats).length > 0 && (
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px',
                width: '100%',
              }}>
                {[
                  ['Sequences', stats.sequences],
                  ['Chips', stats.chips],
                  ['Turns', stats.turns],
                  ['Duration', stats.duration],
                ].filter(([, v]) => v != null).map(([label, value]) => (
                  <div key={label} style={{ background: 'var(--bg-surface)', borderRadius: '10px', padding: '12px', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '11px', marginBottom: '4px' }}>{label}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: '18px', color }}>{value}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Actions */}
            {isHost ? (
              <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
                <Button onClick={onPlayAgain} fullWidth>Play Again</Button>
                <Button onClick={onClose} variant="secondary" fullWidth>Close Room</Button>
              </div>
            ) : (
              <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                Waiting for host to start a new game…
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
