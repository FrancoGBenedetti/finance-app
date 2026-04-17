export default function EntityCard({ children, className = '', onClick }) {
  return (
    <div
      onClick={onClick}
      className={`bg-gray-900 border border-gray-700 rounded-xl p-4 flex flex-col gap-3 ${onClick ? 'cursor-pointer hover:border-gray-600 transition-colors' : ''} ${className}`}
    >
      {children}
    </div>
  )
}
