import { useFinanceStore } from '../../store/useFinanceStore.js'
import { formatCurrencyCLP } from '../../utils/financialRules.js'

export default function SourceSelector({ sourceId, sourceType, onChange }) {
  const incomes = useFinanceStore((s) => s.incomes)
  const debits  = useFinanceStore((s) => s.debits)
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
      <option value="">— Seleccionar fuente —</option>

      {incomes.length > 0 && (
        <optgroup label="💰 Ingresos">
          {incomes.map((i) => (
            <option key={i.id} value={`income:${i.id}`}>
              {i.title} ({formatCurrencyCLP(i.amount)} disponible)
            </option>
          ))}
        </optgroup>
      )}

      {debits.length > 0 && (
        <optgroup label="🏦 Débito">
          {debits.map((d) => (
            <option key={d.id} value={`debit:${d.id}`}>
              {d.title} ({formatCurrencyCLP(d.amount)} disponible)
            </option>
          ))}
        </optgroup>
      )}

      {credits.length > 0 && (
        <optgroup label="💳 Créditos">
          {credits.map((c) => (
            <option key={c.id} value={`credit:${c.id}`}>
              {c.title} ({formatCurrencyCLP(c.available)} disponible)
            </option>
          ))}
        </optgroup>
      )}
    </select>
  )
}
