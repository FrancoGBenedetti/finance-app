// ─── Pure financial rules ─────────────────────────────────────────────────────
// No imports, no side-effects. Data in → data out.
// All business logic lives here and nowhere else.

// ─── Aggregations ─────────────────────────────────────────────────────────────

export function computeTotalAvailableIncome(incomes) {
  return incomes.reduce((sum, i) => sum + (i.amount ?? 0), 0)
}

export function computeTotalSpent(expenses) {
  return expenses.reduce((sum, e) => sum + (e.spent ?? 0), 0)
}

export function computeTotalDebt(credits) {
  return credits.reduce((sum, c) => sum + (c.used ?? 0), 0)
}

export function computeTotalSavings(savings, incomes) {
  return savings.reduce((sum, s) => sum + computeSavingsTotal(s, incomes), 0)
}

// ─── Per-savings total (used by SavingsCard) ──────────────────────────────────

export function computeSavingsTotal(savingsRecord, incomes) {
  const ids = savingsRecord.linkedIncomeIds ?? []
  return incomes
    .filter((i) => ids.includes(i.id))
    .reduce((sum, i) => sum + (i.amount ?? 0), 0)
}

// ─── Validation ───────────────────────────────────────────────────────────────

export function validateExpense(data, incomes, credits) {
  if (!data.sourceId || !data.sourceType) return 'Expense must have a source'
  if (!data.title || data.title.trim() === '') return 'Title is required'
  if (data.spent == null || data.spent < 0) return 'Spent must be a positive number'

  if (data.sourceType === 'income') {
    const source = incomes.find((i) => i.id === data.sourceId)
    if (!source) return 'Income source not found'
    if (data.spent > source.amount) return `Cannot spend more than available (${formatCurrency(source.amount)})`
  }

  if (data.sourceType === 'credit') {
    const source = credits.find((c) => c.id === data.sourceId)
    if (!source) return 'Credit source not found'
    if (data.spent > source.available) return `Cannot exceed credit available (${formatCurrency(source.available)})`
  }

  return null
}

export function validateExpenseUpdate(oldExpense, newSpent, incomes, credits) {
  const delta = newSpent - (oldExpense.spent ?? 0)
  if (delta === 0) return null

  if (oldExpense.sourceType === 'income') {
    const source = incomes.find((i) => i.id === oldExpense.sourceId)
    if (!source) return 'Income source not found'
    if (delta > source.amount) return `Not enough income available (${formatCurrency(source.amount)} left)`
  }

  if (oldExpense.sourceType === 'credit') {
    const source = credits.find((c) => c.id === oldExpense.sourceId)
    if (!source) return 'Credit source not found'
    if (delta > source.available) return `Not enough credit available (${formatCurrency(source.available)} left)`
  }

  return null
}

export function validateIncome(data) {
  if (!data.title || data.title.trim() === '') return 'Title is required'
  if (data.amount == null || data.amount < 0) return 'Amount must be a positive number'
  return null
}

export function validateCredit(data) {
  if (!data.title || data.title.trim() === '') return 'Title is required'
  if (data.limit == null || data.limit <= 0) return 'Limit must be greater than 0'
  return null
}

export function validateSavings(data) {
  if (!data.title || data.title.trim() === '') return 'Title is required'
  return null
}

// ─── Side-effect computation ──────────────────────────────────────────────────

export function computeExpenseSideEffects(expenseData, incomes, credits) {
  if (expenseData.sourceType === 'income') {
    const source = incomes.find((i) => i.id === expenseData.sourceId)
    return {
      type: 'income',
      id: source.id,
      newAmount: source.amount - expenseData.spent,
    }
  } else {
    const source = credits.find((c) => c.id === expenseData.sourceId)
    return {
      type: 'credit',
      id: source.id,
      newUsed: source.used + expenseData.spent,
      newAvailable: source.available - expenseData.spent,
    }
  }
}

export function computeExpenseUpdateSideEffects(oldExpense, newSpent, incomes, credits) {
  const delta = newSpent - (oldExpense.spent ?? 0)

  if (oldExpense.sourceType === 'income') {
    const source = incomes.find((i) => i.id === oldExpense.sourceId)
    return {
      type: 'income',
      id: source.id,
      newAmount: source.amount - delta,
    }
  } else {
    const source = credits.find((c) => c.id === oldExpense.sourceId)
    return {
      type: 'credit',
      id: source.id,
      newUsed: source.used + delta,
      newAvailable: source.available - delta,
    }
  }
}

export function computeExpenseDeleteReversal(expense, incomes, credits) {
  if (expense.sourceType === 'income') {
    const source = incomes.find((i) => i.id === expense.sourceId)
    if (!source) return null
    return {
      type: 'income',
      id: source.id,
      newAmount: source.amount + (expense.spent ?? 0),
    }
  } else {
    const source = credits.find((c) => c.id === expense.sourceId)
    if (!source) return null
    return {
      type: 'credit',
      id: source.id,
      newUsed: source.used - (expense.spent ?? 0),
      newAvailable: source.available + (expense.spent ?? 0),
    }
  }
}

// ─── Formatters ───────────────────────────────────────────────────────────────

export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount ?? 0)
}

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
