export default function GlassPanel({ children, className = '', style = {}, onClick }) {
  return (
    <div
      className={className}
      onClick={onClick}
      style={{
        background: 'var(--glass-bg)',
        border: 'var(--glass-border)',
        backdropFilter: 'var(--glass-blur)',
        boxShadow: 'var(--glass-shadow)',
        borderRadius: '16px',
        ...style,
      }}
    >
      {children}
    </div>
  )
}
