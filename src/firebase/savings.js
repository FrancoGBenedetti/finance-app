/**
 * Ahorro manual — monto asignado directamente por el usuario.
 * No está ligado a ningún ingreso ni crédito.
 * Colección Firestore: "savings"
 */
import { createEntity, updateEntity, deleteEntity, subscribeToEntities } from './config.js'

const COL = 'savings'

export const createSavings     = (data) => createEntity(COL, data)
export const updateSavings     = (id, data) => updateEntity(COL, id, data)
export const deleteSavings     = (id) => deleteEntity(COL, id)
export const subscribeToSavings = (callback) => subscribeToEntities(COL, callback)
