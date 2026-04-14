import { useState } from 'react'
import EntityCard from '../EntityCard/EntityCard.jsx'
import ProgressBar from '../ProgressBar/ProgressBar.jsx'
import EntityModal from '../shared/EntityModal.jsx'
import AddTransactionModal from '../Form/AddTransactionModal.jsx'
import {
  formatCurrencyCLP,
  computeProgressPercent,
  isBudgetExceeded,
  isBudgetNearLimit,
} from '../../utils/financialRules.js'
import { useTransactions } from '../../hooks/useTransactions.js'
import { useFinanceStore } from '../../store/useFinanceStore.js'
import { ENTITY_CONFIG } from '../../config/entityConfig.js'

export default function ExpenseCard({ expense }) {
  const { removeExpense } = useTransactions()
  const txCount = useFinanceStore((s) =>
    s.transactions.filter((t) => t.expenseId === expense.id).length
  )
  const [editOpen, setEditOpen] = useState(false)
  const [addTxOpen, setAddTxOpen] = useState(false)
  const cfg = ENTITY_CONFIG.expense

  const pct      = computeProgressPercent(expense.totalSpent, expense.budget)
  const exceeded = isBudgetExceeded(expense)
  const nearLimit = isBudgetNearLimit(expense)

  return (
    <>
      <EntityCard>
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${cfg.badgeClass}`}>
            {cfg.icon} {cfg.label}
          </span>
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => setEditOpen(true)}
              className="text-gray-600 hover:text-gray-300 transition-colors p-1 rounded-lg hover:bg-gray-800"
              title="Editar"
            >
              ✏
            </button>
            <button
              onClick={() => removeExpense(expense.id).catch(alert)}
              className="text-gray-600 hover:text-red-400 transition-colors p-1 rounded-lg hover:bg-gray-800"
              title="Eliminar"
            >
              ×
            </button>
          </div>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-gray-100 leading-tight">{expense.title}</h3>

        {/* Amounts */}
        <div className="flex items-end justify-between">
          <div>
            <span className="text-2xl font-bold text-red-400 tabular-nums">
              {formatCurrencyCLP(expense.totalSpent ?? 0)}
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
            ⚠ Excedido por {formatCurrencyCLP((expense.totalSpent ?? 0) - expense.budget)}
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
          <button
            onClick={() => setAddTxOpen(true)}
            className="text-xs bg-gray-800 hover:bg-emerald-700 text-gray-400 hover:text-white border border-gray-700 hover:border-emerald-600 rounded-lg px-3 py-1 transition-colors"
          >
            + Agregar
          </button>
        </div>
      </EntityCard>

      {editOpen && (
        <EntityModal
          type="expense"
          entity={expense}
          onClose={() => setEditOpen(false)}
        />
      )}
      {addTxOpen && (
        <AddTransactionModal
          expense={expense}
          onClose={() => setAddTxOpen(false)}
        />
      )}
    </>
  )
}
