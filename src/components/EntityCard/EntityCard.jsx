export default function EntityCard({ children, className = '' }) {
  return (
    <div
      className={`bg-gray-900 border border-gray-700 rounded-xl p-4 flex flex-col gap-3 ${className}`}
    >
      {children}
    </div>
  )
}
