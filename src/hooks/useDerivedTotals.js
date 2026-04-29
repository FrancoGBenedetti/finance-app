import { useMemo } from 'react'
import { useFinanceStore } from '../store/useFinanceStore.js'
import {
  computeTotalAvailableIncome,
  computeTotalAvailableDebits,
  computeTotalSpent,
  computeTotalDebt,
  computeTotalSavings,
  computeTotalBudget,
  computeExpectedSavings,
  computeProgressPercent,
} from '../utils/financialRules.js'

export function useDerivedTotals() {
  const incomes      = useFinanceStore((s) => s.incomes)
  const debits       = useFinanceStore((s) => s.debits)
  const expenses     = useFinanceStore((s) => s.expenses)
  const credits      = useFinanceStore((s) => s.credits)
  const savings      = useFinanceStore((s) => s.savings)
  const transactions = useFinanceStore((s) => s.transactions)

  return useMemo(() => {
    const totalSpent   = computeTotalSpent(expenses, transactions)
    const totalBudget  = computeTotalBudget(expenses)
    const globalPct    = computeProgressPercent(totalSpent, totalBudget)

    return {
      // Sidebar metrics
      totalAvailable:   computeTotalAvailableIncome(incomes) + computeTotalAvailableDebits(debits),
      totalSpent,
      totalDebt:        computeTotalDebt(credits),
      totalSavings:     computeTotalSavings(savings),
      expectedSavings:  computeExpectedSavings(incomes, expenses),
      // Global progress bar (header)
      totalBudget,
      globalPct,
    }
  }, [incomes, debits, expenses, credits, savings, transactions])
}
