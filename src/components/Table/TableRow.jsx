import { useState, useRef, useEffect } from 'react'
import { useTransactions } from '../../hooks/useTransactions.js'
import { useFinanceStore } from '../../store/useFinanceStore.js'
import { formatCurrency, computeSavingsTotal } from '../../utils/financialRules.js'
import SourceSelector from '../Form/SourceSelector.jsx'

const TYPE_BADGES = {
  income: 'bg-emerald-900 text-emerald-300',
  expense: 'bg-red-900 text-red-300',
  credit: 'bg-orange-900 text-orange-300',
  savings: 'bg-blue-900 text-blue-300',
}

export default function TableRow({ entity, type }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState({})
  const [error, setError] = useState(null)
  const rowRef = useRef(null)

  const incomes = useFinanceStore((s) => s.incomes)
  const credits = useFinanceStore((s) => s.credits)
  const { updateIncome, updateCredit, updateExpense, updateSavings, removeIncome, removeCredit, removeExpense, removeSavings } =
    useTransactions()

  function startEdit() {
    setDraft({
      title: entity.title,
      amount: entity.amount ?? '',
      limit: entity.limit ?? '',
      spent: entity.spent ?? '',
      budget: entity.budget ?? '',
      sourceId: entity.sourceId ?? '',
      sourceType: entity.sourceType ?? '',
      linkedIncomeIds: entity.linkedIncomeIds ?? [],
    })
    setEditing(true)
    setError(null)
  }

  async function saveEdit() {
    setError(null)
    try {
      if (type === 'income') {
        await updateIncome(entity.id, { title: draft.title, amount: Number(draft.amount) })
      } else if (type === 'credit') {
        await updateCredit(entity.id, { title: draft.title, limit: Number(draft.limit) })
      } else if (type === 'expense') {
        await updateExpense(entity.id, {
          title: draft.title,
          spent: Number(draft.spent),
          budget: Number(draft.budget),
        })
      } else if (type === 'savings') {
        await updateSavings(entity.id, {
          title: draft.title,
          linkedIncomeIds: draft.linkedIncomeIds,
        })
      }
      setEditing(false)
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleDelete() {
    try {
      if (type === 'income') await removeIncome(entity.id)
      else if (type === 'credit') await removeCredit(entity.id)
      else if (type === 'expense') await removeExpense(entity.id)
      else if (type === 'savings') await removeSavings(entity.id)
    } catch (err) {
      alert(err.message)
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') saveEdit()
    if (e.key === 'Escape') setEditing(false)
  }

  // Click outside to cancel
  useEffect(() => {
    if (!editing) return
    function handleClickOutside(e) {
      if (rowRef.current && !rowRef.current.contains(e.target)) {
        setEditing(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [editing])

  // ─── Computed display values ──────────────────────────────────────────────
  const amount =
    type === 'income' ? formatCurrency(entity.amount)
    : type === 'credit' ? formatCurrency(entity.available)
    : type === 'expense' ? formatCurrency(entity.spent)
    : formatCurrency(computeSavingsTotal(entity, incomes))

  const budget =
    type === 'expense' ? formatCurrency(entity.budget)
    : type === 'credit' ? formatCurrency(entity.limit)
    : '—'

  const info =
    type === 'expense'
      ? (() => {
          const src = entity.sourceType === 'income'
            ? incomes.find((i) => i.id === entity.sourceId)
            : credits.find((c) => c.id === entity.sourceId)
          return src ? `${src.title} (${entity.sourceType})` : '—'
        })()
      : type === 'credit'
      ? `Used: ${formatCurrency(entity.used)}`
      : type === 'savings'
      ? `${(entity.linkedIncomeIds ?? []).length} linked`
      : '—'

  const inputCls =
    'bg-gray-800 border border-gray-600 text-gray-100 text-sm rounded px-2 py-1 w-full focus:outline-none focus:border-emerald-500'

  return (
    <tr
      ref={rowRef}
      className={`border-t border-gray-800 group ${editing ? 'bg-gray-900' : 'hover:bg-gray-900/50'}`}
    >
      {/* Type badge */}
      <td className="px-4 py-2 w-24">
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_BADGES[type]}`}>
          {type}
        </span>
      </td>

      {/* Title */}
      <td className="px-4 py-2" onClick={!editing ? startEdit : undefined}>
        {editing ? (
          <input
            autoFocus
            value={draft.title}
            onChange={(e) => setDraft((p) => ({ ...p, title: e.target.value }))}
            onKeyDown={handleKeyDown}
            className={inputCls}
          />
        ) : (
          <span className="text-gray-200 cursor-pointer">{entity.title}</span>
        )}
      </td>

      {/* Info */}
      <td className="px-4 py-2 text-sm text-gray-500">{info}</td>

      {/* Amount / main value */}
      <td className="px-4 py-2" onClick={!editing ? startEdit : undefined}>
        {editing ? (
          <div className="flex flex-col gap-1">
            {type === 'income' && (
              <input
                type="number"
                value={draft.amount}
                onChange={(e) => setDraft((p) => ({ ...p, amount: e.target.value }))}
                onKeyDown={handleKeyDown}
                className={inputCls}
                min="0"
                step="0.01"
              />
            )}
            {type === 'credit' && (
              <input
                type="number"
                value={draft.limit}
                onChange={(e) => setDraft((p) => ({ ...p, limit: e.target.value }))}
                onKeyDown={handleKeyDown}
                className={inputCls}
                min="0"
                step="0.01"
              />
            )}
            {type === 'expense' && (
              <input
                type="number"
                value={draft.spent}
                onChange={(e) => setDraft((p) => ({ ...p, spent: e.target.value }))}
                onKeyDown={handleKeyDown}
                className={inputCls}
                min="0"
                step="0.01"
              />
            )}
            {type === 'savings' && (
              <span className="text-sm text-gray-400 italic">auto-calculated</span>
            )}
          </div>
        ) : (
          <span className="text-gray-200 tabular-nums cursor-pointer">{amount}</span>
        )}
      </td>

      {/* Budget / limit */}
      <td className="px-4 py-2" onClick={!editing ? startEdit : undefined}>
        {editing && type === 'expense' ? (
          <input
            type="number"
            value={draft.budget}
            onChange={(e) => setDraft((p) => ({ ...p, budget: e.target.value }))}
            onKeyDown={handleKeyDown}
            className={inputCls}
            min="0"
            step="0.01"
          />
        ) : (
          <span className="text-gray-500 tabular-nums cursor-pointer">{budget}</span>
        )}
      </td>

      {/* Actions */}
      <td className="px-4 py-2 w-24">
        {editing ? (
          <div className="flex items-center gap-2">
            <button
              onClick={saveEdit}
              className="text-xs bg-emerald-700 hover:bg-emerald-600 text-white rounded px-2 py-1 transition-colors"
            >
              Save
            </button>
            <button
              onClick={() => setEditing(false)}
              className="text-xs text-gray-500 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
        ) : (
          <button
            onClick={handleDelete}
            className="text-gray-700 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
            title="Delete"
          >
            ×
          </button>
        )}
      </td>

      {/* Inline error */}
      {error && (
        <td colSpan={6} className="px-4 pb-2">
          <span className="text-red-400 text-xs">{error}</span>
        </td>
      )}
    </tr>
  )
}
