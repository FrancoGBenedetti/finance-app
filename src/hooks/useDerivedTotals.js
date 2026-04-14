import { useMemo } from 'react'
import { useFinanceStore } from '../store/useFinanceStore.js'
import {
  computeTotalAvailableIncome,
  computeTotalSpent,
  computeTotalDebt,
  computeTotalSavings,
} from '../utils/financialRules.js'

export function useDerivedTotals() {
  const incomes  = useFinanceStore((s) => s.incomes)
  const expenses = useFinanceStore((s) => s.expenses)
  const credits  = useFinanceStore((s) => s.credits)
  const savings  = useFinanceStore((s) => s.savings)   // ← ahorro manual

  return useMemo(
    () => ({
      totalAvailableIncome: computeTotalAvailableIncome(incomes),
      totalSpent:           computeTotalSpent(expenses),
      totalDebt:            computeTotalDebt(credits),
      totalSavings:         computeTotalSavings(savings),  // suma de savings.amount
    }),
    [incomes, expenses, credits, savings]
  )
}
