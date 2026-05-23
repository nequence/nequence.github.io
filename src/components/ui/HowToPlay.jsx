import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Modal from './Modal'

const TABS = ['Basics', 'Special Cards', 'Sequences', 'Winning', 'Strategy']

function TabContent({ tab }) {
  switch (tab) {
    case 'Basics':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <Section title="What is Nequence?">
            A real-time multiplayer strategy card game. Play one card per turn to place your team's chip on the matching board space.
          </Section>
          <Section title="Objective">
            Form <strong style={{ color: 'var(--text-primary)' }}>sequences</strong> — straight lines of 5 of your team's chips — before the other teams do.
          </Section>
          <Section title="Your Turn">
            <ol style={{ paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <li>Select a card from your hand</li>
              <li>Place your chip on the matching board cell</li>
              <li>A replacement card is dealt automatically — no click needed</li>
            </ol>
          </Section>
          <Section title="FREE Corners">
            The four corner cells count as every team's chip simultaneously and can never be blocked.
          </Section>
        </div>
      )
    case 'Special Cards':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <SpecialCard label="TWO-EYED JACK" sub="J♦ and J♣" desc="Place your chip on any open cell on the board. Glows in hand." />
          <SpecialCard label="ONE-EYED JACK" sub="J♥ and J♠" desc="Remove one opponent chip from any non-locked cell. Glows in hand." />
          <SpecialCard label="DEAD CARD" sub="Both cells occupied" desc="Click the dead card to discard it and draw a replacement. Flagged automatically." />
        </div>
      )
    case 'Sequences':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Section title="A sequence is 5 chips in a straight line">
            Horizontal · Vertical · Either diagonal. FREE corners count for every team.
          </Section>
          <Section title="Rules">
            <ul style={{ paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <li>Detected automatically after each placement</li>
              <li>Completed sequence chips are locked — One-Eyed Jacks can't remove them</li>
              <li>Two sequences may share exactly 1 chip</li>
            </ul>
          </Section>
        </div>
      )
    case 'Winning':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr>
                {['Teams', 'Players', 'Win At'].map(h => (
                  <th key={h} style={{ padding: '8px 12px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 500, fontFamily: 'var(--font-mono)', fontSize: '11px', borderBottom: '1px solid var(--border-dim)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[['2','2–8','3 sequences'],['2','10–14','2 sequences'],['3','3–14','2 sequences'],['4','4–14','2 sequences'],['Any','15+','Grand Mode']].map(([t,p,w]) => (
                <tr key={p} style={{ borderBottom: '1px solid var(--border-dim)' }}>
                  <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>{t}</td>
                  <td style={{ padding: '10px 12px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>{p}</td>
                  <td style={{ padding: '10px 12px', color: 'var(--text-primary)', fontWeight: 500 }}>{w}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.6 }}>
            If the draw pile exhausts: chips on board → most sequences → draw.
          </p>
        </div>
      )
    case 'Strategy':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[
            ['Anchor on corners','FREE corners count for everyone — build sequences through them for a head start.'],
            ['Save Wild Jacks','Two-Eyed Jacks are rare. Hold them for the exact cell you cannot reach otherwise.'],
            ['Break threats early','Use One-Eyed Jacks to disrupt opponent sequences before they are 1 chip away.'],
            ['Block proactively','If an opponent is 1 chip from a sequence, block that cell instead of advancing.'],
            ['Signal without words','Cluster chips in an area to signal your strategy to teammates.'],
          ].map(([title, desc]) => (
            <div key={title} style={{ padding: '14px 16px', background: 'var(--bg-surface)', borderRadius: '10px', border: '1px solid var(--border-dim)' }}>
              <div style={{ fontWeight: 600, fontSize: '13px', marginBottom: '5px' }}>{title}</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.6 }}>{desc}</div>
            </div>
          ))}
        </div>
      )
    default: return null
  }
}

function Section({ title, children }) {
  return (
    <div>
      <p style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', letterSpacing: '0.08em', marginBottom: '8px' }}>{title.toUpperCase()}</p>
      <div style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.7 }}>{children}</div>
    </div>
  )
}

function SpecialCard({ label, sub, desc }) {
  return (
    <div style={{ padding: '14px 16px', background: 'var(--bg-surface)', borderRadius: '10px', border: '1px solid var(--border-dim)' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '6px' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '0.06em' }}>{label}</span>
        <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{sub}</span>
      </div>
      <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.6 }}>{desc}</p>
    </div>
  )
}

export default function HowToPlay({ open, onClose }) {
  const [activeTab, setActiveTab] = useState('Basics')
  return (
    <Modal open={open} onClose={onClose} title="How to Play" maxWidth={520}>
      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-dim)', marginBottom: '24px', gap: 0 }}>
        {TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            padding: '10px 14px', background: 'none', border: 'none',
            borderBottom: activeTab === tab ? '2px solid var(--text-primary)' : '2px solid transparent',
            color: activeTab === tab ? 'var(--text-primary)' : 'var(--text-muted)',
            fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: activeTab === tab ? 600 : 400,
            cursor: 'pointer', marginBottom: '-1px', transition: 'all 0.15s', whiteSpace: 'nowrap',
          }}>
            {tab}
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={activeTab}
          initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.15 }}
          style={{ maxHeight: '52vh', overflowY: 'auto', paddingRight: '4px' }}
        >
          <TabContent tab={activeTab} />
        </motion.div>
      </AnimatePresence>
    </Modal>
  )
}
