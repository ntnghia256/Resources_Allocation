import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { MainLayout } from './layouts/MainLayout'
import { Dashboard } from './pages/Dashboard'
import { Employees } from './pages/Employees'
import { Projects } from './pages/Projects'
import { Allocations } from './pages/Allocations'
import { AIConsole } from './pages/AIConsole'
import { useAppStore } from './store/useAppStore'

function App() {
  const { initTheme, fetchInitialData } = useAppStore()

  useEffect(() => {
    // Initialize user theme (Light/Dark Mode)
    initTheme()
    // Load initial employee, project and allocation lists from Backend (falls back to mock data offline)
    fetchInitialData()
  }, [initTheme, fetchInitialData])

  return (
    <Router>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/employees" element={<Employees />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/allocations" element={<Allocations />} />
          <Route path="/ai" element={<AIConsole />} />
          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </MainLayout>
    </Router>
  )
}

export default App
