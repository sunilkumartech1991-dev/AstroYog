import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import astrologerService from '../services/astrologerService'

const Home = () => {
  const [featuredAstrologers, setFeaturedAstrologers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFeaturedAstrologers()
  }, [])

  const fetchFeaturedAstrologers = async () => {
    try {
      const response = await astrologerService.getFeaturedAstrologers()
      // Handle paginated response format
      let astrologersData = []
      if (Array.isArray(response.data)) {
        astrologersData = response.data
      } else if (response.data && Array.isArray(response.data.results)) {
        astrologersData = response.data.results
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        astrologersData = response.data.data
      }
      setFeaturedAstrologers(astrologersData)
    } catch (error) {
      console.error('Error fetching featured astrologers:', error)
      setFeaturedAstrologers([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-500 to-primary-700 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">
            Connect with Expert Astrologers
          </h1>
          <p className="text-xl mb-8">
            Get personalized astrology consultations via chat, call, or video
          </p>
          <Link
            to="/astrologers"
            className="bg-white text-primary-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-primary-50"
          >
            Consult Now
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Our Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-white rounded-lg shadow-md">
              <div className="text-5xl mb-4">💬</div>
              <h3 className="text-xl font-semibold mb-2">Chat Consultation</h3>
              <p className="text-gray-600">
                Get instant answers from expert astrologers via chat
              </p>
            </div>
            <div className="text-center p-6 bg-white rounded-lg shadow-md">
              <div className="text-5xl mb-4">📞</div>
              <h3 className="text-xl font-semibold mb-2">Voice Call</h3>
              <p className="text-gray-600">
                Have detailed discussions with astrologers over voice call
              </p>
            </div>
            <div className="text-center p-6 bg-white rounded-lg shadow-md">
              <div className="text-5xl mb-4">📹</div>
              <h3 className="text-xl font-semibold mb-2">Video Call</h3>
              <p className="text-gray-600">
                Face-to-face consultation with experienced Guruji's
              </p>
            </div>
            <div className="text-center p-6 bg-white rounded-lg shadow-md">
              <div className="text-5xl mb-4">📊</div>
              <h3 className="text-xl font-semibold mb-2">Kundli Generation</h3>
              <p className="text-gray-600">
                Get your detailed birth chart and horoscope analysis
              </p>
            </div>
            <div className="text-center p-6 bg-white rounded-lg shadow-md">
              <div className="text-5xl mb-4">🌟</div>
              <h3 className="text-xl font-semibold mb-2">Daily Horoscope</h3>
              <p className="text-gray-600">
                Read your daily predictions and planetary insights
              </p>
            </div>
            <div className="text-center p-6 bg-white rounded-lg shadow-md">
              <div className="text-5xl mb-4">📅</div>
              <h3 className="text-xl font-semibold mb-2">Book Appointments</h3>
              <p className="text-gray-600">
                Schedule consultations at your convenient time
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Astrologers */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-2">
              Online Astrologers
            </h2>
            <p className="text-gray-600">
              Connect instantly with our featured astrologers available now
            </p>
          </div>
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading online astrologers...</p>
            </div>
          ) : featuredAstrologers.length === 0 ? (
            <div className="text-center text-gray-500 py-12">
              <div className="text-5xl mb-4">🔍</div>
              <p className="text-xl font-semibold mb-2">No astrologers online right now</p>
              <p className="text-sm mb-4">All our featured astrologers are currently offline.</p>
              <p className="text-sm text-gray-400 mb-6">Check back soon or explore all astrologers to book a session.</p>
              <Link
                to="/astrologers"
                className="inline-block bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition"
              >
                View All Astrologers
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {featuredAstrologers.slice(0, 8).map((astrologer) => (
                <Link
                  key={astrologer.id}
                  to={`/astrologers/${astrologer.id}`}
                  className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition relative"
                >
                  {/* Online Status Badge */}
                  {astrologer.is_available && (
                    <div className="absolute top-3 right-3">
                      <span className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        Online
                      </span>
                    </div>
                  )}

                  <div className="text-center">
                    {/* Profile Image */}
                    <div className="relative inline-block mb-3">
                      <img
                        src={astrologer.user_profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(astrologer.display_name)}&size=200&background=random&color=fff&bold=true`}
                        alt={astrologer.display_name}
                        className="w-24 h-24 rounded-full mx-auto object-cover border-4 border-primary-100"
                        onError={(e) => {
                          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(astrologer.display_name)}&size=200&background=random&color=fff&bold=true`
                        }}
                      />
                    </div>

                    {/* Name */}
                    <h3 className="font-semibold text-lg mb-1 text-gray-900">
                      {astrologer.display_name}
                    </h3>

                    {/* Specializations */}
                    {astrologer.specializations && astrologer.specializations.length > 0 && (
                      <p className="text-xs text-gray-500 mb-2 line-clamp-1">
                        {astrologer.specializations.join(', ')}
                      </p>
                    )}

                    {/* Rating */}
                    <div className="flex items-center justify-center mb-2">
                      <span className="text-yellow-500">⭐</span>
                      <span className="ml-1 font-semibold">{astrologer.average_rating}</span>
                      <span className="text-gray-500 text-sm ml-1">
                        ({astrologer.total_reviews} reviews)
                      </span>
                    </div>

                    {/* Experience */}
                    <p className="text-sm text-gray-600 mb-3">
                      {astrologer.experience_years} years experience
                    </p>

                    {/* Pricing */}
                    <div className="flex items-center justify-center gap-3 text-xs mb-2">
                      <div className="flex items-center gap-1">
                        <span className="text-gray-500">💬</span>
                        <span className="font-semibold text-primary-600">₹{astrologer.chat_price}/min</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-gray-500">📞</span>
                        <span className="font-semibold text-primary-600">₹{astrologer.call_price}/min</span>
                      </div>
                    </div>

                    {/* Consultation count */}
                    {astrologer.total_consultations > 0 && (
                      <p className="text-xs text-gray-500">
                        {astrologer.total_consultations}+ consultations
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
          <div className="text-center mt-8">
            <Link
              to="/astrologers"
              className="text-primary-600 font-semibold hover:text-primary-700"
            >
              View All Astrologers →
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
