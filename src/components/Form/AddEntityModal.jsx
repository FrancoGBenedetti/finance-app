import { useEffect } from 'react'
import IncomeForm from './IncomeForm.jsx'
import CreditForm from './CreditForm.jsx'
import ExpenseForm from './ExpenseForm.jsx'
import SavingsForm from './SavingsForm.jsx'

const FORM_MAP = {
  income: IncomeForm,
  credit: CreditForm,
  expense: ExpenseForm,
  savings: SavingsForm,
}

const TITLES = {
  income: 'New Income',
  credit: 'New Credit',
  expense: 'New Expense',
  savings: 'New Savings',
}

export default function AddEntityModal({ type, onClose }) {
  const FormComponent = FORM_MAP[type]

  // Close on Escape key
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  if (!FormComponent) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-white">{TITLES[type]}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white transition-colors text-xl leading-none"
          >
            ×
          </button>
        </div>
        <FormComponent onClose={onClose} />
      </div>
    </div>
  )
}
