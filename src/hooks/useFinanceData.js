import { useEffect, useRef } from 'react'
import { useFinanceStore } from '../store/useFinanceStore.js'
import { subscribeToIncomes } from '../firebase/incomes.js'
import { subscribeToExpenses } from '../firebase/expenses.js'
import { subscribeToCredits } from '../firebase/credits.js'
import { subscribeToSavings } from '../firebase/savings.js'

export function useFinanceData() {
  const { setIncomes, setExpenses, setCredits, setSavings, setLoading, setError } =
    useFinanceStore()
  const readyCount = useRef(0)

  useEffect(() => {
    readyCount.current = 0

    function onReady() {
      readyCount.current += 1
      if (readyCount.current === 4) setLoading(false)
    }

    const unsubs = [
      subscribeToIncomes((data) => { setIncomes(data); onReady() }),
      subscribeToExpenses((data) => { setExpenses(data); onReady() }),
      subscribeToCredits((data) => { setCredits(data); onReady() }),
      subscribeToSavings((data) => { setSavings(data); onReady() }),
    ]

    return () => unsubs.forEach((fn) => fn())
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
