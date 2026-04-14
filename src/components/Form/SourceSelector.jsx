import { useFinanceStore } from '../../store/useFinanceStore.js'
import { formatCurrency } from '../../utils/financialRules.js'

export default function SourceSelector({ sourceId, sourceType, onChange }) {
  const incomes = useFinanceStore((s) => s.incomes)
  const credits = useFinanceStore((s) => s.credits)

  const value = sourceId && sourceType ? `${sourceType}:${sourceId}` : ''

  function handleChange(e) {
    if (!e.target.value) {
      onChange({ sourceId: '', sourceType: '' })
      return
    }
    const [type, id] = e.target.value.split(':')
    onChange({ sourceId: id, sourceType: type })
  }

  return (
    <select
      value={value}
      onChange={handleChange}
      className="bg-gray-800 border border-gray-700 text-gray-100 text-sm rounded-lg px-3 py-2 w-full focus:outline-none focus:border-emerald-500"
    >
      <option value="">— Select source —</option>
      <optgroup label="Incomes">
        {incomes.map((i) => (
          <option key={i.id} value={`income:${i.id}`}>
            {i.title} ({formatCurrency(i.amount)} available)
          </option>
        ))}
      </optgroup>
      <optgroup label="Credits">
        {credits.map((c) => (
          <option key={c.id} value={`credit:${c.id}`}>
            {c.title} ({formatCurrency(c.available)} available)
          </option>
        ))}
      </optgroup>
    </select>
  )
}
