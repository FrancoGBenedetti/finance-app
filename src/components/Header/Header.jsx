import { useDerivedTotals } from '../../hooks/useDerivedTotals.js'
import { useFinanceStore } from '../../store/useFinanceStore.js'
import { formatCurrency } from '../../utils/financialRules.js'

function StatBlock({ label, value, valueColor = 'text-white' }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-gray-400 uppercase tracking-wider">{label}</span>
      <span className={`text-xl font-semibold tabular-nums ${valueColor}`}>{value}</span>
    </div>
  )
}

export default function Header() {
  const { totalAvailableIncome, totalSpent, totalDebt, totalSavings } = useDerivedTotals()
  const { activeView, setActiveView } = useFinanceStore()

  return (
    <header className="sticky top-0 z-10 bg-gray-950 border-b border-gray-800 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-6 flex-wrap">
        {/* Brand */}
        <span className="text-lg font-bold text-emerald-400 tracking-tight">moneybox</span>

        {/* Stats */}
        <div className="flex items-center gap-8 flex-wrap">
          <StatBlock
            label="Available"
            value={formatCurrency(totalAvailableIncome)}
            valueColor="text-emerald-400"
          />
          <StatBlock
            label="Spent"
            value={formatCurrency(totalSpent)}
            valueColor="text-red-400"
          />
          <StatBlock
            label="Debt"
            value={formatCurrency(totalDebt)}
            valueColor="text-orange-400"
          />
          <StatBlock
            label="Savings"
            value={formatCurrency(totalSavings)}
            valueColor="text-blue-400"
          />
        </div>

        {/* View toggle */}
        <div className="flex rounded-lg overflow-hidden border border-gray-700 text-sm">
          <button
            onClick={() => setActiveView('table')}
            className={`px-4 py-1.5 transition-colors ${
              activeView === 'table'
                ? 'bg-gray-700 text-white'
                : 'bg-transparent text-gray-400 hover:text-white'
            }`}
          >
            Table
          </button>
          <button
            onClick={() => setActiveView('cards')}
            className={`px-4 py-1.5 transition-colors ${
              activeView === 'cards'
                ? 'bg-gray-700 text-white'
                : 'bg-transparent text-gray-400 hover:text-white'
            }`}
          >
            Cards
          </button>
        </div>
      </div>
    </header>
  )
}
