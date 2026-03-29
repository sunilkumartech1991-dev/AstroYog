import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import horoscopeService from '../services/horoscopeService'
import userService from '../services/userService'
import Modal from '../components/Modal'

const Kundli = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('generate')
  const [kundlis, setKundlis] = useState([])
  const [selectedKundli, setSelectedKundli] = useState(null)
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [user, setUser] = useState(null)
  const [modal, setModal] = useState({
    show: false,
    title: '',
    message: '',
    type: 'info',
    onClose: null
  })

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    date_of_birth: '',
    time_of_birth: '',
    place_of_birth: '',
    latitude: '',
    longitude: '',
    timezone: 'Asia/Kolkata'
  })

  useEffect(() => {
    fetchUserProfile()
    fetchKundlis()
  }, [])

  const showModal = (title, message, type = 'info', onClose = null) => {
    setModal({ show: true, title, message, type, onClose })
  }

  const closeModal = () => {
    const onClose = modal.onClose
    setModal({ show: false, title: '', message: '', type: 'info', onClose: null })
    if (onClose) onClose()
  }

  const fetchUserProfile = async () => {
    try {
      const response = await userService.getProfile()
      setUser(response.data)

      // Pre-fill form with user data if available
      if (response.data) {
        setFormData(prev => ({
          ...prev,
          name: response.data.first_name && response.data.last_name
            ? `${response.data.first_name} ${response.data.last_name}`
            : response.data.username,
          date_of_birth: response.data.date_of_birth || '',
          time_of_birth: response.data.time_of_birth || '',
          place_of_birth: response.data.place_of_birth || ''
        }))
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
      if (error.response?.status === 401) {
        navigate('/login?redirect=/kundli')
      }
    }
  }

  const fetchKundlis = async () => {
    try {
      setLoading(true)
      const response = await horoscopeService.getKundlis()
      setKundlis(Array.isArray(response.data) ? response.data : [])
    } catch (error) {
      console.error('Error fetching kundlis:', error)
      if (error.response?.status === 401) {
        navigate('/login?redirect=/kundli')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handlePlaceSearch = async () => {
    // Simplified geocoding - in production, use Google Maps Geocoding API
    if (formData.place_of_birth) {
      // For demo, set some default coordinates
      // In production, you'd use a geocoding service
      showModal('Info', 'In production, this would use a geocoding service to get coordinates. For now, please enter coordinates manually.', 'info')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.name || !formData.date_of_birth || !formData.time_of_birth ||
        !formData.place_of_birth || !formData.latitude || !formData.longitude) {
      showModal('Error', 'Please fill in all required fields', 'error')
      return
    }

    try {
      setGenerating(true)
      const response = await horoscopeService.generateKundli(formData)

      showModal('Success', 'Kundli generated successfully!', 'success')

      // Refresh kundli list
      await fetchKundlis()

      // Switch to saved kundlis tab and view the new one
      setActiveTab('saved')
      setSelectedKundli(response.data.kundli)

      // Reset form
      setFormData({
        name: user?.first_name && user?.last_name
          ? `${user.first_name} ${user.last_name}`
          : user?.username || '',
        date_of_birth: '',
        time_of_birth: '',
        place_of_birth: '',
        latitude: '',
        longitude: '',
        timezone: 'Asia/Kolkata'
      })
    } catch (error) {
      console.error('Error generating kundli:', error)
      showModal('Error', error.response?.data?.error || 'Failed to generate Kundli. Please try again.', 'error')
    } finally {
      setGenerating(false)
    }
  }

  const handleDeleteKundli = async (kundliId) => {
    if (!confirm('Are you sure you want to delete this Kundli?')) return

    try {
      await horoscopeService.deleteKundli(kundliId)
      showModal('Success', 'Kundli deleted successfully', 'success')
      await fetchKundlis()
      if (selectedKundli?.id === kundliId) {
        setSelectedKundli(null)
      }
    } catch (error) {
      console.error('Error deleting kundli:', error)
      showModal('Error', 'Failed to delete Kundli. Please try again.', 'error')
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Kundli / Birth Chart</h1>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px space-x-8">
            <button
              onClick={() => setActiveTab('generate')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'generate'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Generate New Kundli
            </button>
            <button
              onClick={() => setActiveTab('saved')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'saved'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              My Kundlis ({kundlis.length})
            </button>
          </nav>
        </div>
      </div>

      {/* Generate Kundli Tab */}
      {activeTab === 'generate' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Enter Birth Details</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Birth *
                </label>
                <input
                  type="date"
                  name="date_of_birth"
                  value={formData.date_of_birth}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time of Birth *
                </label>
                <input
                  type="time"
                  name="time_of_birth"
                  value={formData.time_of_birth}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Timezone
                </label>
                <select
                  name="timezone"
                  value={formData.timezone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                  <option value="America/New_York">America/New_York (EST)</option>
                  <option value="America/Los_Angeles">America/Los_Angeles (PST)</option>
                  <option value="Europe/London">Europe/London (GMT)</option>
                  <option value="Australia/Sydney">Australia/Sydney (AEST)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Place of Birth *
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  name="place_of_birth"
                  value={formData.place_of_birth}
                  onChange={handleInputChange}
                  placeholder="Enter city, state, country"
                  className="flex-grow px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
                <button
                  type="button"
                  onClick={handlePlaceSearch}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  🔍 Search
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Latitude *
                </label>
                <input
                  type="number"
                  name="latitude"
                  value={formData.latitude}
                  onChange={handleInputChange}
                  step="0.000001"
                  placeholder="e.g., 28.6139"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Longitude *
                </label>
                <input
                  type="number"
                  name="longitude"
                  value={formData.longitude}
                  onChange={handleInputChange}
                  step="0.000001"
                  placeholder="e.g., 77.2090"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> For accurate Kundli generation, please ensure all birth details are correct.
                The time of birth should be as precise as possible. You can use online geocoding tools to find
                exact latitude and longitude of your birth place.
              </p>
            </div>

            <button
              type="submit"
              disabled={generating}
              className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
            >
              {generating ? 'Generating Kundli...' : 'Generate Kundli'}
            </button>
          </form>
        </div>
      )}

      {/* Saved Kundlis Tab */}
      {activeTab === 'saved' && (
        <div>
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your Kundlis...</p>
            </div>
          ) : kundlis.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Kundlis Yet</h3>
              <p className="text-gray-600 mb-4">
                You haven't generated any Kundlis yet. Click on "Generate New Kundli" to create one.
              </p>
              <button
                onClick={() => setActiveTab('generate')}
                className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700"
              >
                Generate Your First Kundli
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Kundli List */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="bg-primary-600 text-white p-4">
                    <h3 className="font-semibold">Saved Kundlis</h3>
                  </div>
                  <div className="divide-y">
                    {kundlis.map((kundli) => (
                      <div
                        key={kundli.id}
                        className={`p-4 cursor-pointer hover:bg-gray-50 ${
                          selectedKundli?.id === kundli.id ? 'bg-primary-50' : ''
                        }`}
                        onClick={() => setSelectedKundli(kundli)}
                      >
                        <h4 className="font-semibold text-gray-900">{kundli.name}</h4>
                        <p className="text-sm text-gray-600">
                          {new Date(kundli.date_of_birth).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {kundli.place_of_birth}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Kundli Details */}
              <div className="lg:col-span-2">
                {selectedKundli ? (
                  <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="bg-gradient-to-r from-primary-500 to-primary-700 text-white p-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <h2 className="text-2xl font-bold mb-1">{selectedKundli.name}</h2>
                          <p className="text-primary-100">
                            Born on {new Date(selectedKundli.date_of_birth).toLocaleDateString()} at{' '}
                            {selectedKundli.time_of_birth}
                          </p>
                          <p className="text-primary-100 text-sm">
                            {selectedKundli.place_of_birth}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDeleteKundli(selectedKundli.id)}
                          className="text-white hover:text-red-200"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>

                    <div className="p-6 space-y-6">
                      {/* Basic Info */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-purple-50 p-4 rounded-lg text-center">
                          <p className="text-purple-600 text-sm font-medium mb-1">Sun Sign</p>
                          <p className="text-xl font-bold text-purple-800">{selectedKundli.sun_sign || 'N/A'}</p>
                        </div>
                        <div className="bg-blue-50 p-4 rounded-lg text-center">
                          <p className="text-blue-600 text-sm font-medium mb-1">Moon Sign</p>
                          <p className="text-xl font-bold text-blue-800">{selectedKundli.moon_sign || 'N/A'}</p>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg text-center">
                          <p className="text-green-600 text-sm font-medium mb-1">Ascendant</p>
                          <p className="text-xl font-bold text-green-800">{selectedKundli.ascendant || 'N/A'}</p>
                        </div>
                        <div className="bg-pink-50 p-4 rounded-lg text-center">
                          <p className="text-pink-600 text-sm font-medium mb-1">Nakshatra</p>
                          <p className="text-xl font-bold text-pink-800">{selectedKundli.nakshatra || 'N/A'}</p>
                        </div>
                      </div>

                      {/* Planetary Positions */}
                      {selectedKundli.planetary_positions && Object.keys(selectedKundli.planetary_positions).length > 0 && (
                        <div>
                          <h3 className="text-lg font-bold mb-3">Planetary Positions</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {Object.entries(selectedKundli.planetary_positions).map(([planet, data]) => (
                              <div key={planet} className="border border-gray-200 rounded-lg p-3">
                                <div className="flex justify-between items-center">
                                  <span className="font-semibold capitalize">{planet}</span>
                                  <span className="text-sm text-gray-600">
                                    {typeof data === 'object' ? data.sign || data.position : data}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Houses */}
                      {selectedKundli.houses && Object.keys(selectedKundli.houses).length > 0 && (
                        <div>
                          <h3 className="text-lg font-bold mb-3">Houses</h3>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {Object.entries(selectedKundli.houses).slice(0, 12).map(([house, data]) => (
                              <div key={house} className="border border-gray-200 rounded-lg p-3 text-center">
                                <p className="text-sm text-gray-600">House {house}</p>
                                <p className="font-semibold">
                                  {typeof data === 'object' ? data.sign || data.position : data}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-xs text-gray-600 italic">
                          This Kundli was generated using Vedic astrology principles. For detailed analysis and
                          predictions, please consult with our expert astrologers.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-lg shadow-md p-12 text-center">
                    <div className="text-6xl mb-4">👈</div>
                    <p className="text-gray-600">Select a Kundli from the list to view details</p>
                  </div>
                )}
              </div>
            </div>
          )}
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

export default Kundli
