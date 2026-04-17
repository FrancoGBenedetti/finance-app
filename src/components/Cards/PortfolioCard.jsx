import { useState } from 'react'
import EntityCard from '../EntityCard/EntityCard.jsx'
import DetailModal from '../shared/DetailModal.jsx'
import {
  formatCurrencyCLP,
  computePortfolioTotal,
  computeExpenseTotalFromEntries,
} from '../../utils/financialRules.js'
import { useFinanceStore } from '../../store/useFinanceStore.js'
import { ENTITY_CONFIG } from '../../config/entityConfig.js'

export default function PortfolioCard({ portfolio }) {
  const incomes      = useFinanceStore((s) => s.incomes)
  const expenses     = useFinanceStore((s) => s.expenses)
  const credits      = useFinanceStore((s) => s.credits)
  const savings      = useFinanceStore((s) => s.savings)
  const transactions = useFinanceStore((s) => s.transactions)
  const [detailOpen, setDetailOpen] = useState(false)
  const cfg = ENTITY_CONFIG.portfolio

  const allData = { expenses, credits, savings, transactions }
  const total   = computePortfolioTotal(portfolio, incomes, allData)

  // Support both new (linkedEntities) and legacy (linkedIncomeIds) formats
  const linkedEntities = portfolio.linkedEntities
    ?? (portfolio.linkedIncomeIds ?? []).map((id) => ({ id, type: 'income' }))

  function getEntityInfo({ id, type }) {
    const eCfg = ENTITY_CONFIG[type]
    let name = '?', val = 0
    if (type === 'income')  { const e = incomes.find((i) => i.id === id); name = e?.title ?? id; val = e?.amount ?? 0 }
    if (type === 'expense') { const e = expenses.find((exp) => exp.id === id); name = e?.title ?? id; val = computeExpenseTotalFromEntries(transactions, id) }
    if (type === 'credit')  { const e = credits.find((c) => c.id === id); name = e?.title ?? id; val = e?.available ?? 0 }
    if (type === 'savings') { const e = savings.find((s) => s.id === id); name = e?.title ?? id; val = e?.amount ?? 0 }
    return { icon: eCfg?.icon ?? '•', name, val }
  }

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
        <h3 className="font-semibold text-gray-100 leading-tight">{portfolio.title}</h3>

        {/* Total calculado */}
        <div>
          <span className="text-2xl font-bold text-purple-400 tabular-nums">
            {formatCurrencyCLP(total)}
          </span>
          <p className="text-xs text-gray-600 mt-0.5">suma de entidades seleccionadas</p>
        </div>

        {/* Entidades vinculadas */}
        {linkedEntities.length > 0 ? (
          <div className="flex flex-col gap-1 pt-1 border-t border-gray-800">
            {linkedEntities.map(({ id, type }) => {
              const { icon, name, val } = getEntityInfo({ id, type })
              return (
                <div key={`${type}-${id}`} className="flex justify-between text-xs">
                  <span className="text-gray-400">{icon} {name}</span>
                  <span className="text-gray-500 tabular-nums">{formatCurrencyCLP(val)}</span>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="text-xs text-gray-600 italic pt-1 border-t border-gray-800">
            Sin entidades vinculadas
          </p>
        )}
      </EntityCard>

      {detailOpen && (
        <DetailModal entity={portfolio} type="portfolio" onClose={() => setDetailOpen(false)} />
      )}
    </>
  )
}
