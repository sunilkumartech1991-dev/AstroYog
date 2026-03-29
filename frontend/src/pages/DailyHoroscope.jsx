import { useState, useEffect } from 'react'
import horoscopeService from '../services/horoscopeService'

const DailyHoroscope = () => {
  const [selectedSign, setSelectedSign] = useState(null)
  const [horoscope, setHoroscope] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const zodiacSigns = [
    { name: 'Aries', slug: 'aries', symbol: '♈', emoji: '🐏', dates: 'Mar 21 - Apr 19' },
    { name: 'Taurus', slug: 'taurus', symbol: '♉', emoji: '🐂', dates: 'Apr 20 - May 20' },
    { name: 'Gemini', slug: 'gemini', symbol: '♊', emoji: '👯', dates: 'May 21 - Jun 20' },
    { name: 'Cancer', slug: 'cancer', symbol: '♋', emoji: '🦀', dates: 'Jun 21 - Jul 22' },
    { name: 'Leo', slug: 'leo', symbol: '♌', emoji: '🦁', dates: 'Jul 23 - Aug 22' },
    { name: 'Virgo', slug: 'virgo', symbol: '♍', emoji: '👧', dates: 'Aug 23 - Sep 22' },
    { name: 'Libra', slug: 'libra', symbol: '♎', emoji: '⚖️', dates: 'Sep 23 - Oct 22' },
    { name: 'Scorpio', slug: 'scorpio', symbol: '♏', emoji: '🦂', dates: 'Oct 23 - Nov 21' },
    { name: 'Sagittarius', slug: 'sagittarius', symbol: '♐', emoji: '🏹', dates: 'Nov 22 - Dec 21' },
    { name: 'Capricorn', slug: 'capricorn', symbol: '♑', emoji: '🐐', dates: 'Dec 22 - Jan 19' },
    { name: 'Aquarius', slug: 'aquarius', symbol: '♒', emoji: '🏺', dates: 'Jan 20 - Feb 18' },
    { name: 'Pisces', slug: 'pisces', symbol: '♓', emoji: '🐟', dates: 'Feb 19 - Mar 20' }
  ]

  useEffect(() => {
    if (selectedSign) {
      fetchHoroscope(selectedSign)
    }
  }, [selectedSign])

  const fetchHoroscope = async (signSlug) => {
    try {
      setLoading(true)
      setError(null)
      const response = await horoscopeService.getDailyHoroscope(signSlug)
      setHoroscope(response.data)
    } catch (error) {
      console.error('Error fetching horoscope:', error)
      setError(error.response?.data?.message || 'Failed to load horoscope. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getSignData = (slug) => {
    return zodiacSigns.find(sign => sign.slug === slug)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">Daily Horoscope</h1>
        <p className="text-gray-600">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Zodiac Sign Selector */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-center">Select Your Zodiac Sign</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {zodiacSigns.map((sign) => (
            <button
              key={sign.slug}
              onClick={() => setSelectedSign(sign.slug)}
              className={`p-4 rounded-lg border-2 transition hover:shadow-lg ${
                selectedSign === sign.slug
                  ? 'border-primary-600 bg-primary-50 shadow-md'
                  : 'border-gray-200 hover:border-primary-300'
              }`}
            >
              <div className="text-4xl mb-2">{sign.emoji}</div>
              <div className="font-semibold text-gray-900">{sign.name}</div>
              <div className="text-xs text-gray-500 mt-1">{sign.dates}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Horoscope Display */}
      {selectedSign && (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-500 to-primary-700 text-white p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-6xl mr-4">{getSignData(selectedSign)?.emoji}</span>
                <div>
                  <h2 className="text-3xl font-bold">{getSignData(selectedSign)?.name}</h2>
                  <p className="text-primary-100">{getSignData(selectedSign)?.dates}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-5xl font-bold">{getSignData(selectedSign)?.symbol}</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading your horoscope...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔮</div>
                <p className="text-red-600 text-lg mb-2">{error}</p>
                <button
                  onClick={() => fetchHoroscope(selectedSign)}
                  className="mt-4 bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700"
                >
                  Retry
                </button>
              </div>
            ) : horoscope ? (
              <>
                {/* Lucky Info */}
                {(horoscope.lucky_number || horoscope.lucky_color || horoscope.mood) && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {horoscope.lucky_number && (
                      <div className="bg-purple-50 p-4 rounded-lg text-center">
                        <p className="text-purple-600 text-sm font-medium mb-1">Lucky Number</p>
                        <p className="text-3xl font-bold text-purple-800">{horoscope.lucky_number}</p>
                      </div>
                    )}
                    {horoscope.lucky_color && (
                      <div className="bg-pink-50 p-4 rounded-lg text-center">
                        <p className="text-pink-600 text-sm font-medium mb-1">Lucky Color</p>
                        <div className="flex items-center justify-center gap-2">
                          <div
                            className="w-8 h-8 rounded-full border-2 border-gray-300"
                            style={{ backgroundColor: horoscope.lucky_color.toLowerCase() }}
                          ></div>
                          <p className="text-xl font-bold text-pink-800 capitalize">
                            {horoscope.lucky_color}
                          </p>
                        </div>
                      </div>
                    )}
                    {horoscope.mood && (
                      <div className="bg-blue-50 p-4 rounded-lg text-center">
                        <p className="text-blue-600 text-sm font-medium mb-1">Today's Mood</p>
                        <p className="text-xl font-bold text-blue-800 capitalize">{horoscope.mood}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Horoscope Sections */}
                <div className="space-y-4">
                  {/* General */}
                  <div className="border border-gray-200 rounded-lg p-5">
                    <div className="flex items-center mb-3">
                      <span className="text-2xl mr-2">🌟</span>
                      <h3 className="text-xl font-bold text-gray-900">General</h3>
                    </div>
                    <p className="text-gray-700 leading-relaxed">{horoscope.general}</p>
                  </div>

                  {/* Love */}
                  {horoscope.love && (
                    <div className="border border-gray-200 rounded-lg p-5">
                      <div className="flex items-center mb-3">
                        <span className="text-2xl mr-2">❤️</span>
                        <h3 className="text-xl font-bold text-gray-900">Love & Relationships</h3>
                      </div>
                      <p className="text-gray-700 leading-relaxed">{horoscope.love}</p>
                    </div>
                  )}

                  {/* Career */}
                  {horoscope.career && (
                    <div className="border border-gray-200 rounded-lg p-5">
                      <div className="flex items-center mb-3">
                        <span className="text-2xl mr-2">💼</span>
                        <h3 className="text-xl font-bold text-gray-900">Career & Work</h3>
                      </div>
                      <p className="text-gray-700 leading-relaxed">{horoscope.career}</p>
                    </div>
                  )}

                  {/* Health */}
                  {horoscope.health && (
                    <div className="border border-gray-200 rounded-lg p-5">
                      <div className="flex items-center mb-3">
                        <span className="text-2xl mr-2">🏥</span>
                        <h3 className="text-xl font-bold text-gray-900">Health & Wellness</h3>
                      </div>
                      <p className="text-gray-700 leading-relaxed">{horoscope.health}</p>
                    </div>
                  )}

                  {/* Finance */}
                  {horoscope.finance && (
                    <div className="border border-gray-200 rounded-lg p-5">
                      <div className="flex items-center mb-3">
                        <span className="text-2xl mr-2">💰</span>
                        <h3 className="text-xl font-bold text-gray-900">Finance & Money</h3>
                      </div>
                      <p className="text-gray-700 leading-relaxed">{horoscope.finance}</p>
                    </div>
                  )}
                </div>

                {/* Disclaimer */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600 text-center italic">
                    Disclaimer: Horoscopes are for entertainment purposes only and should not be used
                    to make important life decisions. Consult with professional astrologers for
                    personalized guidance.
                  </p>
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!selectedSign && (
        <div className="bg-white rounded-lg shadow-lg p-12 text-center">
          <div className="text-6xl mb-4">🔮</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Discover What the Stars Have in Store for You
          </h3>
          <p className="text-gray-600">
            Select your zodiac sign above to read your daily horoscope
          </p>
        </div>
      )}
    </div>
  )
}

export default DailyHoroscope
