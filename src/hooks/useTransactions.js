import { db } from '../firebase/config.js'
import { writeBatch, doc, collection, serverTimestamp } from 'firebase/firestore'
import { useFinanceStore } from '../store/useFinanceStore.js'
import {
  validateIncome,
  validateCredit,
  validateExpense,
  validatePortfolio,
  validateSavings,
  validateTransaction,
  computeTransactionSideEffects,
  computeTransactionReversal,
  computeExpenseDeleteReversals,
} from '../utils/financialRules.js'

// ─── Shared batch helper ──────────────────────────────────────────────────────
function applySourceUpdate(batch, sideEffect) {
  if (!sideEffect) return
  if (sideEffect.type === 'income') {
    batch.update(doc(db, 'incomes', sideEffect.id), { amount: sideEffect.newAmount })
  } else {
    batch.update(doc(db, 'credits', sideEffect.id), {
      used: sideEffect.newUsed,
      available: sideEffect.newAvailable,
    })
  }
}

// ─────────────────────────────────────────────────────────────────────────────

export function useTransactions() {

  // ── Incomes ────────────────────────────────────────────────────────────────
  async function addIncome(data) {
    const error = validateIncome(data)
    if (error) throw new Error(error)
    const ref = doc(collection(db, 'incomes'))
    const batch = writeBatch(db)
    batch.set(ref, {
      title: data.title,
      amount: Number(data.amount),
      initialAmount: Number(data.amount),
      createdAt: serverTimestamp(),
    })
    await batch.commit()
    return ref.id
  }

  async function updateIncome(id, data) {
    const error = validateIncome(data)
    if (error) throw new Error(error)
    const batch = writeBatch(db)
    batch.update(doc(db, 'incomes', id), { title: data.title, amount: Number(data.amount) })
    await batch.commit()
  }

  async function removeIncome(id) {
    const { transactions } = useFinanceStore.getState()
    if (transactions.some((t) => t.sourceId === id && t.sourceType === 'income'))
      throw new Error('No se puede eliminar un ingreso que tiene transacciones vinculadas')
    const batch = writeBatch(db)
    batch.delete(doc(db, 'incomes', id))
    await batch.commit()
  }

  // ── Credits ────────────────────────────────────────────────────────────────
  async function addCredit(data) {
    const error = validateCredit(data)
    if (error) throw new Error(error)
    const limit = Number(data.limit)
    const used = data.used ? Number(data.used) : 0
    const ref = doc(collection(db, 'credits'))
    const batch = writeBatch(db)
    batch.set(ref, { title: data.title, limit, used, available: limit - used, createdAt: serverTimestamp() })
    await batch.commit()
    return ref.id
  }

  async function updateCredit(id, data) {
    const error = validateCredit(data)
    if (error) throw new Error(error)
    const { credits } = useFinanceStore.getState()
    const existing = credits.find((c) => c.id === id)
    const newLimit = Number(data.limit)
    const newUsed = data.used !== undefined ? Number(data.used) : (existing?.used ?? 0)
    const batch = writeBatch(db)
    batch.update(doc(db, 'credits', id), {
      title: data.title,
      limit: newLimit,
      used: newUsed,
      available: newLimit - newUsed,
    })
    await batch.commit()
  }

  async function removeCredit(id) {
    const { transactions } = useFinanceStore.getState()
    if (transactions.some((t) => t.sourceId === id && t.sourceType === 'credit'))
      throw new Error('No se puede eliminar un crédito que tiene transacciones vinculadas')
    const batch = writeBatch(db)
    batch.delete(doc(db, 'credits', id))
    await batch.commit()
  }

  // ── Expenses ───────────────────────────────────────────────────────────────
  async function addExpense(data) {
    const error = validateExpense(data)
    if (error) throw new Error(error)
    const ref = doc(collection(db, 'expenses'))
    const batch = writeBatch(db)
    batch.set(ref, {
      title: data.title,
      budget: Number(data.budget ?? 0),
      createdAt: serverTimestamp(),
    })
    await batch.commit()
    return ref.id
  }

  async function updateExpense(id, data) {
    const error = validateExpense(data)
    if (error) throw new Error(error)
    const batch = writeBatch(db)
    batch.update(doc(db, 'expenses', id), { title: data.title, budget: Number(data.budget ?? 0) })
    await batch.commit()
  }

  async function removeExpense(id) {
    const { incomes, credits, transactions } = useFinanceStore.getState()
    const expenseTransactions = transactions.filter((t) => t.expenseId === id)
    const reversals = computeExpenseDeleteReversals(expenseTransactions, incomes, credits)
    const batch = writeBatch(db)
    batch.delete(doc(db, 'expenses', id))
    expenseTransactions.forEach((t) => batch.delete(doc(db, 'transactions', t.id)))
    reversals.forEach((r) => applySourceUpdate(batch, r))
    await batch.commit()
  }

  // ── Transactions ───────────────────────────────────────────────────────────
  async function addTransaction(data) {
    const { incomes, credits, expenses } = useFinanceStore.getState()
    const expense = expenses.find((e) => e.id === data.expenseId)
    if (!expense) throw new Error('Gasto no encontrado')
    const payload = { ...data, amount: Number(data.amount) }
    const error = validateTransaction(payload, incomes, credits)
    if (error) throw new Error(error)
    const sideEffect = computeTransactionSideEffects(payload, incomes, credits)
    const transRef = doc(collection(db, 'transactions'))
    const batch = writeBatch(db)
    batch.set(transRef, {
      expenseId: payload.expenseId,
      amount: payload.amount,
      sourceId: payload.sourceId,
      sourceType: payload.sourceType,
      createdAt: serverTimestamp(),
    })
    applySourceUpdate(batch, sideEffect)
    await batch.commit()
    return transRef.id
  }

  async function removeTransaction(id) {
    const { incomes, credits, transactions } = useFinanceStore.getState()
    const transaction = transactions.find((t) => t.id === id)
    if (!transaction) throw new Error('Transacción no encontrada')
    const reversal = computeTransactionReversal(transaction, incomes, credits)
    const batch = writeBatch(db)
    batch.delete(doc(db, 'transactions', id))
    applySourceUpdate(batch, reversal)
    await batch.commit()
  }

  // ── Portfolios (agrupa ingresos, sin mover dinero) ─────────────────────────
  async function addPortfolio(data) {
    const error = validatePortfolio(data)
    if (error) throw new Error(error)
    const ref = doc(collection(db, 'portfolios'))
    const batch = writeBatch(db)
    batch.set(ref, {
      title: data.title,
      linkedEntities: data.linkedEntities ?? [],
      createdAt: serverTimestamp(),
    })
    await batch.commit()
    return ref.id
  }

  async function updatePortfolio(id, data) {
    const error = validatePortfolio(data)
    if (error) throw new Error(error)
    const batch = writeBatch(db)
    batch.update(doc(db, 'portfolios', id), {
      title: data.title,
      linkedEntities: data.linkedEntities ?? [],
    })
    await batch.commit()
  }

  async function removePortfolio(id) {
    const batch = writeBatch(db)
    batch.delete(doc(db, 'portfolios', id))
    await batch.commit()
  }

  // ── Savings (monto manual, sin side-effects) ───────────────────────────────
  async function addSavings(data) {
    const error = validateSavings(data)
    if (error) throw new Error(error)
    const ref = doc(collection(db, 'savings'))
    const batch = writeBatch(db)
    batch.set(ref, {
      title: data.title,
      amount: Number(data.amount),
      createdAt: serverTimestamp(),
    })
    await batch.commit()
    return ref.id
  }

  async function updateSavings(id, data) {
    const error = validateSavings(data)
    if (error) throw new Error(error)
    const batch = writeBatch(db)
    batch.update(doc(db, 'savings', id), {
      title: data.title,
      amount: Number(data.amount),
    })
    await batch.commit()
  }

  async function removeSavings(id) {
    const batch = writeBatch(db)
    batch.delete(doc(db, 'savings', id))
    await batch.commit()
  }

  // ── Reset Entities (End of month) ──────────────────────────────────────────
  async function resetEntities(entitiesToReset) {
    const { incomes, credits, transactions } = useFinanceStore.getState()
    const batch = writeBatch(db)

    for (const { id, type } of entitiesToReset) {
      if (type === 'expense') {
        const expenseTxs = transactions.filter((t) => t.expenseId === id)
        expenseTxs.forEach((t) => batch.delete(doc(db, 'transactions', t.id)))
      } else if (type === 'income') {
        const inc = incomes.find(i => i.id === id)
        if (inc && inc.initialAmount !== undefined) {
          batch.update(doc(db, 'incomes', id), { amount: inc.initialAmount })
        }
      } else if (type === 'credit') {
        const crd = credits.find(c => c.id === id)
        if (crd && crd.limit !== undefined) {
          batch.update(doc(db, 'credits', id), { used: 0, available: crd.limit })
        }
      } else if (type === 'savings') {
        batch.update(doc(db, 'savings', id), { amount: 0 })
      }
    }
    
    await batch.commit()
  }

  return {
    addIncome,      updateIncome,     removeIncome,
    addCredit,      updateCredit,     removeCredit,
    addExpense,     updateExpense,    removeExpense,
    addTransaction,                   removeTransaction,
    addPortfolio,   updatePortfolio,  removePortfolio,
    addSavings,     updateSavings,    removeSavings,
    resetEntities,
  }
}
