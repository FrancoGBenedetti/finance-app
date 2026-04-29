/**
 * exportData.js
 * Genera y descarga un archivo CSV con todas las entidades y el historial
 * de transacciones. Compatible con Excel (incluye BOM UTF-8).
 */

function toMs(ts) {
  if (!ts) return 0
  if (typeof ts.toMillis === 'function') return ts.toMillis()
  if (ts.seconds != null) return ts.seconds * 1000
  return new Date(ts).getTime()
}

function fmtDate(ts) {
  const ms = toMs(ts)
  if (!ms) return ''
  return new Intl.DateTimeFormat('es-CL', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  }).format(new Date(ms))
}

/** Escapa un valor para CSV: rodea con comillas si contiene coma, comilla o salto */
function cell(value) {
  const str = String(value ?? '')
  return str.includes(',') || str.includes('"') || str.includes('\n')
    ? `"${str.replace(/"/g, '""')}"`
    : str
}

function toCSVString(rows) {
  return rows.map((row) => row.map(cell).join(',')).join('\r\n')
}

/**
 * Descarga los datos de la app como CSV.
 * @param {{ incomes, expenses, credits, savings, transactions }} storeData
 */
export function downloadCSV({ incomes, expenses, credits, savings, transactions }) {
  const rows = []

  // ── Encabezado de resumen ───────────────────────────────────────────────────
  rows.push(['TIPO', 'TÍTULO', 'MONTO PRINCIPAL', 'PRESUPUESTO', 'FECHA'])

  incomes.forEach((e) => {
    rows.push(['Ingreso', e.title, e.amount ?? 0, '', fmtDate(e.createdAt)])
  })

  expenses.forEach((e) => {
    const totalSpent = transactions
      .filter((t) => t.expenseId === e.id)
      .reduce((sum, t) => sum + (t.amount ?? 0), 0)
    rows.push(['Gasto', e.title, totalSpent, e.budget ?? 0, fmtDate(e.createdAt)])
  })

  credits.forEach((e) => {
    rows.push(['Crédito', e.title, e.available ?? 0, e.limit ?? 0, fmtDate(e.createdAt)])
  })

  savings.forEach((e) => {
    rows.push(['Ahorro', e.title, e.amount ?? 0, '', fmtDate(e.createdAt)])
  })

  // ── Historial de transacciones ──────────────────────────────────────────────
  rows.push([])
  rows.push(['HISTORIAL DE TRANSACCIONES'])
  rows.push(['GASTO', 'MONTO', 'FUENTE', 'TIPO FUENTE', 'FECHA'])

  const sorted = [...transactions].sort((a, b) => toMs(b.createdAt) - toMs(a.createdAt))

  sorted.forEach((tx) => {
    const expenseName = expenses.find((e) => e.id === tx.expenseId)?.title ?? tx.expenseId ?? ''
    const sourceName  =
      tx.sourceType === 'income'
        ? (incomes.find((i) => i.id === tx.sourceId)?.title ?? tx.sourceId ?? '')
        : (credits.find((c) => c.id === tx.sourceId)?.title ?? tx.sourceId ?? '')
    const sourceLabel = tx.sourceType === 'income' ? 'Ingreso' : 'Crédito'
    rows.push([expenseName, tx.amount ?? 0, sourceName, sourceLabel, fmtDate(tx.createdAt)])
  })

  // ── Generar y descargar ─────────────────────────────────────────────────────
  const csv  = '﻿' + toCSVString(rows)          // BOM → Excel abre en UTF-8
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const a    = Object.assign(document.createElement('a'), {
    href:     url,
    download: `moneybox-${new Date().toISOString().slice(0, 10)}.csv`,
  })
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
