import { useState } from 'react'
import { useTransactions } from '../../hooks/useTransactions.js'
import { useFinanceStore } from '../../store/useFinanceStore.js'
import { formatCurrency } from '../../utils/financialRules.js'

export default function SavingsForm({ onClose }) {
  const { addSavings } = useTransactions()
  const incomes = useFinanceStore((s) => s.incomes)
  const [form, setForm] = useState({ title: '', linkedIncomeIds: [] })
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  function toggleIncome(id) {
    setForm((p) => ({
      ...p,
      linkedIncomeIds: p.linkedIncomeIds.includes(id)
        ? p.linkedIncomeIds.filter((x) => x !== id)
        : [...p.linkedIncomeIds, id],
    }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await addSavings({ title: form.title, linkedIncomeIds: form.linkedIncomeIds })
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
          placeholder="e.g. Emergency Fund"
          className="bg-gray-800 border border-gray-700 text-gray-100 text-sm rounded-lg px-3 py-2 w-full focus:outline-none focus:border-emerald-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-2">
          Link Incomes (savings = sum of linked income amounts)
        </label>
        {incomes.length === 0 ? (
          <p className="text-gray-600 text-sm italic">No incomes available yet.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {incomes.map((income) => (
              <label
                key={income.id}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <input
                  type="checkbox"
                  checked={form.linkedIncomeIds.includes(income.id)}
                  onChange={() => toggleIncome(income.id)}
                  className="accent-emerald-500 w-4 h-4"
                />
                <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                  {income.title}
                  <span className="text-gray-500 ml-1">({formatCurrency(income.amount)})</span>
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg px-4 py-2 transition-colors disabled:opacity-50"
      >
        {loading ? 'Adding…' : 'Add Savings'}
      </button>
    </form>
  )
}
