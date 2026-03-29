import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { AuthProvider } from './context/AuthContext'
import PrivateRoute from './components/PrivateRoute'

// Pages
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import AstrologerList from './pages/AstrologerList'
import AstrologerDetail from './pages/AstrologerDetail'
import ChatConsultation from './pages/ChatConsultation'
import Dashboard from './pages/Dashboard'
import Wallet from './pages/Wallet'
import Bookings from './pages/Bookings'
import Kundli from './pages/Kundli'
import DailyHoroscope from './pages/DailyHoroscope'
import Consultations from './pages/Consultations'

// Layout
import Navbar from './components/Navbar'
import Footer from './components/Footer'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/astrologers" element={<AstrologerList />} />
              <Route path="/astrologers/:id" element={<AstrologerDetail />} />
              <Route path="/daily-horoscope" element={<DailyHoroscope />} />

              {/* Private Routes */}
              <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
              <Route path="/consultations" element={<PrivateRoute><Consultations /></PrivateRoute>} />
              <Route path="/chat/:consultationId" element={<PrivateRoute><ChatConsultation /></PrivateRoute>} />
              <Route path="/wallet" element={<PrivateRoute><Wallet /></PrivateRoute>} />
              <Route path="/bookings" element={<PrivateRoute><Bookings /></PrivateRoute>} />
              <Route path="/kundli" element={<PrivateRoute><Kundli /></PrivateRoute>} />
            </Routes>
          </main>
          <Footer />
        </div>
        <ToastContainer position="top-right" autoClose={3000} />
      </Router>
    </AuthProvider>
  )
}

export default App
