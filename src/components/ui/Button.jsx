import { motion } from 'framer-motion'

export default function Button({
  children,
  onClick,
  disabled = false,
  variant = 'primary',
  fullWidth = false,
  style = {},
  className = '',
}) {
  const base = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '12px 24px',
    borderRadius: '10px',
    fontFamily: 'var(--font-body)',
    fontWeight: 600,
    fontSize: '15px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    border: 'none',
    outline: 'none',
    width: fullWidth ? '100%' : undefined,
    opacity: disabled ? 0.35 : 1,
    letterSpacing: '0.01em',
  }

  const variants = {
    primary: {
      background: 'var(--accent)',
      color: '#0E0E0E',
      border: 'none',
    },
    secondary: {
      background: 'transparent',
      color: 'var(--text-primary)',
      border: '1px solid var(--border-clear)',
    },
    ghost: {
      background: 'transparent',
      color: 'var(--text-secondary)',
      border: 'none',
    },
    danger: {
      background: 'transparent',
      color: 'var(--text-primary)',
      border: '1px solid var(--border-clear)',
    },
  }

  return (
    <motion.button
      onClick={disabled ? undefined : onClick}
      style={{ ...base, ...variants[variant], ...style }}
      className={className}
      whileHover={disabled ? {} : { opacity: 0.85 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      transition={{ duration: 0.1 }}
    >
      {children}
    </motion.button>
  )
}
