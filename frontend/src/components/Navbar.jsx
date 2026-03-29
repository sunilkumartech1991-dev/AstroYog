import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Navbar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="bg-primary-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold">
            ✨ AstroYog
          </Link>

          <div className="hidden md:flex space-x-6 items-center">
            <Link to="/astrologers" className="hover:text-primary-200">
              Astrologers
            </Link>
            <Link to="/daily-horoscope" className="hover:text-primary-200">
              Daily Horoscope
            </Link>
            <Link to="/kundli" className="hover:text-primary-200">
              Kundli
            </Link>

            {user ? (
              <>
                <Link to="/dashboard" className="hover:text-primary-200">
                  Dashboard
                </Link>
                <Link to="/consultations" className="hover:text-primary-200">
                  My Consultations
                </Link>
                <Link to="/wallet" className="hover:text-primary-200">
                  Wallet: ₹{user.wallet_balance}
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-white text-primary-600 px-4 py-2 rounded-lg hover:bg-primary-100"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="hover:text-primary-200"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-white text-primary-600 px-4 py-2 rounded-lg hover:bg-primary-100"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
