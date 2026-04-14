import EntityCard from '../EntityCard/EntityCard.jsx'
import { formatCurrency, computeSavingsTotal } from '../../utils/financialRules.js'
import { useFinanceStore } from '../../store/useFinanceStore.js'
import { useTransactions } from '../../hooks/useTransactions.js'

export default function SavingsCard({ savings }) {
  const incomes = useFinanceStore((s) => s.incomes)
  const { removeSavings } = useTransactions()
  const total = computeSavingsTotal(savings, incomes)

  const linkedIncomes = incomes.filter((i) =>
    (savings.linkedIncomeIds ?? []).includes(i.id)
  )

  return (
    <EntityCard className="min-w-[220px] flex-1">
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className="text-xs text-gray-500 uppercase tracking-wider">Savings</span>
          <h3 className="font-medium text-gray-100 mt-0.5">{savings.title}</h3>
        </div>
        <button
          onClick={() => removeSavings(savings.id).catch(alert)}
          className="text-gray-600 hover:text-red-400 transition-colors text-lg leading-none mt-0.5"
          title="Delete"
        >
          ×
        </button>
      </div>

      <span className="text-2xl font-bold text-blue-400 tabular-nums">
        {formatCurrency(total)}
      </span>

      {linkedIncomes.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {linkedIncomes.map((income) => (
            <span
              key={income.id}
              className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full"
            >
              {income.title}
            </span>
          ))}
        </div>
      )}
    </EntityCard>
  )
}
