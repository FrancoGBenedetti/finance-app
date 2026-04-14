import EntityCard from '../EntityCard/EntityCard.jsx'
import ProgressBar from '../ProgressBar/ProgressBar.jsx'
import { formatCurrency, computeProgressPercent } from '../../utils/financialRules.js'
import { useTransactions } from '../../hooks/useTransactions.js'
import { useFinanceStore } from '../../store/useFinanceStore.js'

export default function ExpenseCard({ expense }) {
  const { removeExpense } = useTransactions()
  const { getIncomeById, getCreditById } = useFinanceStore()
  const pct = computeProgressPercent(expense.spent, expense.budget)

  const sourceName =
    expense.sourceType === 'income'
      ? getIncomeById(expense.sourceId)?.title
      : getCreditById(expense.sourceId)?.title

  return (
    <EntityCard className="min-w-[220px] flex-1">
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className="text-xs text-gray-500 uppercase tracking-wider">Expense</span>
          <h3 className="font-medium text-gray-100 mt-0.5">{expense.title}</h3>
        </div>
        <button
          onClick={() => removeExpense(expense.id).catch(alert)}
          className="text-gray-600 hover:text-red-400 transition-colors text-lg leading-none mt-0.5"
          title="Delete"
        >
          ×
        </button>
      </div>

      <div className="flex items-end justify-between">
        <div>
          <span className="text-xl font-bold text-red-400 tabular-nums">
            {formatCurrency(expense.spent)}
          </span>
          {expense.budget > 0 && (
            <span className="text-sm text-gray-500 ml-1">
              / {formatCurrency(expense.budget)}
            </span>
          )}
        </div>
        {pct > 0 && (
          <span className="text-xs text-gray-500">{pct}%</span>
        )}
      </div>

      {expense.budget > 0 && <ProgressBar value={pct} colorScheme="spend" />}

      {sourceName && (
        <span className="text-xs text-gray-600">
          from{' '}
          <span className="text-gray-400">{sourceName}</span>
          {' '}({expense.sourceType})
        </span>
      )}
    </EntityCard>
  )
}
