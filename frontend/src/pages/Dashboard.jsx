import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'

const Dashboard = () => {
  const { user } = useAuth()

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Welcome, {user?.first_name || user?.username}!</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2">Wallet Balance</h3>
          <p className="text-3xl font-bold text-primary-600">₹{user?.wallet_balance}</p>
          <Link to="/wallet" className="text-primary-600 text-sm hover:underline">
            Recharge Wallet →
          </Link>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2">My Consultations</h3>
          <p className="text-3xl font-bold">0</p>
          <Link to="/consultations" className="text-primary-600 text-sm hover:underline">
            View History →
          </Link>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2">My Bookings</h3>
          <p className="text-3xl font-bold">0</p>
          <Link to="/bookings" className="text-primary-600 text-sm hover:underline">
            View Bookings →
          </Link>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/astrologers"
            className="p-4 border-2 border-primary-600 rounded-lg text-center hover:bg-primary-50 transition"
          >
            <div className="text-4xl mb-2">🔮</div>
            <h3 className="font-semibold">Consult Astrologer</h3>
          </Link>

          <Link
            to="/kundli"
            className="p-4 border-2 border-primary-600 rounded-lg text-center hover:bg-primary-50 transition"
          >
            <div className="text-4xl mb-2">📊</div>
            <h3 className="font-semibold">Generate Kundli</h3>
          </Link>

          <Link
            to="/daily-horoscope"
            className="p-4 border-2 border-primary-600 rounded-lg text-center hover:bg-primary-50 transition"
          >
            <div className="text-4xl mb-2">🌟</div>
            <h3 className="font-semibold">Daily Horoscope</h3>
          </Link>

          <Link
            to="/wallet"
            className="p-4 border-2 border-primary-600 rounded-lg text-center hover:bg-primary-50 transition"
          >
            <div className="text-4xl mb-2">💰</div>
            <h3 className="font-semibold">Recharge Wallet</h3>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
