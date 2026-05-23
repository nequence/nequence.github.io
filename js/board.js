// Canonical 10×10 Nequence board layout
export const BOARD_LAYOUT = [
  {id:'r0c0',type:'free'},{id:'r0c1',card:'Ac'},{id:'r0c2',card:'Kc'},{id:'r0c3',card:'Qc'},{id:'r0c4',card:'10c'},{id:'r0c5',card:'9c'},{id:'r0c6',card:'8c'},{id:'r0c7',card:'7c'},{id:'r0c8',card:'6c'},{id:'r0c9',type:'free'},
  {id:'r1c0',card:'Ad'},{id:'r1c1',card:'7s'},{id:'r1c2',card:'8s'},{id:'r1c3',card:'9s'},{id:'r1c4',card:'10s'},{id:'r1c5',card:'Qc'},{id:'r1c6',card:'Kc'},{id:'r1c7',card:'Ac'},{id:'r1c8',card:'5c'},{id:'r1c9',card:'2c'},
  {id:'r2c0',card:'Kd'},{id:'r2c1',card:'6s'},{id:'r2c2',card:'10c'},{id:'r2c3',card:'9c'},{id:'r2c4',card:'8c'},{id:'r2c5',card:'7s'},{id:'r2c6',card:'6c'},{id:'r2c7',card:'2d'},{id:'r2c8',card:'4c'},{id:'r2c9',card:'3c'},
  {id:'r3c0',card:'Qd'},{id:'r3c1',card:'5s'},{id:'r3c2',card:'Qc'},{id:'r3c3',card:'8h'},{id:'r3c4',card:'7h'},{id:'r3c5',card:'6h'},{id:'r3c6',card:'5c'},{id:'r3c7',card:'3d'},{id:'r3c8',card:'3c'},{id:'r3c9',card:'4c'},
  {id:'r4c0',card:'10d'},{id:'r4c1',card:'4s'},{id:'r4c2',card:'Kc'},{id:'r4c3',card:'9h'},{id:'r4c4',card:'2h'},{id:'r4c5',card:'5h'},{id:'r4c6',card:'4c'},{id:'r4c7',card:'4d'},{id:'r4c8',card:'2c'},{id:'r4c9',card:'5c'},
  {id:'r5c0',card:'9d'},{id:'r5c1',card:'3s'},{id:'r5c2',card:'Ac'},{id:'r5c3',card:'10h'},{id:'r5c4',card:'3h'},{id:'r5c5',card:'4h'},{id:'r5c6',card:'3c'},{id:'r5c7',card:'5d'},{id:'r5c8',card:'Ah'},{id:'r5c9',card:'6c'},
  {id:'r6c0',card:'8d'},{id:'r6c1',card:'2s'},{id:'r6c2',card:'Ad'},{id:'r6c3',card:'Qh'},{id:'r6c4',card:'Kh'},{id:'r6c5',card:'Ah'},{id:'r6c6',card:'2c'},{id:'r6c7',card:'6d'},{id:'r6c8',card:'Kh'},{id:'r6c9',card:'7c'},
  {id:'r7c0',card:'7d'},{id:'r7c1',card:'2h'},{id:'r7c2',card:'Kd'},{id:'r7c3',card:'Qd'},{id:'r7c4',card:'10d'},{id:'r7c5',card:'9d'},{id:'r7c6',card:'8d'},{id:'r7c7',card:'7d'},{id:'r7c8',card:'Qh'},{id:'r7c9',card:'8c'},
  {id:'r8c0',card:'6d'},{id:'r8c1',card:'3h'},{id:'r8c2',card:'4h'},{id:'r8c3',card:'5h'},{id:'r8c4',card:'6h'},{id:'r8c5',card:'7h'},{id:'r8c6',card:'8h'},{id:'r8c7',card:'9h'},{id:'r8c8',card:'10h'},{id:'r8c9',card:'9c'},
  {id:'r9c0',type:'free'},{id:'r9c1',card:'5d'},{id:'r9c2',card:'4d'},{id:'r9c3',card:'3d'},{id:'r9c4',card:'2d'},{id:'r9c5',card:'As'},{id:'r9c6',card:'Ks'},{id:'r9c7',card:'Qs'},{id:'r9c8',card:'10s'},{id:'r9c9',type:'free'},
]

export const FREE_CORNERS = new Set(['r0c0','r0c9','r9c0','r9c9'])

const BOARD_MAP = Object.fromEntries(BOARD_LAYOUT.map(c => [c.id, c]))
export function cellAt(id) { return BOARD_MAP[id] }
export function cellsForCard(code) {
  return BOARD_LAYOUT.filter(c => c.card === code).map(c => c.id)
}
