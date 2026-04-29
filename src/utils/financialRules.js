// ─── Pure financial rules ─────────────────────────────────────────────────────
// No imports, no side-effects. Data in → data out.
//
// Data model:
//   Income      → id, title, amount, initialAmount, createdAt
//   Debito      → id, title, amount, initialAmount, createdAt  ← cuenta corriente/débito
//   Credit      → id, title, limit, used, available, createdAt
//   Expense     → id, title, budget, createdAt                 ← totalSpent calculado
//   Transaction → id, expenseId, amount, sourceId, sourceType, createdAt
//   Portfolio   → id, title, linkedEntities[], createdAt       ← suma calculada
//   Savings     → id, title, amount, createdAt                 ← monto manual

// ─── Aggregations ─────────────────────────────────────────────────────────────

export function computeTotalAvailableIncome(incomes) {
  return incomes.reduce((sum, i) => sum + (i.amount ?? 0), 0)
}

export function computeTotalAvailableDebits(debits) {
  return debits.reduce((sum, d) => sum + (d.amount ?? 0), 0)
}

/** totalSpent calculado desde transacciones (event-sourced) */
export function computeExpenseTotalFromEntries(transactions, expenseId) {
  return transactions
    .filter((t) => t.expenseId === expenseId)
    .reduce((sum, t) => sum + (t.amount ?? 0), 0)
}

/** Suma de totalSpent de todos los gastos, calculado desde transacciones */
export function computeTotalSpent(expenses, transactions) {
  if (transactions) {
    return expenses.reduce(
      (sum, e) => sum + computeExpenseTotalFromEntries(transactions, e.id),
      0
    )
  }
  return expenses.reduce((sum, e) => sum + (e.totalSpent ?? 0), 0)
}

export function computeTotalDebt(credits) {
  return credits.reduce((sum, c) => sum + (c.used ?? 0), 0)
}

export function computeTotalSavings(savings) {
  return savings.reduce((sum, s) => sum + (s.amount ?? 0), 0)
}

/** Suma de presupuestos definidos en gastos */
export function computeTotalBudget(expenses) {
  return expenses.reduce((sum, e) => sum + (e.budget > 0 ? e.budget : 0), 0)
}

/**
 * Ahorro esperado = suma de ingresos iniciales – suma de presupuestos.
 * Usa initialAmount cuando está disponible para reflejar el ingreso esperado.
 */
export function computeExpectedSavings(incomes, expenses) {
  const totalIncome = incomes.reduce((sum, i) => sum + (i.initialAmount ?? i.amount ?? 0), 0)
  const totalBudget = computeTotalBudget(expenses)
  return totalIncome - totalBudget
}

// ─── Portfolio total ──────────────────────────────────────────────────────────

export function computePortfolioTotal(portfolio, incomes, allData) {
  if (portfolio.linkedEntities) {
    const { expenses, credits, savings, debits, transactions } = allData ?? {}
    return portfolio.linkedEntities.reduce((sum, { id, type }) => {
      if (type === 'income')  return sum + (incomes.find((i) => i.id === id)?.amount ?? 0)
      if (type === 'debito')  return sum + (debits?.find((d) => d.id === id)?.amount ?? 0)
      if (type === 'expense' && transactions != null)
        return sum + computeExpenseTotalFromEntries(transactions, id)
      if (type === 'credit')  return sum + (credits?.find((c) => c.id === id)?.available ?? 0)
      if (type === 'savings') return sum + (savings?.find((s) => s.id === id)?.amount ?? 0)
      return sum
    }, 0)
  }
  const ids = portfolio.linkedIncomeIds ?? []
  return incomes.filter((i) => ids.includes(i.id)).reduce((sum, i) => sum + (i.amount ?? 0), 0)
}

export function computeTotalPortfolios(portfolios, incomes, allData) {
  return portfolios.reduce((sum, p) => sum + computePortfolioTotal(p, incomes, allData), 0)
}

// ─── Validaciones ─────────────────────────────────────────────────────────────

export function validateIncome(data) {
  if (!data.title?.trim()) return 'El título es requerido'
  if (data.amount == null || Number(data.amount) < 0) return 'El monto debe ser un número positivo'
  return null
}

export function validateDebito(data) {
  if (!data.title?.trim()) return 'El título es requerido'
  if (data.amount == null || Number(data.amount) < 0) return 'El saldo debe ser un número positivo'
  return null
}

export function validateCredit(data) {
  if (!data.title?.trim()) return 'El título es requerido'
  if (!data.limit || Number(data.limit) <= 0) return 'El límite debe ser mayor a 0'
  if (data.used && Number(data.used) < 0) return 'La deuda previa no puede ser un número negativo'
  if (data.used && Number(data.used) > Number(data.limit)) return 'El saldo ya gastado no puede exceder el límite'
  return null
}

export function validateExpense(data) {
  if (!data.title?.trim()) return 'El título es requerido'
  if (data.budget == null || Number(data.budget) < 0) return 'El presupuesto debe ser 0 o mayor'
  return null
}

export function validatePortfolio(data) {
  if (!data.title?.trim()) return 'El título es requerido'
  return null
}

export function validateSavings(data) {
  if (!data.title?.trim()) return 'El título es requerido'
  if (data.amount == null || Number(data.amount) < 0) return 'El monto debe ser un número positivo'
  return null
}

// ─── Transaction validation + side-effects ────────────────────────────────────

export function validateTransaction(data, incomes, credits, debits = []) {
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

  if (data.sourceType === 'debit') {
    const source = debits.find((d) => d.id === data.sourceId)
    if (!source) return 'Fuente de débito no encontrada'
    if (Number(data.amount) > source.amount)
      return `Saldo insuficiente (${formatCurrencyCLP(source.amount)} disponible)`
  }

  return null
}

export function computeTransactionSideEffects(data, incomes, credits, debits = []) {
  if (data.sourceType === 'income') {
    const source = incomes.find((i) => i.id === data.sourceId)
    return { type: 'income', id: source.id, newAmount: source.amount - Number(data.amount) }
  }
  if (data.sourceType === 'debit') {
    const source = debits.find((d) => d.id === data.sourceId)
    return { type: 'debit', id: source.id, newAmount: source.amount - Number(data.amount) }
  }
  const source = credits.find((c) => c.id === data.sourceId)
  return {
    type: 'credit',
    id: source.id,
    newUsed: source.used + Number(data.amount),
    newAvailable: source.available - Number(data.amount),
  }
}

export function computeTransactionReversal(transaction, incomes, credits, debits = []) {
  if (transaction.sourceType === 'income') {
    const source = incomes.find((i) => i.id === transaction.sourceId)
    if (!source) return null
    return { type: 'income', id: source.id, newAmount: source.amount + (transaction.amount ?? 0) }
  }
  if (transaction.sourceType === 'debit') {
    const source = debits.find((d) => d.id === transaction.sourceId)
    if (!source) return null
    return { type: 'debit', id: source.id, newAmount: source.amount + (transaction.amount ?? 0) }
  }
  const source = credits.find((c) => c.id === transaction.sourceId)
  if (!source) return null
  return {
    type: 'credit',
    id: source.id,
    newUsed: source.used - (transaction.amount ?? 0),
    newAvailable: source.available + (transaction.amount ?? 0),
  }
}

export function computeExpenseDeleteReversals(expenseTransactions, incomes, credits, debits = []) {
  const incomeDeltas = {}
  const creditDeltas = {}
  const debitDeltas  = {}

  for (const t of expenseTransactions) {
    const amt = t.amount ?? 0
    if (t.sourceType === 'income')  incomeDeltas[t.sourceId] = (incomeDeltas[t.sourceId] ?? 0) + amt
    else if (t.sourceType === 'credit') creditDeltas[t.sourceId] = (creditDeltas[t.sourceId] ?? 0) + amt
    else if (t.sourceType === 'debit')  debitDeltas[t.sourceId]  = (debitDeltas[t.sourceId]  ?? 0) + amt
  }

  const incomeReversals = Object.entries(incomeDeltas).map(([id, delta]) => {
    const s = incomes.find((i) => i.id === id)
    return s ? { type: 'income', id, newAmount: s.amount + delta } : null
  }).filter(Boolean)

  const debitReversals = Object.entries(debitDeltas).map(([id, delta]) => {
    const s = debits.find((d) => d.id === id)
    return s ? { type: 'debit', id, newAmount: s.amount + delta } : null
  }).filter(Boolean)

  const creditReversals = Object.entries(creditDeltas).map(([id, delta]) => {
    const s = credits.find((c) => c.id === id)
    return s ? { type: 'credit', id, newUsed: s.used - delta, newAvailable: s.available + delta } : null
  }).filter(Boolean)

  return [...incomeReversals, ...debitReversals, ...creditReversals]
}

// ─── Budget warnings ──────────────────────────────────────────────────────────

export function isBudgetExceeded(expense) {
  return expense.budget > 0 && (expense.totalSpent ?? 0) > expense.budget
}

export function isBudgetNearLimit(expense, threshold = 0.85) {
  return expense.budget > 0 && (expense.totalSpent ?? 0) / expense.budget >= threshold
}

// ─── Formatters ───────────────────────────────────────────────────────────────

export function formatCurrencyCLP(value) {
  const num = Math.round(Number(value) || 0)
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num)
}

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
