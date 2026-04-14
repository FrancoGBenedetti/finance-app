export default function AddRowButton({ type, onClick }) {
  const labels = {
    income: '+ Add income',
    credit: '+ Add credit',
    expense: '+ Add expense',
    savings: '+ Add savings',
  }

  return (
    <tr>
      <td colSpan={5} className="px-4 py-2">
        <button
          onClick={() => onClick(type)}
          className="text-sm text-gray-500 hover:text-emerald-400 transition-colors"
        >
          {labels[type] ?? `+ Add ${type}`}
        </button>
      </td>
    </tr>
  )
}
