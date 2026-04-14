import { useMemo, useState } from 'react'
import { useFinanceStore } from '../../store/useFinanceStore.js'
import IncomeCard    from './IncomeCard.jsx'
import ExpenseCard   from './ExpenseCard.jsx'
import CreditCard    from './CreditCard.jsx'
import PortfolioCard from './PortfolioCard.jsx'
import SavingsCard   from './SavingsCard.jsx'

function toMs(ts) {
  if (!ts) return 0
  if (typeof ts.toMillis === 'function') return ts.toMillis()
  if (ts.seconds != null) return ts.seconds * 1000
  return new Date(ts).getTime()
}

export default function CardsView() {
  const incomes    = useFinanceStore((s) => s.incomes)
  const expenses   = useFinanceStore((s) => s.expenses)
  const credits    = useFinanceStore((s) => s.credits)
  const portfolios = useFinanceStore((s) => s.portfolios)
  const savings    = useFinanceStore((s) => s.savings)

  const allEntities = useMemo(() => [
    ...incomes.map((e)    => ({ entity: e, type: 'income'    })),
    ...credits.map((e)    => ({ entity: e, type: 'credit'    })),
    ...expenses.map((e)   => ({ entity: e, type: 'expense'   })),
    ...portfolios.map((e) => ({ entity: e, type: 'portfolio' })),
    ...savings.map((e)    => ({ entity: e, type: 'savings'   })),
  ].sort((a, b) => toMs(a.entity.createdAt) - toMs(b.entity.createdAt)),
  [incomes, credits, expenses, portfolios, savings])

  const [filter, setFilter] = useState('all')

  const filteredEntities = useMemo(() => {
    if (filter === 'all') return allEntities
    return allEntities.filter(e => e.type === filter)
  }, [allEntities, filter])

  if (allEntities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center px-4">
        <p className="text-5xl mb-4">📭</p>
        <p className="text-gray-400 font-medium">No hay elementos aún</p>
        <p className="text-gray-600 text-sm mt-1">
          Usa <span className="text-emerald-400 font-medium">+ Crear</span> para empezar.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Filter Header */}
      <div className="bg-gray-950/80 backdrop-blur-md border-b border-gray-800/80 px-4 sm:px-6 py-2 sticky top-[48px] z-10 flex gap-2 overflow-x-auto no-scrollbar">
        {[
          { id: 'all', label: 'Todos' },
          { id: 'income', label: 'Ingresos' },
          { id: 'expense', label: 'Gastos' },
          { id: 'credit', label: 'Créditos' },
          { id: 'savings', label: 'Ahorros' },
          { id: 'portfolio', label: 'Portafolios' }
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`whitespace-nowrap px-3 py-1 text-xs font-semibold rounded-full transition-colors ${
              filter === f.id
                ? 'bg-emerald-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200 border border-gray-700/50'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="p-4 sm:p-6 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEntities.map(({ entity, type }) => {
          if (type === 'income')    return <IncomeCard    key={entity.id} income={entity}    />
          if (type === 'expense')   return <ExpenseCard   key={entity.id} expense={entity}   />
          if (type === 'credit')    return <CreditCard    key={entity.id} credit={entity}    />
          if (type === 'portfolio') return <PortfolioCard key={entity.id} portfolio={entity} />
          if (type === 'savings')   return <SavingsCard   key={entity.id} savings={entity}   />
        })}
        </div>
      </div>
    </div>
  )
}
