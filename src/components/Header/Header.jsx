import { useState } from 'react'
import { useDerivedTotals } from '../../hooks/useDerivedTotals.js'
import { useFinanceStore } from '../../store/useFinanceStore.js'
import { formatCurrencyCLP } from '../../utils/financialRules.js'
import EntityModal from '../shared/EntityModal.jsx'
import ResetModal from '../shared/ResetModal.jsx'

function StatBlock({ label, value, valueColor = 'text-white' }) {
  return (
    <div className="flex flex-col gap-0.5 min-w-[100px]">
      <span className="text-xs text-gray-500 uppercase tracking-wider">{label}</span>
      <span className={`text-lg font-semibold tabular-nums ${valueColor}`}>{value}</span>
    </div>
  )
}

export default function Header() {
  const { totalAvailableIncome, totalSpent, totalDebt, totalSavings } = useDerivedTotals()
  const { activeView, setActiveView } = useFinanceStore()
  const [createOpen, setCreateOpen] = useState(false)
  const [resetOpen, setResetOpen] = useState(false)

  return (
    <>
      <header className="sticky top-0 z-10 bg-gray-950/95 backdrop-blur border-b border-gray-800/80 px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center gap-4 flex-wrap">

          {/* Brand */}
          <span className="text-base font-bold text-emerald-400 tracking-tight shrink-0">
            moneybox
          </span>

          {/* Stats */}
          <div className="flex items-center gap-5 flex-wrap flex-1 min-w-0">
            <StatBlock
              label="Disponible"
              value={formatCurrencyCLP(totalAvailableIncome)}
              valueColor="text-emerald-400"
            />
            <StatBlock
              label="Gastado"
              value={formatCurrencyCLP(totalSpent)}
              valueColor="text-red-400"
            />
            <StatBlock
              label="Deuda"
              value={formatCurrencyCLP(totalDebt)}
              valueColor="text-orange-400"
            />
            <StatBlock
              label="Ahorros"
              value={formatCurrencyCLP(totalSavings)}
              valueColor="text-blue-400"
            />
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-2 shrink-0">
            {/* View toggle */}
            <div className="flex rounded-lg overflow-hidden border border-gray-700 text-sm">
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

            {/* Restart button */}
            <button
              onClick={() => setResetOpen(true)}
              className="bg-gray-800 hover:bg-emerald-700 text-gray-300 hover:text-white border border-gray-700 hover:border-emerald-600 text-sm font-semibold px-4 py-1.5 rounded-lg transition-colors"
            >
              🔄 Reiniciar
            </button>

            {/* Create button */}
            <button
              onClick={() => setCreateOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold px-4 py-1.5 rounded-lg transition-colors"
            >
              + Crear
            </button>
          </div>
        </div>
      </header>

      {createOpen && (
        <EntityModal onClose={() => setCreateOpen(false)} />
      )}
      
      {resetOpen && (
        <ResetModal onClose={() => setResetOpen(false)} />
      )}
    </>
  )
}
