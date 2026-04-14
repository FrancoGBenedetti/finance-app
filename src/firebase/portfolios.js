/**
 * Portafolio — agrupa ingresos y muestra su suma.
 * No mueve dinero: es solo una vista calculada sobre Income.amount.
 * Colección Firestore: "portfolios"
 */
import { createEntity, updateEntity, deleteEntity, subscribeToEntities } from './config.js'

const COL = 'portfolios'

export const createPortfolio   = (data) => createEntity(COL, data)
export const updatePortfolio   = (id, data) => updateEntity(COL, id, data)
export const deletePortfolio   = (id) => deleteEntity(COL, id)
export const subscribeToPortfolios = (callback) => subscribeToEntities(COL, callback)
