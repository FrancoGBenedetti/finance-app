import { db } from '../firebase/config.js'
import {
  writeBatch,
  doc,
  collection,
  serverTimestamp,
} from 'firebase/firestore'
import { useFinanceStore } from '../store/useFinanceStore.js'
import {
  validateExpense,
  validateExpenseUpdate,
  validateIncome,
  validateCredit,
  validateSavings,
  computeExpenseSideEffects,
  computeExpenseUpdateSideEffects,
  computeExpenseDeleteReversal,
} from '../utils/financialRules.js'

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

export function useTransactions() {
  // ─── Incomes ────────────────────────────────────────────────────────────────
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
    batch.update(doc(db, 'incomes', id), {
      title: data.title,
      amount: Number(data.amount),
    })
    await batch.commit()
  }

  async function removeIncome(id) {
    // Check if any expense uses this income
    const { expenses } = useFinanceStore.getState()
    const linked = expenses.filter((e) => e.sourceId === id && e.sourceType === 'income')
    if (linked.length > 0) throw new Error('Cannot delete income that has linked expenses')

    const batch = writeBatch(db)
    batch.delete(doc(db, 'incomes', id))
    await batch.commit()
  }

  // ─── Credits ────────────────────────────────────────────────────────────────
  async function addCredit(data) {
    const error = validateCredit(data)
    if (error) throw new Error(error)

    const limit = Number(data.limit)
    const ref = doc(collection(db, 'credits'))
    const batch = writeBatch(db)
    batch.set(ref, {
      title: data.title,
      limit,
      used: 0,
      available: limit,
      createdAt: serverTimestamp(),
    })
    await batch.commit()
    return ref.id
  }

  async function updateCredit(id, data) {
    const error = validateCredit(data)
    if (error) throw new Error(error)

    const { credits } = useFinanceStore.getState()
    const existing = credits.find((c) => c.id === id)
    const newLimit = Number(data.limit)
    const used = existing?.used ?? 0
    const available = newLimit - used

    const batch = writeBatch(db)
    batch.update(doc(db, 'credits', id), {
      title: data.title,
      limit: newLimit,
      available,
    })
    await batch.commit()
  }

  async function removeCredit(id) {
    const { expenses } = useFinanceStore.getState()
    const linked = expenses.filter((e) => e.sourceId === id && e.sourceType === 'credit')
    if (linked.length > 0) throw new Error('Cannot delete credit that has linked expenses')

    const batch = writeBatch(db)
    batch.delete(doc(db, 'credits', id))
    await batch.commit()
  }

  // ─── Expenses ───────────────────────────────────────────────────────────────
  async function addExpense(data) {
    const { incomes, credits } = useFinanceStore.getState()
    const payload = { ...data, spent: Number(data.spent), budget: Number(data.budget ?? 0) }

    const error = validateExpense(payload, incomes, credits)
    if (error) throw new Error(error)

    const sideEffect = computeExpenseSideEffects(payload, incomes, credits)

    const ref = doc(collection(db, 'expenses'))
    const batch = writeBatch(db)
    batch.set(ref, {
      title: payload.title,
      spent: payload.spent,
      budget: payload.budget,
      sourceId: payload.sourceId,
      sourceType: payload.sourceType,
      createdAt: serverTimestamp(),
    })
    applySourceUpdate(batch, sideEffect)
    await batch.commit()
    return ref.id
  }

  async function updateExpense(id, newData) {
    const { incomes, credits, expenses } = useFinanceStore.getState()
    const oldExpense = expenses.find((e) => e.id === id)
    if (!oldExpense) throw new Error('Expense not found')

    const newSpent = Number(newData.spent ?? oldExpense.spent)
    const error = validateExpenseUpdate(oldExpense, newSpent, incomes, credits)
    if (error) throw new Error(error)

    const sideEffect = computeExpenseUpdateSideEffects(oldExpense, newSpent, incomes, credits)

    const batch = writeBatch(db)
    batch.update(doc(db, 'expenses', id), {
      title: newData.title ?? oldExpense.title,
      spent: newSpent,
      budget: Number(newData.budget ?? oldExpense.budget),
    })
    applySourceUpdate(batch, sideEffect)
    await batch.commit()
  }

  async function removeExpense(id) {
    const { incomes, credits, expenses } = useFinanceStore.getState()
    const expense = expenses.find((e) => e.id === id)
    if (!expense) throw new Error('Expense not found')

    const reversal = computeExpenseDeleteReversal(expense, incomes, credits)

    const batch = writeBatch(db)
    batch.delete(doc(db, 'expenses', id))
    applySourceUpdate(batch, reversal)
    await batch.commit()
  }

  // ─── Savings ────────────────────────────────────────────────────────────────
  async function addSavings(data) {
    const error = validateSavings(data)
    if (error) throw new Error(error)

    const ref = doc(collection(db, 'savings'))
    const batch = writeBatch(db)
    batch.set(ref, {
      title: data.title,
      linkedIncomeIds: data.linkedIncomeIds ?? [],
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
      linkedIncomeIds: data.linkedIncomeIds ?? [],
    })
    await batch.commit()
  }

  async function removeSavings(id) {
    const batch = writeBatch(db)
    batch.delete(doc(db, 'savings', id))
    await batch.commit()
  }

  return {
    addIncome, updateIncome, removeIncome,
    addCredit, updateCredit, removeCredit,
    addExpense, updateExpense, removeExpense,
    addSavings, updateSavings, removeSavings,
  }
}
