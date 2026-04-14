import { useState } from 'react'
import { useTransactions } from '../../hooks/useTransactions.js'
import { useFinanceStore }  from '../../store/useFinanceStore.js'
import {
  formatCurrencyCLP,
  computePortfolioTotal,
  computeProgressPercent,
  progressColor,
} from '../../utils/financialRules.js'
import { ENTITY_CONFIG } from '../../config/entityConfig.js'
import AddTransactionModal from '../Form/AddTransactionModal.jsx'

export default function TableRow({ entity, type, onEdit }) {
  const [showAddTx, setShowAddTx] = useState(false)

  const incomes = useFinanceStore((s) => s.incomes)
  const txCount = useFinanceStore((s) =>
    type === 'expense'
      ? s.transactions.filter((t) => t.expenseId === entity.id).length
      : 0
  )

  const {
    removeIncome, removeCredit, removeExpense,
    removePortfolio, removeSavings,
  } = useTransactions()

  const cfg = ENTITY_CONFIG[type]

  async function handleDelete(e) {
    e.stopPropagation()
    try {
      if (type === 'income')    await removeIncome(entity.id)
      if (type === 'credit')    await removeCredit(entity.id)
      if (type === 'expense')   await removeExpense(entity.id)
      if (type === 'portfolio') await removePortfolio(entity.id)
      if (type === 'savings')   await removeSavings(entity.id)
    } catch (err) {
      alert(err.message)
    }
  }

  // ── Valores de display ────────────────────────────────────────────────────
  const displayAmount =
    type === 'income'    ? formatCurrencyCLP(entity.amount)
    : type === 'credit'    ? formatCurrencyCLP(entity.available)
    : type === 'expense'   ? formatCurrencyCLP(entity.totalSpent ?? 0)
    : type === 'portfolio' ? formatCurrencyCLP(computePortfolioTotal(entity, incomes))
    : /* savings */          formatCurrencyCLP(entity.amount ?? 0)

  // Para ingresos: consumido = initialAmount - amount
  const incomeInitial  = type === 'income' ? (entity.initialAmount ?? entity.amount ?? 0) : 0
  const incomeConsumed = type === 'income' ? Math.max(0, incomeInitial - (entity.amount ?? 0)) : 0
  const incomeConsumedPct = incomeInitial > 0
    ? Math.min(100, Math.round((incomeConsumed / incomeInitial) * 100))
    : 0

  const displayBudget =
    type === 'expense' ? formatCurrencyCLP(entity.budget ?? 0)
    : type === 'credit'  ? formatCurrencyCLP(entity.limit)
    : type === 'income'  ? formatCurrencyCLP(incomeInitial)   // columna reutilizada como "Inicial"
    : '—'

  const displayInfo =
    type === 'income'    ? (incomeConsumed > 0
                              ? `Gastado ${formatCurrencyCLP(incomeConsumed)}`
                              : 'Sin uso aún')
    : type === 'credit'    ? `Usado: ${formatCurrencyCLP(entity.used)}`
    : type === 'expense'   ? `${txCount} transacción${txCount !== 1 ? 'es' : ''}`
    : type === 'portfolio' ? `${(entity.linkedIncomeIds ?? []).length} ingresos vinculados`
    : '—'

  const expensePct = type === 'expense'
    ? computeProgressPercent(entity.totalSpent, entity.budget)
    : 0

  return (
    <>
      <tr
        className="border-t border-gray-800 group hover:bg-gray-900/60 cursor-pointer transition-colors"
        onClick={onEdit}
      >
        {/* Tipo */}
        <td className="px-4 py-3 w-32">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${cfg.badgeClass}`}>
            {cfg.icon} {cfg.label}
          </span>
        </td>

        {/* Título */}
        <td className="px-4 py-3">
          <span className="text-gray-200">{entity.title}</span>
        </td>

        {/* Info */}
        <td className="px-4 py-3 text-sm text-gray-500 hidden sm:table-cell">
          {displayInfo}
        </td>

        {/* Cantidad */}
        <td className="px-4 py-3 text-right">
          <div className="flex flex-col items-end gap-1">
            <span className="text-gray-200 tabular-nums font-medium">{displayAmount}</span>
            {type === 'expense' && entity.budget > 0 && (
              <div className="w-16 bg-gray-700 rounded-full h-1 overflow-hidden">
                <div
                  className={`h-1 rounded-full ${progressColor(expensePct)}`}
                  style={{ width: `${expensePct}%` }}
                />
              </div>
            )}
          </div>
        </td>

        {/* Presupuesto */}
        <td className="px-4 py-3 text-right text-gray-500 tabular-nums hidden md:table-cell">
          {displayBudget}
        </td>

        {/* Acciones */}
        <td className="px-4 py-3 w-28" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {type === 'expense' && (
              <button
                onClick={(e) => { e.stopPropagation(); setShowAddTx(true) }}
                className="text-xs bg-gray-800 hover:bg-emerald-700 text-gray-400 hover:text-white border border-gray-700 hover:border-emerald-600 rounded px-2 py-1 transition-colors"
                title="Agregar monto"
              >
                + Add
              </button>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); onEdit() }}
              className="text-gray-600 hover:text-gray-300 transition-colors p-1 rounded hover:bg-gray-800"
              title="Editar"
            >
              ✏
            </button>
            <button
              onClick={handleDelete}
              className="text-gray-600 hover:text-red-400 transition-colors p-1 rounded hover:bg-gray-800"
              title="Eliminar"
            >
              ×
            </button>
          </div>
        </td>
      </tr>

      {showAddTx && (
        <AddTransactionModal
          expense={entity}
          onClose={() => setShowAddTx(false)}
        />
      )}
    </>
  )
}
