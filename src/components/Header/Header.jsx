import { useState } from 'react'
import { useDerivedTotals } from '../../hooks/useDerivedTotals.js'
import { useFinanceStore } from '../../store/useFinanceStore.js'
import { formatCurrencyCLP, progressColor } from '../../utils/financialRules.js'
import { downloadCSV } from '../../utils/exportData.js'
import EntityModal from '../shared/EntityModal.jsx'
import ResetModal from '../shared/ResetModal.jsx'

const FILTERS = [
  { id: 'all',       label: 'Todos' },
  { id: 'income',    label: 'Ingresos' },
  { id: 'debito',    label: 'Débito' },
  { id: 'expense',   label: 'Gastos' },
  { id: 'credit',    label: 'Créditos' },
  { id: 'savings',   label: 'Ahorros' },
  { id: 'portfolio', label: 'Portafolios' },
]

export default function Header() {
  const { totalSpent, totalBudget, globalPct } = useDerivedTotals()
  const { activeView, setActiveView, activeFilter, setActiveFilter, setSidebarOpen } = useFinanceStore()
  const [createOpen, setCreateOpen] = useState(false)
  const [resetOpen,  setResetOpen]  = useState(false)

  function handleDownload() {
    const { incomes, debits, expenses, credits, savings, transactions } = useFinanceStore.getState()
    downloadCSV({ incomes, debits, expenses, credits, savings, transactions })
  }

  const barColor = progressColor(globalPct)

  return (
    <>
      <header className="sticky top-0 z-20 bg-gray-950/95 backdrop-blur border-b border-gray-800/80">

        {/* Fila 1 — Logo + abrir sidebar */}
        <div className="px-4 sm:px-6 py-2 flex items-center gap-3 border-b border-gray-800/40">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-gray-800"
            title="Ver resumen"
          >
            ☰
          </button>
          <span className="text-base font-bold text-emerald-400 tracking-tight">moneybox</span>
        </div>

        {/* Fila 2 — Barra de progreso global */}
        <div className="px-4 sm:px-6 py-2.5 border-b border-gray-800/40">
          <div className="flex justify-between items-baseline mb-1.5">
            <span className="text-xs text-gray-500 uppercase tracking-wider">Presupuesto global</span>
            {totalBudget > 0 ? (
              <span className="text-xs text-gray-500 tabular-nums">
                {formatCurrencyCLP(totalSpent)}
                <span className="text-gray-700"> / </span>
                {formatCurrencyCLP(totalBudget)}
                <span className="ml-1.5 font-medium text-gray-400">{globalPct}%</span>
              </span>
            ) : (
              <span className="text-xs text-gray-600 italic">Sin presupuestos definidos</span>
            )}
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${totalBudget > 0 ? barColor : 'bg-gray-700'}`}
              style={{ width: totalBudget > 0 ? `${globalPct}%` : '0%' }}
            />
          </div>
        </div>

        {/* Fila 3 — Reiniciar + Descargar CSV */}
        <div className="px-4 sm:px-6 py-2 flex items-center gap-2 border-b border-gray-800/40">
          <button
            onClick={() => setResetOpen(true)}
            className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white border border-gray-700 text-sm font-medium px-3 py-1.5 rounded-lg transition-colors"
          >
            🔄 Reiniciar
          </button>
          <button
            onClick={handleDownload}
            className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white border border-gray-700 text-sm font-medium px-3 py-1.5 rounded-lg transition-colors"
          >
            ⬇ Descargar CSV
          </button>
        </div>

        {/* Fila 4 — Crear + Toggle vista */}
        <div className="px-4 sm:px-6 py-2 flex items-center gap-2 border-b border-gray-800/40">
          <button
            onClick={() => setCreateOpen(true)}
            className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold py-1.5 rounded-lg transition-colors"
          >
            + Crear
          </button>
          <div className="flex rounded-lg overflow-hidden border border-gray-700 text-sm shrink-0">
            <button
              onClick={() => setActiveView('table')}
              className={`px-3 py-1.5 transition-colors ${
                activeView === 'table' ? 'bg-gray-700 text-white' : 'bg-transparent text-gray-500 hover:text-white'
              }`}
            >
              Tabla
            </button>
            <button
              onClick={() => setActiveView('cards')}
              className={`px-3 py-1.5 transition-colors ${
                activeView === 'cards' ? 'bg-gray-700 text-white' : 'bg-transparent text-gray-500 hover:text-white'
              }`}
            >
              Cards
            </button>
          </div>
        </div>

        {/* Fila 5 — Filtros (solo Cards) */}
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
