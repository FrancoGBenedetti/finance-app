import { useState } from 'react'
import EntityCard from '../EntityCard/EntityCard.jsx'
import ProgressBar from '../ProgressBar/ProgressBar.jsx'
import DetailModal from '../shared/DetailModal.jsx'
import {
  formatCurrencyCLP,
  computeProgressPercent,
  computeExpenseTotalFromEntries,
  isBudgetExceeded,
  isBudgetNearLimit,
} from '../../utils/financialRules.js'
import { useFinanceStore } from '../../store/useFinanceStore.js'
import { ENTITY_CONFIG } from '../../config/entityConfig.js'

export default function ExpenseCard({ expense }) {
  const transactions = useFinanceStore((s) => s.transactions)
  const [detailOpen, setDetailOpen] = useState(false)
  const cfg = ENTITY_CONFIG.expense

  const totalSpent = computeExpenseTotalFromEntries(transactions, expense.id)
  const pct        = computeProgressPercent(totalSpent, expense.budget)
  const exceeded   = isBudgetExceeded({ ...expense, totalSpent })
  const nearLimit  = isBudgetNearLimit({ ...expense, totalSpent })
  const txCount    = transactions.filter((t) => t.expenseId === expense.id).length

  return (
    <>
      <EntityCard onClick={() => setDetailOpen(true)}>
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${cfg.badgeClass}`}>
            {cfg.icon} {cfg.label}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-gray-100 leading-tight">{expense.title}</h3>

        {/* Amounts */}
        <div className="flex items-end justify-between">
          <div>
            <span className="text-2xl font-bold text-red-400 tabular-nums">
              {formatCurrencyCLP(totalSpent)}
            </span>
            {expense.budget > 0 && (
              <span className="text-sm text-gray-500 ml-1.5">
                / {formatCurrencyCLP(expense.budget)}
              </span>
            )}
          </div>
          {expense.budget > 0 && pct > 0 && (
            <span className={`text-xs font-medium ${exceeded ? 'text-red-400' : nearLimit ? 'text-yellow-400' : 'text-gray-500'}`}>
              {pct}%
            </span>
          )}
        </div>

        {/* Progress bar */}
        {expense.budget > 0 && <ProgressBar value={pct} colorScheme="spend" />}

        {/* Budget warnings */}
        {exceeded && (
          <p className="text-xs text-red-400">
            ⚠ Excedido por {formatCurrencyCLP(totalSpent - expense.budget)}
          </p>
        )}
        {!exceeded && nearLimit && (
          <p className="text-xs text-yellow-400">⚠ Cerca del límite</p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-1 border-t border-gray-800">
          <span className="text-xs text-gray-600">
            {txCount} {txCount === 1 ? 'transacción' : 'transacciones'}
          </span>
          <span className="text-xs text-gray-600">Ver detalle →</span>
        </div>
      </EntityCard>

      {detailOpen && (
        <DetailModal entity={expense} type="expense" onClose={() => setDetailOpen(false)} />
      )}
    </>
  )
}
