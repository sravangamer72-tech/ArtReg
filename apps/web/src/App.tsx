import { Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import WorkshopDetailPage from './pages/WorkshopDetailPage'
import RegisterPage from './pages/RegisterPage'
import SuccessPage from './pages/SuccessPage'
import WaterCursor from './components/WaterCursor'

export default function App() {
  return (
    <>
      <WaterCursor />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/workshops/:id" element={<WorkshopDetailPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/success/:passId" element={<SuccessPage />} />
      </Routes>
    </>
  )
}
