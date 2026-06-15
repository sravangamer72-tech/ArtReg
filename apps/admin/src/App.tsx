import { Routes, Route, Navigate } from 'react-router-dom'
import AdminLayout from './components/AdminLayout'
import DashboardPage from './pages/DashboardPage'
import RegistrationsPage from './pages/RegistrationsPage'
import WorkshopsPage from './pages/WorkshopsPage'
import CheckInPage from './pages/CheckInPage'

export default function App() {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route path="/dashboard"     element={<DashboardPage />} />
        <Route path="/registrations" element={<RegistrationsPage />} />
        <Route path="/workshops"     element={<WorkshopsPage />} />
        <Route path="/checkin"       element={<CheckInPage />} />
      </Route>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
