import { useState } from 'react'
import { useTransactions } from '../../hooks/useTransactions.js'

export default function IncomeForm({ onClose }) {
  const { addIncome } = useTransactions()
  const [form, setForm] = useState({ title: '', amount: '' })
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await addIncome({ title: form.title, amount: Number(form.amount) })
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
          placeholder="e.g. Salary"
          className="bg-gray-800 border border-gray-700 text-gray-100 text-sm rounded-lg px-3 py-2 w-full focus:outline-none focus:border-emerald-500"
          required
        />
      </div>
      <div>
        <label className="block text-sm text-gray-400 mb-1">Amount</label>
        <input
          type="number"
          value={form.amount}
          onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))}
          placeholder="0"
          min="0"
          step="0.01"
          className="bg-gray-800 border border-gray-700 text-gray-100 text-sm rounded-lg px-3 py-2 w-full focus:outline-none focus:border-emerald-500"
          required
        />
      </div>
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg px-4 py-2 transition-colors disabled:opacity-50"
      >
        {loading ? 'Adding…' : 'Add Income'}
      </button>
    </form>
  )
}
