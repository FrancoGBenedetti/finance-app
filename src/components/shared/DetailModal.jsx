import { useState, useEffect } from 'react'
import { useTransactions } from '../../hooks/useTransactions.js'
import { useFinanceStore } from '../../store/useFinanceStore.js'
import {
  formatCurrencyCLP,
  computeProgressPercent,
  computeCreditProgressPercent,
  computePortfolioTotal,
  computeExpenseTotalFromEntries,
  isBudgetExceeded,
  isBudgetNearLimit,
} from '../../utils/financialRules.js'
import { ENTITY_CONFIG } from '../../config/entityConfig.js'
import SourceSelector from '../Form/SourceSelector.jsx'
import EntityModal from './EntityModal.jsx'

function toMs(ts) {
  if (!ts) return 0
  if (typeof ts.toMillis === 'function') return ts.toMillis()
  if (ts.seconds != null) return ts.seconds * 1000
  return new Date(ts).getTime()
}

function formatDate(ts) {
  const ms = toMs(ts)
  if (!ms) return '—'
  return new Intl.DateTimeFormat('es-CL', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(ms))
}

export default function DetailModal({ entity, type, onClose }) {
  const cfg = ENTITY_CONFIG[type]
  const allTx       = useFinanceStore((s) => s.transactions)
  const incomes     = useFinanceStore((s) => s.incomes)
  const credits     = useFinanceStore((s) => s.credits)
  const expenses    = useFinanceStore((s) => s.expenses)
  const savings     = useFinanceStore((s) => s.savings)
  const {
    addTransaction,
    removeIncome, removeCredit, removeExpense, removePortfolio, removeSavings,
  } = useTransactions()

  const [showEdit, setShowEdit]       = useState(false)
  const [addForm, setAddForm]         = useState({ amount: '', sourceId: '', sourceType: '' })
  const [addError, setAddError]       = useState(null)
  const [addLoading, setAddLoading]   = useState(false)

  useEffect(() => {
    const fn = (e) => { if (e.key === 'Escape' && !showEdit) onClose() }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [onClose, showEdit])

  // ── History ────────────────────────────────────────────────────────────────
  const history = (() => {
    let txs = []
    if (type === 'expense') txs = allTx.filter((t) => t.expenseId === entity.id)
    else if (type === 'income') txs = allTx.filter((t) => t.sourceType === 'income' && t.sourceId === entity.id)
    else if (type === 'credit') txs = allTx.filter((t) => t.sourceType === 'credit' && t.sourceId === entity.id)
    return [...txs].sort((a, b) => toMs(b.createdAt) - toMs(a.createdAt))
  })()

  // ── Computed values ────────────────────────────────────────────────────────
  const totalSpent    = computeExpenseTotalFromEntries(allTx, entity.id)
  const portfolioTotal = type === 'portfolio'
    ? computePortfolioTotal(entity, incomes, { expenses, credits, savings, transactions: allTx })
    : 0

  const expensePct = type === 'expense' ? computeProgressPercent(totalSpent, entity.budget) : 0
  const exceeded   = type === 'expense' ? isBudgetExceeded({ ...entity, totalSpent }) : false
  const nearLimit  = type === 'expense' ? isBudgetNearLimit({ ...entity, totalSpent }) : false
  const creditPct  = type === 'credit' ? computeCreditProgressPercent(entity.used, entity.limit) : 0

  // ── Helpers ────────────────────────────────────────────────────────────────
  function getSourceName(tx) {
    const src = tx.sourceType === 'income'
      ? incomes.find((i) => i.id === tx.sourceId)
      : credits.find((c) => c.id === tx.sourceId)
    return src?.title ?? '—'
  }

  function getExpenseName(expenseId) {
    return expenses.find((e) => e.id === expenseId)?.title ?? '—'
  }

  async function handleDelete() {
    if (!window.confirm(`¿Eliminar "${entity.title}"?`)) return
    try {
      if (type === 'income')    await removeIncome(entity.id)
      if (type === 'credit')    await removeCredit(entity.id)
      if (type === 'expense')   await removeExpense(entity.id)
      if (type === 'portfolio') await removePortfolio(entity.id)
      if (type === 'savings')   await removeSavings(entity.id)
      onClose()
    } catch (err) { alert(err.message) }
  }

  async function handleAddTx(e) {
    e.preventDefault()
    setAddLoading(true)
    setAddError(null)
    try {
      await addTransaction({
        expenseId:  entity.id,
        amount:     Number(addForm.amount),
        sourceId:   addForm.sourceId,
        sourceType: addForm.sourceType,
      })
      setAddForm({ amount: '', sourceId: '', sourceType: '' })
    } catch (err) {
      setAddError(err.message)
    } finally {
      setAddLoading(false)
    }
  }

  // ── Linked entities for portfolio ──────────────────────────────────────────
  const linkedEntities = entity.linkedEntities
    ?? (entity.linkedIncomeIds ?? []).map((id) => ({ id, type: 'income' }))

  function getLinkedEntityInfo({ id, type: eType }) {
    const eCfg = ENTITY_CONFIG[eType]
    let name = '?', val = 0
    if (eType === 'income')  { const e = incomes.find((i) => i.id === id); name = e?.title ?? id; val = e?.amount ?? 0 }
    if (eType === 'expense') { const e = expenses.find((exp) => exp.id === id); name = e?.title ?? id; val = computeExpenseTotalFromEntries(allTx, id) }
    if (eType === 'credit')  { const e = credits.find((c) => c.id === id); name = e?.title ?? id; val = e?.available ?? 0 }
    if (eType === 'savings') { const e = savings.find((s) => s.id === id); name = e?.title ?? id; val = e?.amount ?? 0 }
    return { icon: eCfg?.icon ?? '•', name, val }
  }

  const inputCls = 'bg-gray-800 border border-gray-700 text-gray-100 text-sm rounded-lg px-3 py-2 w-full focus:outline-none focus:border-emerald-500 transition-colors'

  const showHistory = type === 'expense' || type === 'income' || type === 'credit'

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <div className="bg-gray-900 border border-gray-700/80 rounded-2xl shadow-2xl w-full max-w-md mx-4 max-h-[90vh] flex flex-col">

          {/* Header */}
          <div className="flex items-center gap-3 p-5 border-b border-gray-800 shrink-0">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${cfg.badgeClass}`}>
              {cfg.icon} {cfg.label}
            </span>
            <h2 className="flex-1 font-semibold text-white text-base truncate">{entity.title}</h2>
            <div className="flex items-center gap-0.5 shrink-0">
              <button
                onClick={() => setShowEdit(true)}
                className="text-gray-500 hover:text-gray-200 p-1.5 rounded-lg hover:bg-gray-800 transition-colors"
                title="Editar"
              >✏</button>
              <button
                onClick={handleDelete}
                className="text-gray-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-gray-800 transition-colors"
                title="Eliminar"
              >×</button>
              <div className="w-px h-4 bg-gray-700 mx-1" />
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-white transition-colors text-xl leading-none p-1"
              >×</button>
            </div>
          </div>

          {/* Scrollable body */}
          <div className="overflow-y-auto flex-1 p-5 flex flex-col gap-5">

            {/* ── Income stats ─────────────────────────────────────────────── */}
            {type === 'income' && (() => {
              const initial   = entity.initialAmount ?? entity.amount ?? 0
              const remaining = entity.amount ?? 0
              const consumed  = Math.max(0, initial - remaining)
              const pct       = initial > 0 ? Math.min(100, Math.round((consumed / initial) * 100)) : 0
              const barColor  = pct < 40 ? 'bg-emerald-500' : pct < 70 ? 'bg-yellow-400' : 'bg-red-500'
              return (
                <div className="bg-gray-800/50 rounded-xl p-4 flex flex-col gap-3">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">Disponible</p>
                      <span className="text-2xl font-bold text-emerald-400 tabular-nums">
                        {formatCurrencyCLP(remaining)}
                      </span>
                    </div>
                    {initial > 0 && (
                      <div className="text-right">
                        <p className="text-xs text-gray-500 mb-0.5">Inicial</p>
                        <span className="text-base font-medium text-gray-400 tabular-nums">
                          {formatCurrencyCLP(initial)}
                        </span>
                      </div>
                    )}
                  </div>
                  {initial > 0 && (
                    <div className="flex flex-col gap-1">
                      <div className="w-full bg-gray-700 rounded-full h-1.5 overflow-hidden">
                        <div className={`h-1.5 rounded-full ${barColor}`} style={{ width: `${pct}%` }} />
                      </div>
                      <div className="flex justify-between text-xs text-gray-600">
                        <span>{consumed > 0 ? `Gastado ${formatCurrencyCLP(consumed)}` : 'Sin uso aún'}</span>
                        <span>{pct}%</span>
                      </div>
                    </div>
                  )}
                </div>
              )
            })()}

            {/* ── Expense stats ─────────────────────────────────────────────── */}
            {type === 'expense' && (
              <>
                <div className="bg-gray-800/50 rounded-xl p-4 flex flex-col gap-3">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">Total gastado</p>
                      <span className={`text-2xl font-bold tabular-nums ${exceeded ? 'text-red-400' : 'text-red-400'}`}>
                        {formatCurrencyCLP(totalSpent)}
                      </span>
                    </div>
                    {entity.budget > 0 && (
                      <div className="text-right">
                        <p className="text-xs text-gray-500 mb-0.5">Presupuesto</p>
                        <span className="text-base font-medium text-gray-400 tabular-nums">
                          {formatCurrencyCLP(entity.budget)}
                        </span>
                      </div>
                    )}
                  </div>
                  {entity.budget > 0 && (
                    <>
                      <div className="w-full bg-gray-700 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-1.5 rounded-full ${exceeded ? 'bg-red-500' : nearLimit ? 'bg-yellow-400' : 'bg-green-500'}`}
                          style={{ width: `${expensePct}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-600">
                        <span>
                          {exceeded
                            ? `⚠ Excedido por ${formatCurrencyCLP(totalSpent - entity.budget)}`
                            : nearLimit ? '⚠ Cerca del límite' : ''}
                        </span>
                        <span>{expensePct}%</span>
                      </div>
                    </>
                  )}
                </div>

                {/* Add amount form */}
                <div>
                  <h3 className="text-sm font-medium text-gray-300 mb-3">Agregar monto</h3>
                  <form onSubmit={handleAddTx} className="flex flex-col gap-3">
                    <input
                      type="number"
                      value={addForm.amount}
                      onChange={(e) => setAddForm((p) => ({ ...p, amount: e.target.value }))}
                      placeholder="Monto"
                      min="1"
                      step="1"
                      className={inputCls}
                      required
                    />
                    <SourceSelector
                      sourceId={addForm.sourceId}
                      sourceType={addForm.sourceType}
                      onChange={({ sourceId, sourceType }) =>
                        setAddForm((p) => ({ ...p, sourceId, sourceType }))
                      }
                    />
                    {addError && (
                      <p className="text-red-400 text-xs bg-red-950/50 border border-red-900 rounded-lg px-3 py-2">
                        {addError}
                      </p>
                    )}
                    <button
                      type="submit"
                      disabled={addLoading}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-lg px-4 py-2.5 transition-colors disabled:opacity-50"
                    >
                      {addLoading ? '…' : 'Confirmar'}
                    </button>
                  </form>
                </div>
              </>
            )}

            {/* ── Credit stats ─────────────────────────────────────────────── */}
            {type === 'credit' && (
              <div className="bg-gray-800/50 rounded-xl p-4 flex flex-col gap-3">
                {[
                  { label: 'Usado',      value: entity.used      ?? 0, color: 'text-orange-400' },
                  { label: 'Disponible', value: entity.available ?? 0, color: 'text-emerald-400' },
                  { label: 'Límite',     value: entity.limit     ?? 0, color: 'text-gray-200'   },
                ].map(({ label, value, color }) => (
                  <div key={label} className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 uppercase tracking-wider">{label}</span>
                    <span className={`text-base font-bold tabular-nums ${color}`}>
                      {formatCurrencyCLP(value)}
                    </span>
                  </div>
                ))}
                <div className="w-full bg-gray-700 rounded-full h-1.5 overflow-hidden mt-1">
                  <div
                    className={`h-1.5 rounded-full ${creditPct < 60 ? 'bg-green-500' : creditPct < 85 ? 'bg-yellow-400' : 'bg-red-500'}`}
                    style={{ width: `${creditPct}%` }}
                  />
                </div>
                <p className="text-xs text-gray-600 text-right">{creditPct}% usado</p>
              </div>
            )}

            {/* ── Savings stats ─────────────────────────────────────────────── */}
            {type === 'savings' && (
              <div className="bg-gray-800/50 rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-0.5">Monto ahorrado</p>
                <span className="text-2xl font-bold text-blue-400 tabular-nums">
                  {formatCurrencyCLP(entity.amount ?? 0)}
                </span>
              </div>
            )}

            {/* ── Portfolio stats ───────────────────────────────────────────── */}
            {type === 'portfolio' && (
              <div className="bg-gray-800/50 rounded-xl p-4 flex flex-col gap-3">
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Total</p>
                  <span className="text-2xl font-bold text-purple-400 tabular-nums">
                    {formatCurrencyCLP(portfolioTotal)}
                  </span>
                </div>
                {linkedEntities.length > 0 ? (
                  <div className="flex flex-col gap-1.5 pt-3 border-t border-gray-700">
                    {linkedEntities.map(({ id, type: eType }) => {
                      const { icon, name, val } = getLinkedEntityInfo({ id, type: eType })
                      return (
                        <div key={`${eType}-${id}`} className="flex justify-between text-xs">
                          <span className="text-gray-400">{icon} {name}</span>
                          <span className="text-gray-500 tabular-nums">{formatCurrencyCLP(val)}</span>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-gray-600 italic pt-3 border-t border-gray-700">
                    Sin entidades vinculadas
                  </p>
                )}
              </div>
            )}

            {/* ── History ──────────────────────────────────────────────────── */}
            {showHistory && (
              <div>
                <h3 className="text-sm font-medium text-gray-300 mb-3">
                  Historial {history.length > 0 ? `(${history.length})` : ''}
                </h3>
                {history.length === 0 ? (
                  <p className="text-xs text-gray-600 italic">Sin movimientos aún.</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {history.map((tx) => (
                      <div
                        key={tx.id}
                        className="flex justify-between items-start bg-gray-800/40 rounded-lg px-3 py-2.5"
                      >
                        <div>
                          <p className="text-sm text-gray-200 font-medium tabular-nums">
                            {type === 'expense' ? '−' : '−'}
                            {formatCurrencyCLP(tx.amount)}
                          </p>
                          <p className="text-xs text-gray-600 mt-0.5">
                            {type === 'expense' ? getSourceName(tx) : getExpenseName(tx.expenseId)}
                          </p>
                        </div>
                        <p className="text-xs text-gray-600 text-right shrink-0 ml-3 mt-0.5">
                          {formatDate(tx.createdAt)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>

      {showEdit && (
        <EntityModal type={type} entity={entity} onClose={() => setShowEdit(false)} />
      )}
    </>
  )
}
