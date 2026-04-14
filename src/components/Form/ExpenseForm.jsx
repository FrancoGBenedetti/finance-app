import { useState } from 'react'
import { useTransactions } from '../../hooks/useTransactions.js'
import SourceSelector from './SourceSelector.jsx'

export default function ExpenseForm({ onClose }) {
  const { addExpense } = useTransactions()
  const [form, setForm] = useState({
    title: '',
    spent: '',
    budget: '',
    sourceId: '',
    sourceType: '',
  })
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await addExpense({
        title: form.title,
        spent: Number(form.spent),
        budget: Number(form.budget || 0),
        sourceId: form.sourceId,
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="block text-sm text-gray-400 mb-1">Title</label>
        <input
          type="text"
          value={form.title}
          onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
          placeholder="e.g. Groceries"
          className="bg-gray-800 border border-gray-700 text-gray-100 text-sm rounded-lg px-3 py-2 w-full focus:outline-none focus:border-emerald-500"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Amount Spent</label>
          <input
            type="number"
            value={form.spent}
            onChange={(e) => setForm((p) => ({ ...p, spent: e.target.value }))}
            placeholder="0"
            min="0"
            step="0.01"
            className="bg-gray-800 border border-gray-700 text-gray-100 text-sm rounded-lg px-3 py-2 w-full focus:outline-none focus:border-emerald-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Budget (optional)</label>
          <input
            type="number"
            value={form.budget}
            onChange={(e) => setForm((p) => ({ ...p, budget: e.target.value }))}
            placeholder="0"
            min="0"
            step="0.01"
            className="bg-gray-800 border border-gray-700 text-gray-100 text-sm rounded-lg px-3 py-2 w-full focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1">Source</label>
        <SourceSelector
          sourceId={form.sourceId}
          sourceType={form.sourceType}
          onChange={({ sourceId, sourceType }) =>
            setForm((p) => ({ ...p, sourceId, sourceType }))
          }
        />
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg px-4 py-2 transition-colors disabled:opacity-50"
      >
        {loading ? 'Adding…' : 'Add Expense'}
      </button>
    </form>
  )
}
