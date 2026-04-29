import { useState } from 'react'
import EntityCard from '../EntityCard/EntityCard.jsx'
import DetailModal from '../shared/DetailModal.jsx'
import { formatCurrencyCLP } from '../../utils/financialRules.js'
import { ENTITY_CONFIG } from '../../config/entityConfig.js'

export default function DebitCard({ debit }) {
  const [detailOpen, setDetailOpen] = useState(false)
  const cfg = ENTITY_CONFIG.debito

  const initial   = debit.initialAmount ?? debit.amount ?? 0
  const remaining = debit.amount ?? 0
  const consumed  = Math.max(0, initial - remaining)
  const consumedPct = initial > 0 ? Math.min(100, Math.round((consumed / initial) * 100)) : 0

  const barColor =
    consumedPct < 40 ? 'bg-cyan-500'
    : consumedPct < 70 ? 'bg-yellow-400'
    : 'bg-red-500'

  return (
    <>
      <EntityCard onClick={() => setDetailOpen(true)}>
        {/* Badge */}
        <div>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cfg.badgeClass}`}>
            {cfg.icon} {cfg.label}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-gray-100 leading-tight">{debit.title}</h3>

        {/* Saldo disponible + inicial */}
        <div className="flex items-end justify-between gap-2">
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Disponible</p>
            <span className="text-2xl font-bold text-cyan-400 tabular-nums">
              {formatCurrencyCLP(remaining)}
            </span>
          </div>
          {initial > 0 && (
            <div className="text-right">
              <p className="text-xs text-gray-500 mb-0.5">Inicial</p>
              <span className="text-sm font-medium text-gray-400 tabular-nums">
                {formatCurrencyCLP(initial)}
              </span>
            </div>
          )}
        </div>

        {/* Barra de uso */}
        {initial > 0 && (
          <div className="flex flex-col gap-1.5">
            <div className="w-full bg-gray-700 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-1.5 rounded-full transition-all duration-300 ${barColor}`}
                style={{ width: `${consumedPct}%` }}
              />
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-600">
                {consumed > 0 ? `Usado ${formatCurrencyCLP(consumed)}` : 'Sin uso aún'}
              </span>
              <span className="text-gray-600">{consumedPct}%</span>
            </div>
          </div>
        )}
      </EntityCard>

      {detailOpen && (
        <DetailModal entity={debit} type="debito" onClose={() => setDetailOpen(false)} />
      )}
    </>
  )
}
