import { createEntity, updateEntity, deleteEntity, subscribeToEntities } from './config.js'

const COL = 'transactions'

// Transactions are always read-only after creation (immutable events).
// Any "undo" is done via deleteTransaction, which reverses the side-effects.
export const createTransaction = (data) => createEntity(COL, data)
export const deleteTransaction = (id) => deleteEntity(COL, id)
export const subscribeToTransactions = (callback) => subscribeToEntities(COL, callback)
