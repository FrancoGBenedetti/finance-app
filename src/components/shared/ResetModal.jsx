import { useState, useMemo } from 'react'
import { useFinanceStore } from '../../store/useFinanceStore.js'
import { useTransactions } from '../../hooks/useTransactions.js'
import { ENTITY_CONFIG } from '../../config/entityConfig.js'

function toMs(ts) {
  if (!ts) return 0
  if (typeof ts.toMillis === 'function') return ts.toMillis()
  if (ts.seconds != null) return ts.seconds * 1000
  return new Date(ts).getTime()
}

export default function ResetModal({ onClose }) {
  const { incomes, expenses, credits, savings } = useFinanceStore()
  const { resetEntities } = useTransactions()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Collect all resettable entities, excluding portfolios since they're derived
  const allEntities = useMemo(() => [
    ...incomes.map((e)  => ({ entity: e, type: 'income'  })),
    ...credits.map((e)  => ({ entity: e, type: 'credit'  })),
    ...expenses.map((e) => ({ entity: e, type: 'expense' })),
    ...savings.map((e)  => ({ entity: e, type: 'savings' })),
  ].sort((a, b) => toMs(a.entity.createdAt) - toMs(b.entity.createdAt)),
  [incomes, credits, expenses, savings])

  // By default, select all except "ahorro" (case-insensitive check)
  const defaultSelected = useMemo(() => {
    return allEntities
      .filter(({ entity }) => entity.title.toLowerCase() !== 'ahorro')
      .map(({ entity }) => entity.id)
  }, [allEntities])

  const [selectedIds, setSelectedIds] = useState(defaultSelected)

  const toggleSelection = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const toggleAll = () => {
    if (selectedIds.length === allEntities.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(allEntities.map((e) => e.entity.id))
    }
  }

  async function handleReset() {
    setIsSubmitting(true)
    try {
      const payload = allEntities
        .filter(({ entity }) => selectedIds.includes(entity.id))
        .map(({ entity, type }) => ({ id: entity.id, type }))
      
      if (payload.length > 0) {
        await resetEntities(payload)
      }
      onClose()
    } catch (err) {
      alert(err.message)
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md p-5 sm:p-6 shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between mb-4 shrink-0">
          <h2 className="text-xl font-bold text-gray-100 flex items-center gap-2">
            🔄 Reiniciar Valores
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-300 transition-colors bg-gray-800/50 hover:bg-gray-800 rounded-full w-8 h-8 flex items-center justify-center"
          >
            ×
          </button>
        </div>

        <p className="text-sm text-gray-400 mb-4 shrink-0">
          Selecciona las tarjetas que deseas reiniciar completamente a cero para empezar un nuevo mes.
        </p>

        {/* List of elements */}
        <div className="flex-1 overflow-y-auto mb-4 border border-gray-800 rounded-xl bg-gray-950/50 p-2">
          {allEntities.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">No hay tarjetas disponibles.</p>
          ) : (
            <>
              <div className="flex justify-between px-3 mb-2 border-b border-gray-800/50 pb-2">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {selectedIds.length} de {allEntities.length} seleccionados
                </span>
                <button 
                  onClick={toggleAll}
                  className="text-xs font-medium text-emerald-400 hover:text-emerald-300"
                >
                  {selectedIds.length === allEntities.length ? 'Deseleccionar Todos' : 'Seleccionar Todos'}
                </button>
              </div>
              <div className="flex flex-col gap-1">
                {allEntities.map(({ entity, type }) => {
                  const cfg = ENTITY_CONFIG[type]
                  const isChecked = selectedIds.includes(entity.id)
                  
                  return (
                    <label 
                      key={entity.id} 
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800/50 cursor-pointer transition-colors"
                    >
                      <input 
                        type="checkbox" 
                        className="w-5 h-5 rounded border-gray-600 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-gray-900 bg-gray-800"
                        checked={isChecked}
                        onChange={() => toggleSelection(entity.id)}
                      />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-200">{entity.title}</span>
                        <span className={`text-xs ${cfg.badgeClass} w-max mt-0.5 px-1.5 py-0.5 rounded opacity-80`}>
                          {cfg.icon} {cfg.label}
                        </span>
                      </div>
                    </label>
                  )
                })}
              </div>
            </>
          )}
        </div>

        <div className="flex gap-3 shrink-0">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 transition-colors"
            disabled={isSubmitting}
          >
            Cancelar
          </button>
          <button
            onClick={handleReset}
            disabled={isSubmitting || selectedIds.length === 0}
            className={`flex-1 py-2.5 rounded-xl font-bold transition-colors ${
              (isSubmitting || selectedIds.length === 0)
                ? 'bg-emerald-600/50 text-emerald-100 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            {isSubmitting ? 'Reiniciando...' : 'Confirmar Reinicio'}
          </button>
        </div>
      </div>
    </div>
  )
}
