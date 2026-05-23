import { suitColor, suitSymbol } from '../../utils/cardUtils'

export default function CardSuit({ suit, size = 14 }) {
  return (
    <span style={{ color: suitColor(suit), fontSize: size, lineHeight: 1 }}>
      {suitSymbol(suit)}
    </span>
  )
}
