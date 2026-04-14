import { progressColor } from '../../utils/financialRules.js'

export default function ProgressBar({ value = 0, colorScheme = 'spend' }) {
  const pct = Math.min(100, Math.max(0, value))

  const color =
    colorScheme === 'neutral'
      ? 'bg-blue-500'
      : progressColor(pct)

  return (
    <div className="w-full bg-gray-700 rounded-full h-1.5 overflow-hidden">
      <div
        className={`h-1.5 rounded-full transition-all duration-300 ${color}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}
