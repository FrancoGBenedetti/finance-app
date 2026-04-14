import { createEntity, updateEntity, deleteEntity, subscribeToEntities } from './config.js'

const COL = 'expenses'

// NOTE: No cross-entity logic here. All side-effects (income/credit updates)
// are handled atomically in useTransactions via writeBatch.
export const createExpense = (data) => createEntity(COL, data)
export const updateExpense = (id, data) => updateEntity(COL, id, data)
export const deleteExpense = (id) => deleteEntity(COL, id)
export const subscribeToExpenses = (callback) => subscribeToEntities(COL, callback)
