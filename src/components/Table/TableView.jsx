import { useState } from 'react'
import { useFinanceStore } from '../../store/useFinanceStore.js'
import TableRow from './TableRow.jsx'
import AddRowButton from './AddRowButton.jsx'
import AddEntityModal from '../Form/AddEntityModal.jsx'

function SectionHeader({ label, colSpan = 6 }) {
  return (
    <tr>
      <td
        colSpan={colSpan}
        className="px-4 pt-6 pb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider"
      >
        {label}
      </td>
    </tr>
  )
}

export default function TableView() {
  const incomes = useFinanceStore((s) => s.incomes)
  const expenses = useFinanceStore((s) => s.expenses)
  const credits = useFinanceStore((s) => s.credits)
  const savings = useFinanceStore((s) => s.savings)

  const [modal, setModal] = useState(null) // entity type string or null

  return (
    <>
      <div className="p-4 max-w-7xl mx-auto overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="px-4 py-3 text-left text-xs text-gray-500 font-medium w-24">Type</th>
              <th className="px-4 py-3 text-left text-xs text-gray-500 font-medium">Title</th>
              <th className="px-4 py-3 text-left text-xs text-gray-500 font-medium">Info</th>
              <th className="px-4 py-3 text-left text-xs text-gray-500 font-medium">Amount</th>
              <th className="px-4 py-3 text-left text-xs text-gray-500 font-medium">Budget / Limit</th>
              <th className="px-4 py-3 w-24" />
            </tr>
          </thead>
          <tbody>
            {/* ─── Incomes ─── */}
            <SectionHeader label="Incomes" />
            {incomes.map((e) => <TableRow key={e.id} entity={e} type="income" />)}
            <AddRowButton type="income" onClick={setModal} />

            {/* ─── Credits ─── */}
            <SectionHeader label="Credits" />
            {credits.map((e) => <TableRow key={e.id} entity={e} type="credit" />)}
            <AddRowButton type="credit" onClick={setModal} />

            {/* ─── Expenses ─── */}
            <SectionHeader label="Expenses" />
            {expenses.map((e) => <TableRow key={e.id} entity={e} type="expense" />)}
            <AddRowButton type="expense" onClick={setModal} />

            {/* ─── Savings ─── */}
            <SectionHeader label="Savings" />
            {savings.map((e) => <TableRow key={e.id} entity={e} type="savings" />)}
            <AddRowButton type="savings" onClick={setModal} />
          </tbody>
        </table>
      </div>

      {modal && <AddEntityModal type={modal} onClose={() => setModal(null)} />}
    </>
  )
}
