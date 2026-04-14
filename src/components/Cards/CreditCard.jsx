import EntityCard from '../EntityCard/EntityCard.jsx'
import ProgressBar from '../ProgressBar/ProgressBar.jsx'
import { formatCurrency, computeCreditProgressPercent } from '../../utils/financialRules.js'
import { useTransactions } from '../../hooks/useTransactions.js'

export default function CreditCard({ credit }) {
  const { removeCredit } = useTransactions()
  const pct = computeCreditProgressPercent(credit.used, credit.limit)

  return (
    <EntityCard className="min-w-[220px] flex-1">
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className="text-xs text-gray-500 uppercase tracking-wider">Credit</span>
          <h3 className="font-medium text-gray-100 mt-0.5">{credit.title}</h3>
        </div>
        <button
          onClick={() => removeCredit(credit.id).catch(alert)}
          className="text-gray-600 hover:text-red-400 transition-colors text-lg leading-none mt-0.5"
          title="Delete"
        >
          ×
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <span className="text-gray-500 block text-xs">Used</span>
          <span className="text-orange-400 font-semibold tabular-nums">
            {formatCurrency(credit.used)}
          </span>
        </div>
        <div>
          <span className="text-gray-500 block text-xs">Available</span>
          <span className="text-emerald-400 font-semibold tabular-nums">
            {formatCurrency(credit.available)}
          </span>
        </div>
      </div>

      <ProgressBar value={pct} colorScheme="spend" />

      <div className="flex justify-between text-xs text-gray-500">
        <span>Limit {formatCurrency(credit.limit)}</span>
        <span>{pct}% used</span>
      </div>
    </EntityCard>
  )
}
