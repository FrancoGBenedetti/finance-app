// ─── Pure financial rules ─────────────────────────────────────────────────────
// No imports, no side-effects. Data in → data out.
// All business logic lives here and nowhere else.
//
// Data model:
//   Income      → id, title, amount, initialAmount, createdAt
//   Credit      → id, title, limit, used, available, createdAt
//   Expense     → id, title, budget, totalSpent, createdAt        ← NO source
//   Transaction → id, expenseId, amount, sourceId, sourceType, createdAt
//   Portfolio   → id, title, linkedIncomeIds[], createdAt         ← suma calculada
//   Savings     → id, title, amount, createdAt                    ← monto manual

// ─── Aggregations ─────────────────────────────────────────────────────────────

export function computeTotalAvailableIncome(incomes) {
  return incomes.reduce((sum, i) => sum + (i.amount ?? 0), 0)
}

/** totalSpent derivado de expense.totalSpent (sincronizado vía Firestore batch) */
export function computeTotalSpent(expenses) {
  return expenses.reduce((sum, e) => sum + (e.totalSpent ?? 0), 0)
}

export function computeTotalDebt(credits) {
  return credits.reduce((sum, c) => sum + (c.used ?? 0), 0)
}

/** Ahorros = suma de montos manuales (nueva entidad Savings) */
export function computeTotalSavings(savings) {
  return savings.reduce((sum, s) => sum + (s.amount ?? 0), 0)
}

// ─── Portfolio total (calculado desde ingresos vinculados) ───────────────────

/** Total de un portafolio = suma de income.amount de los ingresos vinculados */
export function computePortfolioTotal(portfolio, incomes) {
  const ids = portfolio.linkedIncomeIds ?? []
  return incomes
    .filter((i) => ids.includes(i.id))
    .reduce((sum, i) => sum + (i.amount ?? 0), 0)
}

/** Total de todos los portafolios (para stats si se quiere mostrar) */
export function computeTotalPortfolios(portfolios, incomes) {
  return portfolios.reduce((sum, p) => sum + computePortfolioTotal(p, incomes), 0)
}

// ─── Validaciones ─────────────────────────────────────────────────────────────

export function validateIncome(data) {
  if (!data.title || data.title.trim() === '') return 'El título es requerido'
  if (data.amount == null || Number(data.amount) < 0) return 'El monto debe ser un número positivo'
  return null
}

export function validateCredit(data) {
  if (!data.title || data.title.trim() === '') return 'El título es requerido'
  if (!data.limit || Number(data.limit) <= 0) return 'El límite debe ser mayor a 0'
  if (data.used && Number(data.used) < 0) return 'La deuda previa no puede ser un número negativo'
  if (data.used && Number(data.used) > Number(data.limit)) return 'El saldo ya gastado no puede exceder el límite'
  return null
}

export function validateExpense(data) {
  if (!data.title || data.title.trim() === '') return 'El título es requerido'
  if (data.budget == null || Number(data.budget) < 0) return 'El presupuesto debe ser 0 o mayor'
  return null
}

/** Portfolio: solo necesita título (el total se calcula desde los ingresos) */
export function validatePortfolio(data) {
  if (!data.title || data.title.trim() === '') return 'El título es requerido'
  return null
}

/** Savings manual: título + monto obligatorio */
export function validateSavings(data) {
  if (!data.title || data.title.trim() === '') return 'El título es requerido'
  if (data.amount == null || Number(data.amount) < 0) return 'El monto debe ser un número positivo'
  return null
}

// ─── Transaction validation ──────────────────────────────────────────────────

export function validateTransaction(data, incomes, credits) {
  if (!data.expenseId) return 'La transacción debe estar vinculada a un gasto'
  if (!data.sourceId || !data.sourceType) return 'Selecciona una fuente para esta transacción'
  if (!data.amount || Number(data.amount) <= 0) return 'El monto debe ser mayor a 0'

  if (data.sourceType === 'income') {
    const source = incomes.find((i) => i.id === data.sourceId)
    if (!source) return 'Fuente de ingreso no encontrada'
    if (Number(data.amount) > source.amount)
      return `Ingreso insuficiente (${formatCurrencyCLP(source.amount)} disponible)`
  }

  if (data.sourceType === 'credit') {
    const source = credits.find((c) => c.id === data.sourceId)
    if (!source) return 'Fuente de crédito no encontrada'
    if (Number(data.amount) > source.available)
      return `Crédito insuficiente (${formatCurrencyCLP(source.available)} disponible)`
  }

  return null
}

// ─── Transaction side-effects ─────────────────────────────────────────────────

export function computeTransactionSideEffects(data, incomes, credits) {
  if (data.sourceType === 'income') {
    const source = incomes.find((i) => i.id === data.sourceId)
    return { type: 'income', id: source.id, newAmount: source.amount - Number(data.amount) }
  } else {
    const source = credits.find((c) => c.id === data.sourceId)
    return {
      type: 'credit',
      id: source.id,
      newUsed: source.used + Number(data.amount),
      newAvailable: source.available - Number(data.amount),
    }
  }
}

export function computeTransactionReversal(transaction, incomes, credits) {
  if (transaction.sourceType === 'income') {
    const source = incomes.find((i) => i.id === transaction.sourceId)
    if (!source) return null
    return { type: 'income', id: source.id, newAmount: source.amount + (transaction.amount ?? 0) }
  } else {
    const source = credits.find((c) => c.id === transaction.sourceId)
    if (!source) return null
    return {
      type: 'credit',
      id: source.id,
      newUsed: source.used - (transaction.amount ?? 0),
      newAvailable: source.available + (transaction.amount ?? 0),
    }
  }
}

export function computeExpenseDeleteReversals(expenseTransactions, incomes, credits) {
  const incomeDeltas = {}
  const creditDeltas = {}

  for (const t of expenseTransactions) {
    const amt = t.amount ?? 0
    if (t.sourceType === 'income')  incomeDeltas[t.sourceId] = (incomeDeltas[t.sourceId] ?? 0) + amt
    else if (t.sourceType === 'credit') creditDeltas[t.sourceId] = (creditDeltas[t.sourceId] ?? 0) + amt
  }

  const incomeReversals = Object.entries(incomeDeltas).map(([id, delta]) => {
    const source = incomes.find((i) => i.id === id)
    return source ? { type: 'income', id, newAmount: source.amount + delta } : null
  }).filter(Boolean)

  const creditReversals = Object.entries(creditDeltas).map(([id, delta]) => {
    const source = credits.find((c) => c.id === id)
    return source
      ? { type: 'credit', id, newUsed: source.used - delta, newAvailable: source.available + delta }
      : null
  }).filter(Boolean)

  return [...incomeReversals, ...creditReversals]
}

// ─── Budget warnings ──────────────────────────────────────────────────────────

export function isBudgetExceeded(expense) {
  return expense.budget > 0 && (expense.totalSpent ?? 0) > expense.budget
}

export function isBudgetNearLimit(expense, threshold = 0.85) {
  return expense.budget > 0 && (expense.totalSpent ?? 0) / expense.budget >= threshold
}

// ─── Formatters ───────────────────────────────────────────────────────────────

/**
 * Formato CLP: $150.000 / $3.100.000
 */
export function formatCurrencyCLP(value) {
  const num = Math.round(Number(value) || 0)
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num)
}

/** Alias backward-compatible */
export const formatCurrency = formatCurrencyCLP

export function computeProgressPercent(spent, budget) {
  if (!budget || budget === 0) return 0
  return Math.min(100, Math.round(((spent ?? 0) / budget) * 100))
}

export function computeCreditProgressPercent(used, limit) {
  if (!limit || limit === 0) return 0
  return Math.min(100, Math.round(((used ?? 0) / limit) * 100))
}

export function progressColor(percent) {
  if (percent < 60) return 'bg-green-500'
  if (percent < 85) return 'bg-yellow-400'
  return 'bg-red-500'
}
