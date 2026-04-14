import { createEntity, updateEntity, deleteEntity, subscribeToEntities } from './config.js'

const COL = 'incomes'

export const createIncome = (data) => createEntity(COL, data)
export const updateIncome = (id, data) => updateEntity(COL, id, data)
export const deleteIncome = (id) => deleteEntity(COL, id)
export const subscribeToIncomes = (callback) => subscribeToEntities(COL, callback)
