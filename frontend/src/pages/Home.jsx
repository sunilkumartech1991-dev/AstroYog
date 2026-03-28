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
      setFeaturedAstrologers(response.data)
    } catch (error) {
      console.error('Error fetching featured astrologers:', error)
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
          <h2 className="text-3xl font-bold text-center mb-12">
            Featured Astrologers
          </h2>
          {loading ? (
            <div className="text-center">Loading...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {featuredAstrologers.slice(0, 8).map((astrologer) => (
                <Link
                  key={astrologer.id}
                  to={`/astrologers/${astrologer.id}`}
                  className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition"
                >
                  <div className="text-center">
                    <img
                      src={astrologer.user_profile_image || '/avatar-placeholder.png'}
                      alt={astrologer.display_name}
                      className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                    />
                    <h3 className="font-semibold text-lg mb-1">
                      {astrologer.display_name}
                    </h3>
                    <div className="flex items-center justify-center mb-2">
                      <span className="text-yellow-500">⭐</span>
                      <span className="ml-1">{astrologer.average_rating}</span>
                      <span className="text-gray-500 text-sm ml-1">
                        ({astrologer.total_reviews})
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      {astrologer.experience_years} years exp.
                    </p>
                    <div className="text-sm font-semibold text-primary-600">
                      ₹{astrologer.chat_price}/min
                    </div>
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
