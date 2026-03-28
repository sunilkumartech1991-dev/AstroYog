import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import astrologerService from '../services/astrologerService'

const AstrologerList = () => {
  const [astrologers, setAstrologers] = useState([])
  const [specializations, setSpecializations] = useState([])
  const [filters, setFilters] = useState({
    is_available: '',
    specialization: '',
    language: '',
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSpecializations()
    fetchAstrologers()
  }, [filters])

  const fetchSpecializations = async () => {
    try {
      const response = await astrologerService.getSpecializations()
      setSpecializations(response.data)
    } catch (error) {
      console.error('Error fetching specializations:', error)
    }
  }

  const fetchAstrologers = async () => {
    setLoading(true)
    try {
      const params = {}
      if (filters.is_available) params.is_available = filters.is_available
      if (filters.specialization) params.specialization = filters.specialization
      if (filters.language) params.language = filters.language

      const response = await astrologerService.getAstrologers(params)
      setAstrologers(response.data.results || response.data)
    } catch (error) {
      console.error('Error fetching astrologers:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Our Astrologers</h1>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-lg font-semibold mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select
            value={filters.is_available}
            onChange={(e) => setFilters({ ...filters, is_available: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-md"
          >
            <option value="">All Availability</option>
            <option value="true">Available Now</option>
          </select>

          <select
            value={filters.specialization}
            onChange={(e) => setFilters({ ...filters, specialization: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-md"
          >
            <option value="">All Specializations</option>
            {specializations.map((spec) => (
              <option key={spec.id} value={spec.slug}>
                {spec.name}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Search by language..."
            value={filters.language}
            onChange={(e) => setFilters({ ...filters, language: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-md"
          />
        </div>
      </div>

      {/* Astrologer Grid */}
      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {astrologers.map((astrologer) => (
            <div key={astrologer.id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
              <Link to={`/astrologers/${astrologer.id}`}>
                <div className="text-center">
                  <div className="relative">
                    <img
                      src={astrologer.user_profile_image || '/avatar-placeholder.png'}
                      alt={astrologer.display_name}
                      className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                    />
                    {astrologer.is_available && (
                      <span className="absolute top-0 right-1/4 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></span>
                    )}
                  </div>
                  <h3 className="font-semibold text-lg mb-1">{astrologer.display_name}</h3>
                  <div className="flex items-center justify-center mb-2">
                    <span className="text-yellow-500">⭐</span>
                    <span className="ml-1">{astrologer.average_rating}</span>
                    <span className="text-gray-500 text-sm ml-1">
                      ({astrologer.total_reviews})
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {astrologer.experience_years} years exp.
                  </p>
                  <p className="text-xs text-gray-500 mb-3 truncate">
                    {astrologer.specializations?.join(', ')}
                  </p>
                  <div className="space-y-1">
                    <div className="text-sm">
                      <span className="text-gray-600">Chat:</span>{' '}
                      <span className="font-semibold text-primary-600">
                        ₹{astrologer.chat_price}/min
                      </span>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-600">Call:</span>{' '}
                      <span className="font-semibold text-primary-600">
                        ₹{astrologer.call_price}/min
                      </span>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-600">Video:</span>{' '}
                      <span className="font-semibold text-primary-600">
                        ₹{astrologer.video_price}/min
                      </span>
                    </div>
                  </div>
                  <button className="mt-4 w-full bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700">
                    Consult Now
                  </button>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default AstrologerList
