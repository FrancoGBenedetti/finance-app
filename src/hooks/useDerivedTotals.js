import { useMemo } from 'react'
import { useFinanceStore } from '../store/useFinanceStore.js'
import {
  computeTotalAvailableIncome,
  computeTotalSpent,
  computeTotalDebt,
  computeTotalSavings,
} from '../utils/financialRules.js'

export function useDerivedTotals() {
  const incomes      = useFinanceStore((s) => s.incomes)
  const expenses     = useFinanceStore((s) => s.expenses)
  const credits      = useFinanceStore((s) => s.credits)
  const savings      = useFinanceStore((s) => s.savings)
  const transactions = useFinanceStore((s) => s.transactions)

  return useMemo(
    () => ({
      totalAvailableIncome: computeTotalAvailableIncome(incomes),
      totalSpent:           computeTotalSpent(expenses, transactions),
      totalDebt:            computeTotalDebt(credits),
      totalSavings:         computeTotalSavings(savings),
    }),
    [incomes, expenses, credits, savings, transactions]
  )
}
