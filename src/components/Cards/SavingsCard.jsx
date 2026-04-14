import { useState } from 'react'
import EntityCard from '../EntityCard/EntityCard.jsx'
import EntityModal from '../shared/EntityModal.jsx'
import { formatCurrencyCLP } from '../../utils/financialRules.js'
import { useTransactions } from '../../hooks/useTransactions.js'
import { ENTITY_CONFIG } from '../../config/entityConfig.js'

export default function SavingsCard({ savings }) {
  const { removeSavings } = useTransactions()
  const [editOpen, setEditOpen] = useState(false)
  const cfg = ENTITY_CONFIG.savings

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
              onClick={() => removeSavings(savings.id).catch(alert)}
              className="text-gray-600 hover:text-red-400 transition-colors p-1 rounded-lg hover:bg-gray-800"
              title="Eliminar"
            >
              ×
            </button>
          </div>
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

      {editOpen && (
        <EntityModal
          type="savings"
          entity={savings}
          onClose={() => setEditOpen(false)}
        />
      )}
    </>
  )
}
