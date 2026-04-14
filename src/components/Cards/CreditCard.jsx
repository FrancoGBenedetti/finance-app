import { useState } from 'react'
import EntityCard from '../EntityCard/EntityCard.jsx'
import ProgressBar from '../ProgressBar/ProgressBar.jsx'
import EntityModal from '../shared/EntityModal.jsx'
import { formatCurrencyCLP, computeCreditProgressPercent } from '../../utils/financialRules.js'
import { useTransactions } from '../../hooks/useTransactions.js'
import { ENTITY_CONFIG } from '../../config/entityConfig.js'

export default function CreditCard({ credit }) {
  const { removeCredit } = useTransactions()
  const [editOpen, setEditOpen] = useState(false)
  const cfg = ENTITY_CONFIG.credit
  const pct = computeCreditProgressPercent(credit.used, credit.limit)

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
              onClick={() => removeCredit(credit.id).catch(alert)}
              className="text-gray-600 hover:text-red-400 transition-colors p-1 rounded-lg hover:bg-gray-800"
              title="Eliminar"
            >
              ×
            </button>
          </div>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-gray-100 leading-tight">{credit.title}</h3>

        {/* Used / Available */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-gray-500 block text-xs uppercase tracking-wider mb-0.5">Usado</span>
            <span className="text-orange-400 font-semibold tabular-nums text-base">
              {formatCurrencyCLP(credit.used)}
            </span>
          </div>
          <div>
            <span className="text-gray-500 block text-xs uppercase tracking-wider mb-0.5">Disponible</span>
            <span className="text-emerald-400 font-semibold tabular-nums text-base">
              {formatCurrencyCLP(credit.available)}
            </span>
          </div>
        </div>

        <ProgressBar value={pct} colorScheme="spend" />

        <div className="flex justify-between text-xs text-gray-600">
          <span>Límite {formatCurrencyCLP(credit.limit)}</span>
          <span>{pct}% usado</span>
        </div>
      </EntityCard>

      {editOpen && (
        <EntityModal
          type="credit"
          entity={credit}
          onClose={() => setEditOpen(false)}
        />
      )}
    </>
  )
}
