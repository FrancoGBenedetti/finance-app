import { useEffect, useRef } from 'react'
import { useFinanceStore }      from '../store/useFinanceStore.js'
import { subscribeToIncomes }       from '../firebase/incomes.js'
import { subscribeToExpenses }      from '../firebase/expenses.js'
import { subscribeToCredits }       from '../firebase/credits.js'
import { subscribeToPortfolios }    from '../firebase/portfolios.js'
import { subscribeToSavings }       from '../firebase/savings.js'
import { subscribeToTransactions }  from '../firebase/transactions.js'

const COLLECTION_COUNT = 6

export function useFinanceData() {
  const {
    setIncomes, setExpenses, setCredits,
    setPortfolios, setSavings, setTransactions,
    setLoading,
  } = useFinanceStore()

  const readyCount = useRef(0)

  useEffect(() => {
    readyCount.current = 0

    function onReady() {
      readyCount.current += 1
      if (readyCount.current === COLLECTION_COUNT) setLoading(false)
    }

    const unsubs = [
      subscribeToIncomes((d)      => { setIncomes(d);      onReady() }),
      subscribeToExpenses((d)     => { setExpenses(d);     onReady() }),
      subscribeToCredits((d)      => { setCredits(d);      onReady() }),
      subscribeToPortfolios((d)   => { setPortfolios(d);   onReady() }),
      subscribeToSavings((d)      => { setSavings(d);      onReady() }),
      subscribeToTransactions((d) => { setTransactions(d); onReady() }),
    ]

    return () => unsubs.forEach((fn) => fn())
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
