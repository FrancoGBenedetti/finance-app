import { create } from 'zustand'

export const useFinanceStore = create((set, get) => ({
  // ─── Entity state ─────────────────────────────────────────────────────────
  incomes: [],
  expenses: [],
  credits: [],
  savings: [],

  // ─── UI state ─────────────────────────────────────────────────────────────
  activeView: 'table', // 'table' | 'cards'
  loading: true,
  error: null,

  // ─── Setters (called by useFinanceData subscriptions) ────────────────────
  setIncomes: (incomes) => set({ incomes }),
  setExpenses: (expenses) => set({ expenses }),
  setCredits: (credits) => set({ credits }),
  setSavings: (savings) => set({ savings }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setActiveView: (view) => set({ activeView: view }),

  // ─── Lookup helpers ───────────────────────────────────────────────────────
  getIncomeById: (id) => get().incomes.find((i) => i.id === id),
  getCreditById: (id) => get().credits.find((c) => c.id === id),
}))
