import AvatarLayers from './AvatarLayers'

export default function AvatarPreview({ config, teamColor, size = 120 }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '50%',
      overflow: 'hidden',
      width: size,
      height: size,
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-subtle)',
      flexShrink: 0,
    }}>
      <AvatarLayers config={config} teamColor={teamColor} size={size} />
    </div>
  )
}
