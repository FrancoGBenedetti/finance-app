import { useState, useEffect } from 'react'
import { useTransactions } from '../../hooks/useTransactions.js'
import { useFinanceStore } from '../../store/useFinanceStore.js'
import SourceSelector from './SourceSelector.jsx'
import {
  formatCurrencyCLP,
  computeProgressPercent,
  computeExpenseTotalFromEntries,
  isBudgetExceeded,
  isBudgetNearLimit,
} from '../../utils/financialRules.js'

/**
 * AddTransactionModal
 * Se abre al hacer click en "+ Agregar" de un gasto (desde card o tabla).
 * Crea una Transaction vinculada al expense y descuenta de la fuente elegida.
 */
export default function AddTransactionModal({ expense, onClose }) {
  const { addTransaction } = useTransactions()
  const transactions = useFinanceStore((s) => s.transactions)
  const [form, setForm] = useState({ amount: '', sourceId: '', sourceType: '' })
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fn = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [onClose])

  const totalSpent = computeExpenseTotalFromEntries(transactions, expense.id)
  const pct        = computeProgressPercent(totalSpent, expense.budget)
  const nearLimit  = isBudgetNearLimit({ ...expense, totalSpent })
  const exceeded   = isBudgetExceeded({ ...expense, totalSpent })

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await addTransaction({
        expenseId:  expense.id,
        amount:     Number(form.amount),
        sourceId:   form.sourceId,
        sourceType: form.sourceType,
      })
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-gray-900 border border-gray-700/80 rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <h2 className="text-base font-semibold text-white">Agregar monto</h2>
            <p className="text-sm text-gray-400 mt-0.5">{expense.title}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white transition-colors text-xl leading-none p-1"
          >
            ×
          </button>
        </div>

        {/* Estado actual del gasto */}
        <div className="bg-gray-800/60 rounded-xl p-3 mb-5 flex flex-col gap-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Acumulado</span>
            <span className="text-white tabular-nums font-medium">
              {formatCurrencyCLP(totalSpent)}
              {expense.budget > 0 && (
                <span className="text-gray-500 font-normal">
                  {' '}/{' '}{formatCurrencyCLP(expense.budget)}
                </span>
              )}
            </span>
          </div>
          {expense.budget > 0 && (
            <>
              <div className="w-full bg-gray-700 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    exceeded ? 'bg-red-500' : nearLimit ? 'bg-yellow-400' : 'bg-green-500'
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              {exceeded && (
                <p className="text-xs text-red-400">
                  ⚠ Excedido por {formatCurrencyCLP(totalSpent - expense.budget)}
                </p>
              )}
              {!exceeded && nearLimit && (
                <p className="text-xs text-yellow-400">⚠ Cerca del límite ({pct}%)</p>
              )}
            </>
          )}
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Monto</label>
            <input
              type="number"
              value={form.amount}
              onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))}
              placeholder="0"
              min="1"
              step="1"
              autoFocus
              className="bg-gray-800 border border-gray-700 text-gray-100 text-sm rounded-lg px-3 py-2 w-full focus:outline-none focus:border-emerald-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Fuente</label>
            <SourceSelector
              sourceId={form.sourceId}
              sourceType={form.sourceType}
              onChange={({ sourceId, sourceType }) =>
                setForm((p) => ({ ...p, sourceId, sourceType }))
              }
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm bg-red-950/50 border border-red-900 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-lg px-4 py-2.5 transition-colors disabled:opacity-50"
          >
            {loading ? 'Procesando…' : 'Confirmar'}
          </button>
        </form>
      </div>
    </div>
  )
}
