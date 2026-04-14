import { createEntity, updateEntity, deleteEntity, subscribeToEntities } from './config.js'

const COL = 'credits'

export const createCredit = (data) => createEntity(COL, data)
export const updateCredit = (id, data) => updateEntity(COL, id, data)
export const deleteCredit = (id) => deleteEntity(COL, id)
export const subscribeToCredits = (callback) => subscribeToEntities(COL, callback)
