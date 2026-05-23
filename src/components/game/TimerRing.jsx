import { useEffect, useRef } from 'react'
import { motion, useMotionValue, useTransform, animate } from 'framer-motion'

const TEAM_COLORS = {
  aether: '#7C3AED', nova: '#D97706', pulse: '#E11D48', void: '#0D9488',
}

export default function TimerRing({ duration, startedAt, team, size = 52 }) {
  const r = (size - 6) / 2
  const circ = 2 * Math.PI * r
  const progress = useMotionValue(0)
  const dashOffset = useTransform(progress, [0, 1], [0, circ])
  const color = TEAM_COLORS[team] || 'var(--text-secondary)'
  const timerRef = useRef(null)

  useEffect(() => {
    if (!duration || duration === 0) return
    const elapsed = startedAt ? (Date.now() - startedAt) / 1000 : 0
    const remaining = Math.max(0, duration - elapsed)
    progress.set(1 - remaining / duration)

    timerRef.current = animate(progress, 1, {
      duration: remaining,
      ease: 'linear',
    })

    return () => timerRef.current?.stop()
  }, [duration, startedAt])

  if (!duration || duration === 0) return null

  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      {/* Track */}
      <circle cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={4} />
      {/* Progress */}
      <motion.circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none"
        stroke={color}
        strokeWidth={4}
        strokeLinecap="round"
        strokeDasharray={circ}
        style={{ strokeDashoffset: dashOffset }}
      />
    </svg>
  )
}
