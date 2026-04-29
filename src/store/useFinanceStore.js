import { create } from 'zustand'

export const useFinanceStore = create((set, get) => ({
  // ─── Entity state ─────────────────────────────────────────────────────────
  incomes:      [],
  debits:       [],   // Débito: cuenta corriente / tarjeta de débito
  expenses:     [],
  credits:      [],
  portfolios:   [],
  savings:      [],
  transactions: [],

  // ─── UI state ─────────────────────────────────────────────────────────────
  activeView:   'table',
  activeFilter: 'all',
  sidebarOpen:  false,
  loading:      true,
  error:        null,

  // ─── Setters ──────────────────────────────────────────────────────────────
  setIncomes:       (v) => set({ incomes: v }),
  setDebits:        (v) => set({ debits: v }),
  setExpenses:      (v) => set({ expenses: v }),
  setCredits:       (v) => set({ credits: v }),
  setPortfolios:    (v) => set({ portfolios: v }),
  setSavings:       (v) => set({ savings: v }),
  setTransactions:  (v) => set({ transactions: v }),
  setLoading:       (v) => set({ loading: v }),
  setError:         (v) => set({ error: v }),
  setActiveView:    (v) => set({ activeView: v }),
  setActiveFilter:  (v) => set({ activeFilter: v }),
  setSidebarOpen:   (v) => set({ sidebarOpen: v }),

  // ─── Lookups ──────────────────────────────────────────────────────────────
  getIncomeById:    (id) => get().incomes.find((i) => i.id === id),
  getDebitById:     (id) => get().debits.find((d) => d.id === id),
  getCreditById:    (id) => get().credits.find((c) => c.id === id),
  getExpenseById:   (id) => get().expenses.find((e) => e.id === id),
  getPortfolioById: (id) => get().portfolios.find((p) => p.id === id),
  getSavingsById:   (id) => get().savings.find((s) => s.id === id),

  getTransactionsByExpense: (expenseId) =>
    get().transactions.filter((t) => t.expenseId === expenseId),
}))
