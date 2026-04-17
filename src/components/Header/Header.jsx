import { useState } from 'react'
import { useDerivedTotals } from '../../hooks/useDerivedTotals.js'
import { useFinanceStore } from '../../store/useFinanceStore.js'
import { formatCurrencyCLP } from '../../utils/financialRules.js'
import EntityModal from '../shared/EntityModal.jsx'
import ResetModal from '../shared/ResetModal.jsx'

const FILTERS = [
  { id: 'all',       label: 'Todos' },
  { id: 'income',    label: 'Ingresos' },
  { id: 'expense',   label: 'Gastos' },
  { id: 'credit',    label: 'Créditos' },
  { id: 'savings',   label: 'Ahorros' },
  { id: 'portfolio', label: 'Portafolios' },
]

function StatRow({ left, right }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 px-4 sm:px-6 py-2 border-b border-gray-800/40">
      <Stat {...left}  />
      <Stat {...right} />
    </div>
  )
}

function Stat({ label, value, color }) {
  return (
    <div className="flex flex-col gap-0.5 min-w-0">
      <span className="text-xs text-gray-500 uppercase tracking-wider">{label}</span>
      <span className={`text-sm font-semibold tabular-nums truncate ${color}`}>{value}</span>
    </div>
  )
}

export default function Header() {
  const { totalAvailableIncome, totalSpent, totalDebt, totalSavings } = useDerivedTotals()
  const { activeView, setActiveView, activeFilter, setActiveFilter } = useFinanceStore()
  const [createOpen, setCreateOpen] = useState(false)
  const [resetOpen,  setResetOpen]  = useState(false)

  return (
    <>
      <header className="sticky top-0 z-20 bg-gray-950/95 backdrop-blur border-b border-gray-800/80">

        {/* Fila 1 — Logo */}
        <div className="px-4 sm:px-6 py-2 border-b border-gray-800/40">
          <span className="text-base font-bold text-emerald-400 tracking-tight">moneybox</span>
        </div>

        {/* Fila 2 — Disponible + Gastado */}
        <StatRow
          left={{ label: 'Disponible', value: formatCurrencyCLP(totalAvailableIncome), color: 'text-emerald-400' }}
          right={{ label: 'Gastado',   value: formatCurrencyCLP(totalSpent),            color: 'text-red-400'     }}
        />

        {/* Fila 3 — Deuda + Ahorros */}
        <StatRow
          left={{ label: 'Deuda',   value: formatCurrencyCLP(totalDebt),    color: 'text-orange-400' }}
          right={{ label: 'Ahorros', value: formatCurrencyCLP(totalSavings), color: 'text-blue-400'   }}
        />

        {/* Fila 4 — Controles */}
        <div className="px-4 sm:px-6 py-2 flex items-center gap-2 border-b border-gray-800/40">
          {/* Toggle Tabla / Cards */}
          <div className="flex rounded-lg overflow-hidden border border-gray-700 text-sm shrink-0">
            <button
              onClick={() => setActiveView('table')}
              className={`px-3 py-1.5 transition-colors ${
                activeView === 'table'
                  ? 'bg-gray-700 text-white'
                  : 'bg-transparent text-gray-500 hover:text-white'
              }`}
            >
              Tabla
            </button>
            <button
              onClick={() => setActiveView('cards')}
              className={`px-3 py-1.5 transition-colors ${
                activeView === 'cards'
                  ? 'bg-gray-700 text-white'
                  : 'bg-transparent text-gray-500 hover:text-white'
              }`}
            >
              Cards
            </button>
          </div>

          {/* Reiniciar */}
          <button
            onClick={() => setResetOpen(true)}
            className="shrink-0 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white border border-gray-700 text-sm font-medium px-3 py-1.5 rounded-lg transition-colors"
          >
            🔄 Reiniciar
          </button>

          {/* Crear — ocupa el espacio restante */}
          <button
            onClick={() => setCreateOpen(true)}
            className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold py-1.5 rounded-lg transition-colors"
          >
            + Crear
          </button>
        </div>

        {/* Fila 5 — Filtros de categoría (solo vista Cards) */}
        {activeView === 'cards' && (
          <div className="px-4 sm:px-6 py-2 flex gap-2 overflow-x-auto no-scrollbar">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id)}
                className={`whitespace-nowrap px-3 py-1 text-xs font-semibold rounded-full transition-colors ${
                  activeFilter === f.id
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200 border border-gray-700/50'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}
      </header>

      {createOpen && <EntityModal onClose={() => setCreateOpen(false)} />}
      {resetOpen  && <ResetModal  onClose={() => setResetOpen(false)}  />}
    </>
  )
}
