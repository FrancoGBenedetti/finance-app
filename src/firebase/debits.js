import { createEntity, updateEntity, deleteEntity, subscribeToEntities } from './config.js'

const COL = 'debits'

export const createDebit      = (data) => createEntity(COL, data)
export const updateDebit      = (id, data) => updateEntity(COL, id, data)
export const deleteDebit      = (id) => deleteEntity(COL, id)
export const subscribeToDebits = (callback) => subscribeToEntities(COL, callback)
