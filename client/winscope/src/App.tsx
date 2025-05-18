import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Dashboard } from './components/Dashboard'
import LoginPage from './pages/Login'
import Home from './pages/Home'
import { SignupPage } from './pages/Signup'
import PlayerPage from './pages/player/[id]/page'
import { ReactNode } from 'react'

function PrivateRoute({ children }: { children: ReactNode }) {
  const token = localStorage.getItem('token')
  return token ? children : <Navigate to="/login" />
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/player/:id" element={<PrivateRoute><PlayerPage /></PrivateRoute>} />
      </Routes>
    </Router>
  )
}

export default App
