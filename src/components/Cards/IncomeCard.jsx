import EntityCard from '../EntityCard/EntityCard.jsx'
import { formatCurrency } from '../../utils/financialRules.js'
import { useTransactions } from '../../hooks/useTransactions.js'

export default function IncomeCard({ income }) {
  const { removeIncome } = useTransactions()

  return (
    <EntityCard className="min-w-[220px] flex-1">
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className="text-xs text-gray-500 uppercase tracking-wider">Income</span>
          <h3 className="font-medium text-gray-100 mt-0.5">{income.title}</h3>
        </div>
        <button
          onClick={() => removeIncome(income.id).catch(alert)}
          className="text-gray-600 hover:text-red-400 transition-colors text-lg leading-none mt-0.5"
          title="Delete"
        >
          ×
        </button>
      </div>
      <div>
        <span className="text-2xl font-bold text-emerald-400 tabular-nums">
          {formatCurrency(income.amount)}
        </span>
        {income.initialAmount != null && income.initialAmount !== income.amount && (
          <span className="text-xs text-gray-500 ml-2">
            of {formatCurrency(income.initialAmount)}
          </span>
        )}
      </div>
    </EntityCard>
  )
}
