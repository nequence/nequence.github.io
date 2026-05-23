import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { handSizeForPlayers, sequencesToWinFor } from '../../utils/cardUtils'

function PillToggle({ options, value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
      {options.map(({ label, val }) => {
        const active = value === val
        return (
          <button key={val} onClick={() => onChange(val)} style={{
            padding: '5px 12px', borderRadius: '6px', border: '1px solid',
            borderColor: active ? 'var(--border-active)' : 'var(--border-dim)',
            background: active ? 'rgba(255,255,255,0.10)' : 'transparent',
            color: active ? 'var(--text-primary)' : 'var(--text-muted)',
            fontFamily: 'var(--font-body)', fontSize: '13px', cursor: 'pointer',
            fontWeight: active ? 600 : 400, transition: 'all 0.12s',
          }}>
            {label}
          </button>
        )
      })}
    </div>
  )
}

function ToggleSwitch({ value, onChange }) {
  return (
    <div onClick={() => onChange(!value)} style={{
      width: 40, height: 22, borderRadius: 11,
      background: value ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.06)',
      border: '1px solid var(--border-subtle)',
      position: 'relative', cursor: 'pointer', transition: 'background 0.2s', flexShrink: 0,
    }}>
      <motion.div animate={{ x: value ? 18 : 2 }} transition={{ duration: 0.14 }}
        style={{ position: 'absolute', top: 2, width: 16, height: 16, borderRadius: '50%', background: value ? '#fff' : 'rgba(255,255,255,0.3)' }} />
    </div>
  )
}

function Row({ label, hint, children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '24px', padding: '14px 0', borderBottom: '1px solid var(--border-dim)' }}>
      <div>
        <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>{label}</div>
        {hint && <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '3px' }}>{hint}</div>}
      </div>
      <div style={{ flexShrink: 0 }}>{children}</div>
    </div>
  )
}

const DEFAULTS = { teamCount: 2, sequencesToWin: null, handSize: null, turnTimerSeconds: 60, grandMode: 'auto', dualBoard: false, confirmPlacement: true, allowLateJoin: false }

export default function HostSettings({ settings, onChange, playerCount = 2 }) {
  const [open, setOpen] = useState(true)
  const s = { ...DEFAULTS, ...settings }
  const smartSeq  = sequencesToWinFor(s.teamCount, playerCount)
  const smartHand = handSizeForPlayers(playerCount)
  function update(key, val) { onChange?.({ ...s, [key]: val }) }

  return (
    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-dim)', borderRadius: '12px', overflow: 'hidden' }}>
      <button onClick={() => setOpen(o => !o)} style={{
        width: '100%', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'none', border: 'none', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)',
        fontSize: '11px', letterSpacing: '0.1em', cursor: 'pointer', fontWeight: 600,
      }}>
        SETTINGS
        <span style={{ transform: `rotate(${open ? 180 : 0}deg)`, transition: 'transform 0.2s', color: 'var(--text-muted)', fontSize: '10px' }}>▼</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.18 }} style={{ overflow: 'hidden' }}>
            <div style={{ padding: '0 20px 20px' }}>
              <Row label="Teams">
                <PillToggle options={[{label:'2',val:2},{label:'3',val:3},{label:'4',val:4}]} value={s.teamCount} onChange={v => update('teamCount', v)} />
              </Row>
              <Row label="Sequences to Win" hint={`recommended: ${smartSeq}`}>
                <PillToggle options={[1,2,3,4,5].map(n=>({label:`${n}`,val:n}))} value={s.sequencesToWin ?? smartSeq} onChange={v => update('sequencesToWin', v)} />
              </Row>
              <Row label="Hand Size" hint={`recommended: ${smartHand}`}>
                <PillToggle options={[3,4,5,6,7].map(n=>({label:`${n}`,val:n}))} value={s.handSize ?? smartHand} onChange={v => update('handSize', v)} />
              </Row>
              <Row label="Turn Timer">
                <PillToggle options={[{label:'15s',val:15},{label:'30s',val:30},{label:'45s',val:45},{label:'60s',val:60},{label:'90s',val:90},{label:'∞',val:0}]} value={s.turnTimerSeconds} onChange={v => update('turnTimerSeconds', v)} />
              </Row>
              <Row label="Grand Mode" hint="Auto-enables at 15+ players">
                <PillToggle options={[{label:'Auto',val:'auto'},{label:'On',val:'on'},{label:'Off',val:'off'}]} value={s.grandMode} onChange={v => update('grandMode', v)} />
              </Row>
              <Row label="Confirm Placement">
                <ToggleSwitch value={s.confirmPlacement} onChange={v => update('confirmPlacement', v)} />
              </Row>
              <Row label="Dual Board">
                <ToggleSwitch value={s.dualBoard} onChange={v => update('dualBoard', v)} />
              </Row>
              <Row label="Allow Late Join">
                <ToggleSwitch value={s.allowLateJoin} onChange={v => update('allowLateJoin', v)} />
              </Row>
              <div style={{ marginTop: '14px' }}>
                <button onClick={() => onChange?.(DEFAULTS)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '12px', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
                  Reset to defaults
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
