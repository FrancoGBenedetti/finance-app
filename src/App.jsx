import { useFinanceData } from './hooks/useFinanceData.js'
import { useFinanceStore } from './store/useFinanceStore.js'
import Header  from './components/Header/Header.jsx'
import Sidebar from './components/shared/Sidebar.jsx'
import TableView from './components/Table/TableView.jsx'
import CardsView from './components/Cards/CardsView.jsx'

function LoadingScreen() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm text-gray-500">Connecting to Firestore…</span>
      </div>
    </div>
  )
}

function ErrorScreen({ message }) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="bg-red-950 border border-red-800 rounded-xl p-6 max-w-md text-center">
        <p className="text-red-400 font-semibold mb-2">Connection error</p>
        <p className="text-gray-400 text-sm">{message}</p>
        <p className="text-gray-600 text-xs mt-3">Check your .env.local Firebase credentials.</p>
      </div>
    </div>
  )
}

export default function App() {
  useFinanceData()

  const loading = useFinanceStore((s) => s.loading)
  const error = useFinanceStore((s) => s.error)
  const activeView = useFinanceStore((s) => s.activeView)

  if (error) return <ErrorScreen message={error} />
  if (loading) return <LoadingScreen />

  return (
    <div className="min-h-screen flex flex-col">
      <Sidebar />
      <Header />
      <main className="flex-1">
        {activeView === 'table' ? <TableView /> : <CardsView />}
      </main>
    </div>
  )
}
