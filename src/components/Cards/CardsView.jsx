import { useMemo } from 'react'
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
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {allEntities.map(({ entity, type }) => {
          if (type === 'income')    return <IncomeCard    key={entity.id} income={entity}    />
          if (type === 'expense')   return <ExpenseCard   key={entity.id} expense={entity}   />
          if (type === 'credit')    return <CreditCard    key={entity.id} credit={entity}    />
          if (type === 'portfolio') return <PortfolioCard key={entity.id} portfolio={entity} />
          if (type === 'savings')   return <SavingsCard   key={entity.id} savings={entity}   />
          return null
        })}
      </div>
    </div>
  )
}
