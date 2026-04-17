import { useState } from 'react'
import EntityCard from '../EntityCard/EntityCard.jsx'
import DetailModal from '../shared/DetailModal.jsx'
import { formatCurrencyCLP } from '../../utils/financialRules.js'
import { ENTITY_CONFIG } from '../../config/entityConfig.js'

export default function SavingsCard({ savings }) {
  const [detailOpen, setDetailOpen] = useState(false)
  const cfg = ENTITY_CONFIG.savings

  return (
    <>
      <EntityCard onClick={() => setDetailOpen(true)}>
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${cfg.badgeClass}`}>
            {cfg.icon} {cfg.label}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-gray-100 leading-tight">{savings.title}</h3>

        {/* Monto manual */}
        <div>
          <span className="text-2xl font-bold text-blue-400 tabular-nums">
            {formatCurrencyCLP(savings.amount ?? 0)}
          </span>
          <p className="text-xs text-gray-600 mt-0.5">monto asignado manualmente</p>
        </div>
      </EntityCard>

      {detailOpen && (
        <DetailModal entity={savings} type="savings" onClose={() => setDetailOpen(false)} />
      )}
    </>
  )
}
