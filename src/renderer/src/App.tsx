import { useEffect } from 'react'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from './layout/MainLayout'
import EditorPage from './pages/EditorPage'
import HistoryPage from './pages/HistoryPage'
import SettingsPage from './pages/SettingsPage'
import { useStore } from './lib/store'

function App() {
  const initApiKeys = useStore((s) => s.initApiKeys)

  useEffect(() => {
    initApiKeys()
  }, [initApiKeys])

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Navigate to="/editor" replace />} />
          <Route path="editor" element={<EditorPage />} />
          <Route path="history" element={<HistoryPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}

export default App
