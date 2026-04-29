import { useEffect } from 'react'
import { useFinanceStore } from '../../store/useFinanceStore.js'
import { useDerivedTotals } from '../../hooks/useDerivedTotals.js'
import { formatCurrencyCLP } from '../../utils/financialRules.js'

function MetricItem({ label, value, color, border = false }) {
  return (
    <div className={`flex items-center justify-between py-3 ${border ? 'border-t border-gray-800' : ''}`}>
      <span className="text-sm text-gray-400">{label}</span>
      <span className={`text-sm font-semibold tabular-nums ${color}`}>
        {formatCurrencyCLP(value)}
      </span>
    </div>
  )
}

export default function Sidebar() {
  const open         = useFinanceStore((s) => s.sidebarOpen)
  const setSidebar   = useFinanceStore((s) => s.setSidebarOpen)

  const {
    totalAvailable,
    totalSpent,
    totalDebt,
    totalSavings,
    expectedSavings,
  } = useDerivedTotals()

  // Cerrar con Escape
  useEffect(() => {
    if (!open) return
    const fn = (e) => { if (e.key === 'Escape') setSidebar(false) }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [open, setSidebar])

  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm"
        onClick={() => setSidebar(false)}
      />

      {/* Panel */}
      <div className="fixed top-0 left-0 z-40 h-full w-72 bg-gray-950 border-r border-gray-800 flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
          <span className="text-base font-bold text-emerald-400 tracking-tight">Resumen</span>
          <button
            onClick={() => setSidebar(false)}
            className="text-gray-500 hover:text-white transition-colors text-xl leading-none p-1 rounded-lg hover:bg-gray-800"
          >
            ×
          </button>
        </div>

        {/* Métricas */}
        <div className="flex-1 overflow-y-auto px-5 py-2">
          <MetricItem label="Disponible" value={totalAvailable}  color="text-emerald-400" />
          <MetricItem label="Gastado"    value={totalSpent}       color="text-red-400"     />
          <MetricItem label="Deuda"      value={totalDebt}        color="text-orange-400"  />
          <MetricItem label="Ahorros"    value={totalSavings}     color="text-blue-400"    />
          <MetricItem
            label="Ahorro esperado"
            value={expectedSavings}
            color={expectedSavings >= 0 ? 'text-emerald-400' : 'text-red-400'}
            border
          />
          {expectedSavings < 0 && (
            <p className="text-xs text-red-500/80 mt-1 pb-2">
              ⚠ Los presupuestos superan los ingresos
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-gray-800">
          <p className="text-xs text-gray-600 text-center">
            Ahorro esperado = ingresos − presupuestos
          </p>
        </div>
      </div>
    </>
  )
}
