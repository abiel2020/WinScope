import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Dashboard } from './components/Dashboard'
import LoginPage from './pages/Login'
import Home from './pages/Home'
import { SignupPage } from './pages/Signup'
import PlayerPage from './pages/player/[id]/page'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/player/:id" element={<PlayerPage />} />
      </Routes>
    </Router>
  )
}

export default App
