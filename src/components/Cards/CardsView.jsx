import { useFinanceStore } from '../../store/useFinanceStore.js'
import IncomeCard from './IncomeCard.jsx'
import ExpenseCard from './ExpenseCard.jsx'
import CreditCard from './CreditCard.jsx'
import SavingsCard from './SavingsCard.jsx'

function Section({ title, children, empty }) {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">{title}</h2>
      {children}
      {empty && (
        <p className="text-gray-600 text-sm italic">No {title.toLowerCase()} yet.</p>
      )}
    </div>
  )
}

export default function CardsView() {
  const incomes = useFinanceStore((s) => s.incomes)
  const expenses = useFinanceStore((s) => s.expenses)
  const credits = useFinanceStore((s) => s.credits)
  const savings = useFinanceStore((s) => s.savings)

  return (
    <div className="flex flex-col gap-8 p-6 max-w-7xl mx-auto">
      <Section title="Incomes" empty={incomes.length === 0}>
        <div className="flex flex-wrap gap-4">
          {incomes.map((i) => <IncomeCard key={i.id} income={i} />)}
        </div>
      </Section>

      <Section title="Credits" empty={credits.length === 0}>
        <div className="flex flex-wrap gap-4">
          {credits.map((c) => <CreditCard key={c.id} credit={c} />)}
        </div>
      </Section>

      <Section title="Expenses" empty={expenses.length === 0}>
        <div className="flex flex-wrap gap-4">
          {expenses.map((e) => <ExpenseCard key={e.id} expense={e} />)}
        </div>
      </Section>

      <Section title="Savings" empty={savings.length === 0}>
        <div className="flex flex-wrap gap-4">
          {savings.map((s) => <SavingsCard key={s.id} savings={s} />)}
        </div>
      </Section>
    </div>
  )
}
