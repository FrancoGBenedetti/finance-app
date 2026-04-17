import { useMemo, useState } from 'react'
import { useFinanceStore } from '../../store/useFinanceStore.js'
import TableRow    from './TableRow.jsx'
import DetailModal from '../shared/DetailModal.jsx'

function toMs(ts) {
  if (!ts) return 0
  if (typeof ts.toMillis === 'function') return ts.toMillis()
  if (ts.seconds != null) return ts.seconds * 1000
  return new Date(ts).getTime()
}

export default function TableView() {
  const incomes    = useFinanceStore((s) => s.incomes)
  const expenses   = useFinanceStore((s) => s.expenses)
  const credits    = useFinanceStore((s) => s.credits)
  const portfolios = useFinanceStore((s) => s.portfolios)
  const savings    = useFinanceStore((s) => s.savings)

  const [detailTarget, setDetailTarget] = useState(null)

  const allEntities = useMemo(() => [
    ...incomes.map((e)    => ({ entity: e, type: 'income'    })),
    ...credits.map((e)    => ({ entity: e, type: 'credit'    })),
    ...expenses.map((e)   => ({ entity: e, type: 'expense'   })),
    ...portfolios.map((e) => ({ entity: e, type: 'portfolio' })),
    ...savings.map((e)    => ({ entity: e, type: 'savings'   })),
  ].sort((a, b) => toMs(a.entity.createdAt) - toMs(b.entity.createdAt)),
  [incomes, credits, expenses, portfolios, savings])

  return (
    <>
      <div className="p-4 max-w-7xl mx-auto overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="px-4 py-3 text-left text-xs text-gray-500 font-medium uppercase tracking-wider w-32">Tipo</th>
              <th className="px-4 py-3 text-left text-xs text-gray-500 font-medium uppercase tracking-wider">Título</th>
              <th className="px-4 py-3 text-left text-xs text-gray-500 font-medium uppercase tracking-wider hidden sm:table-cell">Info</th>
              <th className="px-4 py-3 text-right text-xs text-gray-500 font-medium uppercase tracking-wider">Cantidad</th>
              <th className="px-4 py-3 text-right text-xs text-gray-500 font-medium uppercase tracking-wider">Presupuesto</th>
              <th className="px-4 py-3 w-28" />
            </tr>
          </thead>
          <tbody>
            {allEntities.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-16 text-center text-gray-600">
                  <p className="text-3xl mb-2">📭</p>
                  <p>No hay elementos. Usa <span className="text-emerald-400 font-medium">+ Crear</span> para empezar.</p>
                </td>
              </tr>
            )}
            {allEntities.map(({ entity, type }) => (
              <TableRow
                key={entity.id}
                entity={entity}
                type={type}
                onDetail={() => setDetailTarget({ entity, type })}
              />
            ))}
          </tbody>
        </table>
      </div>

      {detailTarget && (
        <DetailModal
          type={detailTarget.type}
          entity={detailTarget.entity}
          onClose={() => setDetailTarget(null)}
        />
      )}
    </>
  )
}
