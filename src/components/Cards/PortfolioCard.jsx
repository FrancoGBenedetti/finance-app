import { useState } from 'react'
import EntityCard from '../EntityCard/EntityCard.jsx'
import EntityModal from '../shared/EntityModal.jsx'
import { formatCurrencyCLP, computePortfolioTotal } from '../../utils/financialRules.js'
import { useFinanceStore } from '../../store/useFinanceStore.js'
import { useTransactions } from '../../hooks/useTransactions.js'
import { ENTITY_CONFIG } from '../../config/entityConfig.js'

export default function PortfolioCard({ portfolio }) {
  const incomes = useFinanceStore((s) => s.incomes)
  const { removePortfolio } = useTransactions()
  const [editOpen, setEditOpen] = useState(false)
  const cfg = ENTITY_CONFIG.portfolio
  const total = computePortfolioTotal(portfolio, incomes)

  const linkedIncomes = incomes.filter((i) =>
    (portfolio.linkedIncomeIds ?? []).includes(i.id)
  )

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
              onClick={() => removePortfolio(portfolio.id).catch(alert)}
              className="text-gray-600 hover:text-red-400 transition-colors p-1 rounded-lg hover:bg-gray-800"
              title="Eliminar"
            >
              ×
            </button>
          </div>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-gray-100 leading-tight">{portfolio.title}</h3>

        {/* Total calculado */}
        <div>
          <span className="text-2xl font-bold text-purple-400 tabular-nums">
            {formatCurrencyCLP(total)}
          </span>
          <p className="text-xs text-gray-600 mt-0.5">suma de ingresos seleccionados</p>
        </div>

        {/* Ingresos vinculados */}
        {linkedIncomes.length > 0 ? (
          <div className="flex flex-col gap-1 pt-1 border-t border-gray-800">
            {linkedIncomes.map((income) => (
              <div key={income.id} className="flex justify-between text-xs">
                <span className="text-gray-400">{income.title}</span>
                <span className="text-gray-500 tabular-nums">{formatCurrencyCLP(income.amount)}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-600 italic pt-1 border-t border-gray-800">
            Sin ingresos vinculados
          </p>
        )}
      </EntityCard>

      {editOpen && (
        <EntityModal
          type="portfolio"
          entity={portfolio}
          onClose={() => setEditOpen(false)}
        />
      )}
    </>
  )
}
