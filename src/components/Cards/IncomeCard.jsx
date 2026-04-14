import { useState } from 'react'
import EntityCard from '../EntityCard/EntityCard.jsx'
import EntityModal from '../shared/EntityModal.jsx'
import { formatCurrencyCLP } from '../../utils/financialRules.js'
import { useTransactions } from '../../hooks/useTransactions.js'
import { ENTITY_CONFIG } from '../../config/entityConfig.js'

export default function IncomeCard({ income }) {
  const { removeIncome } = useTransactions()
  const [editOpen, setEditOpen] = useState(false)
  const cfg = ENTITY_CONFIG.income

  const initial  = income.initialAmount ?? income.amount ?? 0
  const remaining = income.amount ?? 0
  const consumed  = Math.max(0, initial - remaining)
  const consumedPct = initial > 0 ? Math.min(100, Math.round((consumed / initial) * 100)) : 0
  const hasTracking = initial > 0

  // Color de la barra: mientras más queda disponible, más verde
  const barColor =
    consumedPct < 40  ? 'bg-emerald-500'
    : consumedPct < 70  ? 'bg-yellow-400'
    : 'bg-red-500'

  return (
    <>
      <EntityCard>
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${cfg.badgeClass}`}>
            {cfg.icon} {cfg.label}
          </span>
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => setEditOpen(true)}
              className="text-gray-600 hover:text-gray-300 transition-colors p-1 rounded-lg hover:bg-gray-800"
              title="Editar"
            >
              ✏
            </button>
            <button
              onClick={() => removeIncome(income.id).catch(alert)}
              className="text-gray-600 hover:text-red-400 transition-colors p-1 rounded-lg hover:bg-gray-800"
              title="Eliminar"
            >
              ×
            </button>
          </div>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-gray-100 leading-tight">{income.title}</h3>

        {/* Disponible + Inicial */}
        <div className="flex items-end justify-between gap-2">
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Disponible</p>
            <span className="text-2xl font-bold text-emerald-400 tabular-nums">
              {formatCurrencyCLP(remaining)}
            </span>
          </div>
          {hasTracking && (
            <div className="text-right">
              <p className="text-xs text-gray-500 mb-0.5">Inicial</p>
              <span className="text-sm font-medium text-gray-400 tabular-nums">
                {formatCurrencyCLP(initial)}
              </span>
            </div>
          )}
        </div>

        {/* Barra de consumo */}
        {hasTracking && (
          <div className="flex flex-col gap-1.5">
            <div className="w-full bg-gray-700 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-1.5 rounded-full transition-all duration-300 ${barColor}`}
                style={{ width: `${consumedPct}%` }}
              />
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-600">
                {consumed > 0 ? `Gastado ${formatCurrencyCLP(consumed)}` : 'Sin uso aún'}
              </span>
              <span className="text-gray-600">{consumedPct}%</span>
            </div>
          </div>
        )}
      </EntityCard>

      {editOpen && (
        <EntityModal
          type="income"
          entity={income}
          onClose={() => setEditOpen(false)}
        />
      )}
    </>
  )
}
