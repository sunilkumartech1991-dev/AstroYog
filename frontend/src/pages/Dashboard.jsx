import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'
import userService from '../services/userService'
import Modal from '../components/Modal'

const Dashboard = () => {
  const { user, setUser } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [profileData, setProfileData] = useState({
    first_name: '',
    last_name: '',
    phone_number: '',
    date_of_birth: '',
    time_of_birth: '',
    place_of_birth: '',
    gender: '',
    city: '',
    state: '',
    country: 'India'
  })
  const [modal, setModal] = useState({
    show: false,
    title: '',
    message: '',
    type: 'info',
    onClose: null
  })

  useEffect(() => {
    if (user) {
      setProfileData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        phone_number: user.phone_number || '',
        date_of_birth: user.date_of_birth || '',
        time_of_birth: user.time_of_birth || '',
        place_of_birth: user.place_of_birth || '',
        gender: user.gender || '',
        city: user.city || '',
        state: user.state || '',
        country: user.country || 'India'
      })
    }
  }, [user])

  const showModal = (title, message, type = 'info', onClose = null) => {
    setModal({ show: true, title, message, type, onClose })
  }

  const closeModal = () => {
    const onClose = modal.onClose
    setModal({ show: false, title: '', message: '', type: 'info', onClose: null })
    if (onClose) onClose()
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      const response = await userService.updateProfile(profileData)
      setUser(response.data)
      setEditing(false)
      showModal('Success', 'Profile updated successfully!', 'success')
    } catch (error) {
      console.error('Error updating profile:', error)
      showModal('Error', 'Failed to update profile. Please try again.', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Dashboard</h1>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'profile'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Profile Settings
            </button>
          </nav>
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <>
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Welcome, {user?.first_name || user?.username}!</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-2">Wallet Balance</h3>
              <p className="text-3xl font-bold text-primary-600">₹{user?.wallet_balance || '0.00'}</p>
              <Link to="/wallet" className="text-primary-600 text-sm hover:underline">
                Recharge Wallet →
              </Link>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-2">My Consultations</h3>
              <p className="text-3xl font-bold">0</p>
              <Link to="/bookings" className="text-primary-600 text-sm hover:underline">
                View History →
              </Link>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-2">My Kundlis</h3>
              <p className="text-3xl font-bold">0</p>
              <Link to="/kundli" className="text-primary-600 text-sm hover:underline">
                View Kundlis →
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
        </>
      )}

      {/* Profile Settings Tab */}
      {activeTab === 'profile' && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Profile Settings</h2>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
              >
                Edit Profile
              </button>
            )}
          </div>

          <form onSubmit={handleProfileUpdate}>
            {/* Basic Information */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4 pb-2 border-b">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="first_name"
                    value={profileData.first_name}
                    onChange={handleInputChange}
                    disabled={!editing}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="last_name"
                    value={profileData.last_name}
                    onChange={handleInputChange}
                    disabled={!editing}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email (Read-only)
                  </label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number (Read-only)
                  </label>
                  <input
                    type="tel"
                    value={user?.phone_number || ''}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gender
                  </label>
                  <select
                    name="gender"
                    value={profileData.gender}
                    onChange={handleInputChange}
                    disabled={!editing}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Birth Details */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4 pb-2 border-b">Birth Details (for Astrology)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    name="date_of_birth"
                    value={profileData.date_of_birth}
                    onChange={handleInputChange}
                    disabled={!editing}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Time of Birth
                  </label>
                  <input
                    type="time"
                    name="time_of_birth"
                    value={profileData.time_of_birth}
                    onChange={handleInputChange}
                    disabled={!editing}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Place of Birth
                  </label>
                  <input
                    type="text"
                    name="place_of_birth"
                    value={profileData.place_of_birth}
                    onChange={handleInputChange}
                    disabled={!editing}
                    placeholder="City, State, Country"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100"
                  />
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg mt-4">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> Accurate birth details (date, time, and place) are essential for
                  generating precise Kundli and receiving accurate astrological predictions.
                </p>
              </div>
            </div>

            {/* Location */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4 pb-2 border-b">Current Location</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={profileData.city}
                    onChange={handleInputChange}
                    disabled={!editing}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={profileData.state}
                    onChange={handleInputChange}
                    disabled={!editing}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={profileData.country}
                    onChange={handleInputChange}
                    disabled={!editing}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {editing && (
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditing(false)
                    // Reset form data to original user data
                    setProfileData({
                      first_name: user.first_name || '',
                      last_name: user.last_name || '',
                      phone_number: user.phone_number || '',
                      date_of_birth: user.date_of_birth || '',
                      time_of_birth: user.time_of_birth || '',
                      place_of_birth: user.place_of_birth || '',
                      gender: user.gender || '',
                      city: user.city || '',
                      state: user.state || '',
                      country: user.country || 'India'
                    })
                  }}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
              </div>
            )}
          </form>

          {/* Account Information */}
          <div className="mt-8 pt-6 border-t">
            <h3 className="text-lg font-semibold mb-4">Account Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Username</p>
                <p className="font-semibold">{user?.username}</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Referral Code</p>
                <p className="font-semibold">{user?.referral_code || 'N/A'}</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Member Since</p>
                <p className="font-semibold">
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Account Type</p>
                <p className="font-semibold capitalize">{user?.user_type || 'Customer'}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <Modal
        show={modal.show}
        onClose={closeModal}
        title={modal.title}
        message={modal.message}
        type={modal.type}
      />
    </div>
  )
}

export default Dashboard
