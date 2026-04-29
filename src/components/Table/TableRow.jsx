import { useFinanceStore } from '../../store/useFinanceStore.js'
import {
  formatCurrencyCLP,
  computePortfolioTotal,
  computeProgressPercent,
  computeExpenseTotalFromEntries,
  progressColor,
} from '../../utils/financialRules.js'
import { ENTITY_CONFIG } from '../../config/entityConfig.js'

export default function TableRow({ entity, type, onDetail }) {
  const incomes      = useFinanceStore((s) => s.incomes)
  const expenses     = useFinanceStore((s) => s.expenses)
  const credits      = useFinanceStore((s) => s.credits)
  const savings      = useFinanceStore((s) => s.savings)
  const transactions = useFinanceStore((s) => s.transactions)

  const cfg = ENTITY_CONFIG[type]

  // ── Computed values ────────────────────────────────────────────────────────
  const totalSpent = type === 'expense'
    ? computeExpenseTotalFromEntries(transactions, entity.id)
    : 0

  const txCount = type === 'expense'
    ? transactions.filter((t) => t.expenseId === entity.id).length
    : 0

  const incomeInitial   = type === 'income' ? (entity.initialAmount ?? entity.amount ?? 0) : 0
  const incomeConsumed  = type === 'income' ? Math.max(0, incomeInitial - (entity.amount ?? 0)) : 0

  const portfolioTotal = type === 'portfolio'
    ? computePortfolioTotal(entity, incomes, { expenses, credits, savings, transactions })
    : 0

  const debitInitial  = type === 'debito' ? (entity.initialAmount ?? entity.amount ?? 0) : 0
  const debitConsumed = type === 'debito' ? Math.max(0, debitInitial - (entity.amount ?? 0)) : 0

  const displayAmount =
    type === 'income'    ? formatCurrencyCLP(entity.amount)
    : type === 'debito'    ? formatCurrencyCLP(entity.amount ?? 0)
    : type === 'credit'    ? formatCurrencyCLP(entity.available)
    : type === 'expense'   ? formatCurrencyCLP(totalSpent)
    : type === 'portfolio' ? formatCurrencyCLP(portfolioTotal)
    : /* savings */          formatCurrencyCLP(entity.amount ?? 0)

  const displayBudget =
    type === 'expense' ? formatCurrencyCLP(entity.budget ?? 0)
    : type === 'credit'  ? formatCurrencyCLP(entity.limit)
    : type === 'income'  ? formatCurrencyCLP(incomeInitial)
    : type === 'debito'  ? formatCurrencyCLP(debitInitial)
    : '—'

  const displayInfo =
    type === 'income'    ? (incomeConsumed > 0 ? `Gastado ${formatCurrencyCLP(incomeConsumed)}` : 'Sin uso aún')
    : type === 'debito'    ? (debitConsumed > 0 ? `Usado ${formatCurrencyCLP(debitConsumed)}` : 'Sin uso aún')
    : type === 'credit'    ? `Usado: ${formatCurrencyCLP(entity.used)}`
    : type === 'expense'   ? `${txCount} transacción${txCount !== 1 ? 'es' : ''}`
    : type === 'portfolio' ? `${(entity.linkedEntities ?? entity.linkedIncomeIds ?? []).length} entidades vinculadas`
    : '—'

  const expensePct = type === 'expense'
    ? computeProgressPercent(totalSpent, entity.budget)
    : 0

  return (
    <tr
      className="border-t border-gray-800 group hover:bg-gray-900/60 cursor-pointer transition-colors"
      onClick={onDetail}
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
      <td className="px-4 py-3 text-right text-gray-500 tabular-nums">
        {displayBudget}
      </td>

      {/* Acciones */}
      <td className="px-4 py-3 w-28" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-end gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => { e.stopPropagation(); onDetail() }}
            className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white border border-gray-700 rounded px-2 py-1 transition-colors"
            title="Ver detalle"
          >
            Ver
          </button>
        </div>
      </td>
    </tr>
  )
}
