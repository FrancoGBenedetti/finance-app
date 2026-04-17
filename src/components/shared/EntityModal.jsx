import { useState, useEffect } from 'react'
import { useTransactions } from '../../hooks/useTransactions.js'
import { useFinanceStore } from '../../store/useFinanceStore.js'
import { ENTITY_CONFIG, ENTITY_TYPES } from '../../config/entityConfig.js'
import { formatCurrencyCLP, computeExpenseTotalFromEntries } from '../../utils/financialRules.js'

// ─── Modal shell reutilizable ─────────────────────────────────────────────────
function ModalShell({ title, subtitle, onClose, onBack, children }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-gray-900 border border-gray-700/80 rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center gap-3 mb-5">
          {onBack && (
            <button
              onClick={onBack}
              className="text-gray-500 hover:text-white transition-colors p-1 rounded-lg hover:bg-gray-800"
              title="Volver"
            >
              ←
            </button>
          )}
          <div className="flex-1">
            <h2 className="text-base font-semibold text-white">{title}</h2>
            {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white transition-colors text-xl leading-none p-1"
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

// ─── Selector de tipo ─────────────────────────────────────────────────────────
function TypeSelector({ onSelect }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {ENTITY_TYPES.map((type) => {
        const cfg = ENTITY_CONFIG[type]
        return (
          <button
            key={type}
            onClick={() => onSelect(type)}
            className={`p-4 rounded-xl text-left ${cfg.buttonClass}`}
          >
            <span className="text-2xl">{cfg.icon}</span>
            <p className="font-semibold text-white mt-2">{cfg.label}</p>
            <p className="text-xs text-gray-400 mt-0.5">{cfg.description}</p>
          </button>
        )
      })}
    </div>
  )
}

// ─── Renderer de campos dinámico ──────────────────────────────────────────────
function FieldRenderer({ field, value, onChange }) {
  const incomes      = useFinanceStore((s) => s.incomes)
  const expenses     = useFinanceStore((s) => s.expenses)
  const credits      = useFinanceStore((s) => s.credits)
  const savings      = useFinanceStore((s) => s.savings)
  const transactions = useFinanceStore((s) => s.transactions)

  const inputCls =
    'bg-gray-800 border border-gray-700 text-gray-100 text-sm rounded-lg px-3 py-2 w-full focus:outline-none focus:border-emerald-500 transition-colors'

  if (field.type === 'entity-multiselect') {
    const selected = Array.isArray(value) ? value : []
    const isSelected = (id, type) => selected.some((e) => e.id === id && e.type === type)
    const toggle = (id, type) => {
      if (isSelected(id, type)) onChange(selected.filter((e) => !(e.id === id && e.type === type)))
      else onChange([...selected, { id, type }])
    }
    const groups = [
      { type: 'income',  icon: '💰', label: 'Ingresos',    entities: incomes,  valFn: (e) => e.amount },
      { type: 'expense', icon: '💸', label: 'Gastos',      entities: expenses, valFn: (e) => computeExpenseTotalFromEntries(transactions, e.id) },
      { type: 'credit',  icon: '💳', label: 'Créditos',    entities: credits,  valFn: (e) => e.available },
      { type: 'savings', icon: '🐷', label: 'Ahorros',     entities: savings,  valFn: (e) => e.amount },
    ].filter((g) => g.entities.length > 0)
    return (
      <div>
        <label className="block text-sm text-gray-400 mb-2">{field.label}</label>
        {groups.length === 0 ? (
          <p className="text-gray-600 text-sm italic">No hay entidades disponibles aún.</p>
        ) : (
          <div className="flex flex-col gap-4 bg-gray-800/50 rounded-lg p-3">
            {groups.map(({ type, icon, label, entities, valFn }) => (
              <div key={type}>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">{icon} {label}</p>
                <div className="flex flex-col gap-2">
                  {entities.map((entity) => {
                    const checked = isSelected(entity.id, type)
                    return (
                      <label key={entity.id} className="flex items-center gap-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggle(entity.id, type)}
                          className="accent-emerald-500 w-4 h-4 shrink-0"
                        />
                        <span className="text-sm text-gray-300 group-hover:text-white transition-colors flex-1">
                          {entity.title}
                        </span>
                        <span className="text-xs text-gray-500 tabular-nums">
                          {formatCurrencyCLP(valFn(entity))}
                        </span>
                      </label>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
        {field.hint && <p className="text-xs text-gray-600 mt-1.5">{field.hint}</p>}
      </div>
    )
  }

  return (
    <div>
      <label className="block text-sm text-gray-400 mb-1">{field.label}</label>
      <input
        type={field.type}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder ?? ''}
        min={field.min}
        step={field.step ?? (field.type === 'number' ? 1 : undefined)}
        required={field.required}
        className={inputCls}
      />
      {field.hint && (
        <p className="text-xs text-gray-600 mt-1">{field.hint}</p>
      )}
    </div>
  )
}

// ─── Formulario de entidad ────────────────────────────────────────────────────
function EntityForm({ type, entity, onClose }) {
  const isEdit = entity !== null
  const cfg = ENTITY_CONFIG[type]
  const tx = useTransactions()

  // Build initial form state from config + existing entity
  const buildInitial = () => {
    const out = {}
    for (const field of cfg.fields) {
      if (field.type === 'entity-multiselect') {
        if (entity?.[field.key] !== undefined) {
          out[field.key] = entity[field.key]
        } else if (field.key === 'linkedEntities' && entity?.linkedIncomeIds) {
          // Migrate legacy linkedIncomeIds → linkedEntities
          out[field.key] = entity.linkedIncomeIds.map((id) => ({ id, type: 'income' }))
        } else {
          out[field.key] = field.defaultValue ?? []
        }
      } else {
        out[field.key] = entity?.[field.key] !== undefined ? entity[field.key] : (field.defaultValue ?? '')
      }
    }
    return out
  }

  const [form, setForm] = useState(buildInitial)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const HANDLERS = {
    create: {
      income:    tx.addIncome,
      expense:   tx.addExpense,
      credit:    tx.addCredit,
      portfolio: tx.addPortfolio,
      savings:   tx.addSavings,
    },
    update: {
      income:    (id, d) => tx.updateIncome(id, d),
      expense:   (id, d) => tx.updateExpense(id, d),
      credit:    (id, d) => tx.updateCredit(id, d),
      portfolio: (id, d) => tx.updatePortfolio(id, d),
      savings:   (id, d) => tx.updateSavings(id, d),
    },
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      if (isEdit) {
        await HANDLERS.update[type](entity.id, form)
      } else {
        await HANDLERS.create[type](form)
      }
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {cfg.fields.map((field) => (
        <FieldRenderer
          key={field.key}
          field={field}
          value={form[field.key]}
          onChange={(val) => setForm((p) => ({ ...p, [field.key]: val }))}
        />
      ))}

      {error && (
        <p className="text-red-400 text-sm bg-red-950/50 border border-red-900 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-lg px-4 py-2.5 transition-colors disabled:opacity-50 mt-1"
      >
        {loading
          ? '…'
          : isEdit
          ? 'Guardar cambios'
          : `Crear ${cfg.label}`}
      </button>
    </form>
  )
}

// ─── EntityModal — punto de entrada público ───────────────────────────────────
/**
 * Props:
 *   type?   — si se conoce de antemano ('income' | 'expense' | 'credit' | 'savings')
 *   entity? — entidad existente → activa modo edición
 *   onClose — callback para cerrar
 *
 * Flujo create (sin type): type-selector → form
 * Flujo create (con type): form directo
 * Flujo edit:              form pre-llenado, sin type-selector
 */
export default function EntityModal({ type: initialType = null, entity = null, onClose }) {
  const isEdit = entity !== null
  const [activeType, setActiveType] = useState(initialType)

  // Close on Escape
  useEffect(() => {
    const fn = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [onClose])

  const cfg = activeType ? ENTITY_CONFIG[activeType] : null

  const title = isEdit
    ? `Editar ${cfg?.label ?? ''}`
    : activeType
    ? `Nuevo ${cfg?.label ?? ''}`
    : 'Nuevo elemento'

  const subtitle = isEdit && entity?.title ? entity.title : undefined

  const showBack = !isEdit && activeType && !initialType

  return (
    <ModalShell
      title={title}
      subtitle={subtitle}
      onClose={onClose}
      onBack={showBack ? () => setActiveType(null) : undefined}
    >
      {!activeType ? (
        <TypeSelector onSelect={setActiveType} />
      ) : (
        <EntityForm type={activeType} entity={entity} onClose={onClose} />
      )}
    </ModalShell>
  )
}
