import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import AdminLayout from './components/AdminLayout'
import DashboardPage from './pages/DashboardPage'
import RegistrationsPage from './pages/RegistrationsPage'
import WorkshopsPage from './pages/WorkshopsPage'
import CheckInPage from './pages/CheckInPage'
import LoginPage from './pages/LoginPage'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth()
  
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-8 h-8 border-2 border-ocean border-t-transparent rounded-full animate-spin" />
    </div>
  )
  
  if (!session) return <Navigate to="/login" replace />
  return <>{children}</>
}

export default function App() {
  const { session, loading } = useAuth()

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-8 h-8 border-2 border-ocean border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <Routes>
      <Route path="/login" element={session ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
      <Route element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
        <Route path="/dashboard"     element={<DashboardPage />} />
        <Route path="/registrations" element={<RegistrationsPage />} />
        <Route path="/workshops"     element={<WorkshopsPage />} />
        <Route path="/check-in"      element={<CheckInPage />} />
      </Route>
      <Route path="/"  element={<Navigate to="/dashboard" replace />} />
      <Route path="*"  element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}