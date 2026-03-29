import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import astrologerService from '../services/astrologerService'
import consultationService from '../services/consultationService'

const AstrologerDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [astrologer, setAstrologer] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('about')
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [submittingReview, setSubmittingReview] = useState(false)
  const [reviewData, setReviewData] = useState({
    rating: 5,
    review_text: ''
  })
  const [startingConsultation, setStartingConsultation] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [modalConfig, setModalConfig] = useState({
    title: '',
    message: '',
    type: 'success', // success, error, info
    onClose: null
  })

  useEffect(() => {
    fetchAstrologerDetails()
  }, [id])

  const showSuccessModal = (title, message, onClose = null) => {
    setModalConfig({ title, message, type: 'success', onClose })
    setShowModal(true)
  }

  const showErrorModal = (title, message, onClose = null) => {
    setModalConfig({ title, message, type: 'error', onClose })
    setShowModal(true)
  }

  const showInfoModal = (title, message, onClose = null) => {
    setModalConfig({ title, message, type: 'info', onClose })
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    if (modalConfig.onClose) {
      modalConfig.onClose()
    }
  }

  const fetchAstrologerDetails = async () => {
    try {
      setLoading(true)
      const response = await astrologerService.getAstrologerById(id)
      setAstrologer(response.data)
    } catch (error) {
      console.error('Error fetching astrologer details:', error)
      setError('Failed to load astrologer details')
    } finally {
      setLoading(false)
    }
  }

  const handleConsult = async (consultationType) => {
    // Check if user is logged in
    const token = localStorage.getItem('accessToken')
    if (!token) {
      // Redirect to login with return URL
      navigate(`/login?redirect=/astrologers/${id}`)
      return
    }

    try {
      setStartingConsultation(true)

      // Start consultation
      const response = await consultationService.startConsultation({
        astrologer_id: astrologer.id,
        consultation_type: consultationType,
        user_notes: ''
      })

      const consultation = response.data.consultation

      showSuccessModal(
        'Consultation Request Sent!',
        `Your ${consultation.consultation_type} consultation request has been sent to ${astrologer.display_name}.\n\nRate: ₹${consultation.rate_per_minute}/min\n\nWaiting for astrologer to accept...`,
        () => navigate(`/consultations?id=${consultation.id}`)
      )

    } catch (error) {
      console.error('Error starting consultation:', error)
      const errorMessage = error.response?.data?.error || 'Failed to start consultation. Please try again.'

      // If insufficient balance, redirect to wallet
      if (errorMessage.includes('Insufficient')) {
        showErrorModal(
          'Insufficient Balance',
          errorMessage,
          () => navigate('/wallet')
        )
      } else {
        showErrorModal('Error', errorMessage)
      }
    } finally {
      setStartingConsultation(false)
    }
  }

  const handleSubmitReview = async (e) => {
    e.preventDefault()

    const token = localStorage.getItem('accessToken')
    if (!token) {
      navigate(`/login?redirect=/astrologers/${id}`)
      return
    }

    if (!reviewData.review_text.trim()) {
      showErrorModal('Validation Error', 'Please write a review before submitting.')
      return
    }

    try {
      setSubmittingReview(true)
      await astrologerService.submitReview(id, reviewData)

      // Reset form
      setReviewData({ rating: 5, review_text: '' })
      setShowReviewForm(false)

      showSuccessModal(
        'Review Submitted!',
        'Thank you for your review! It will be visible after approval.'
      )

      // Refresh astrologer data
      await fetchAstrologerDetails()
    } catch (error) {
      console.error('Error submitting review:', error)
      showErrorModal(
        'Submission Failed',
        error.response?.data?.error || 'Failed to submit review. Please try again.'
      )
    } finally {
      setSubmittingReview(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading astrologer details...</p>
        </div>
      </div>
    )
  }

  if (error || !astrologer) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-red-600 text-xl mb-4">{error || 'Astrologer not found'}</p>
          <button
            onClick={() => navigate('/astrologers')}
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700"
          >
            Back to Astrologers
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Profile Image */}
          <div className="flex-shrink-0">
            <div className="relative">
              <img
                src={astrologer.profile_picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(astrologer.display_name)}&size=200&background=random&color=fff&bold=true`}
                alt={astrologer.display_name}
                className="w-32 h-32 rounded-full object-cover border-4 border-primary-100"
                onError={(e) => {
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(astrologer.display_name)}&size=200&background=random&color=fff&bold=true`
                }}
              />
              {astrologer.is_available && (
                <span className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 rounded-full border-4 border-white"></span>
              )}
              {astrologer.is_featured && (
                <span className="absolute top-0 right-0 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">
                  Featured
                </span>
              )}
            </div>
          </div>

          {/* Profile Info */}
          <div className="flex-grow">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {astrologer.display_name}
                </h1>
                <div className="flex items-center gap-4 mb-3">
                  <div className="flex items-center">
                    <span className="text-yellow-500 text-xl">⭐</span>
                    <span className="ml-1 text-lg font-semibold">{astrologer.average_rating}</span>
                    <span className="text-gray-500 ml-1">
                      ({astrologer.total_reviews} reviews)
                    </span>
                  </div>
                  <span className="text-gray-600">
                    {astrologer.total_consultations}+ consultations
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm">
                    {astrologer.experience_years} years exp.
                  </span>
                  {astrologer.is_top_rated && (
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                      Top Rated
                    </span>
                  )}
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    astrologer.is_available
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {astrologer.availability_status || (astrologer.is_available ? 'Online' : 'Offline')}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 mb-3">
                  {astrologer.languages?.map((lang, idx) => (
                    <span key={idx} className="text-gray-600 text-sm">
                      {lang}{idx < astrologer.languages.length - 1 ? ', ' : ''}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Specializations */}
            <div className="mt-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Specializations:</h3>
              <div className="flex flex-wrap gap-2">
                {astrologer.specializations?.map((spec) => (
                  <span
                    key={spec.id}
                    className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm"
                  >
                    {spec.specialization_detail?.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Tabs */}
          <div className="bg-white rounded-lg shadow-md mb-6">
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px">
                <button
                  onClick={() => setActiveTab('about')}
                  className={`px-6 py-4 text-sm font-medium border-b-2 ${
                    activeTab === 'about'
                      ? 'border-primary-600 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  About
                </button>
                <button
                  onClick={() => setActiveTab('reviews')}
                  className={`px-6 py-4 text-sm font-medium border-b-2 ${
                    activeTab === 'reviews'
                      ? 'border-primary-600 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Reviews ({astrologer.total_reviews})
                </button>
              </nav>
            </div>

            <div className="p-6">
              {activeTab === 'about' && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">About Me</h3>
                  <p className="text-gray-700 whitespace-pre-line">{astrologer.bio}</p>

                  {astrologer.education && (
                    <div className="mt-6">
                      <h4 className="font-semibold mb-2">Education</h4>
                      <p className="text-gray-700">{astrologer.education}</p>
                    </div>
                  )}

                  {astrologer.certifications && (
                    <div className="mt-6">
                      <h4 className="font-semibold mb-2">Certifications</h4>
                      <p className="text-gray-700">{astrologer.certifications}</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'reviews' && (
                <div>
                  {/* Add Review Button */}
                  <div className="mb-6">
                    {!showReviewForm ? (
                      <button
                        onClick={() => {
                          const token = localStorage.getItem('accessToken')
                          if (!token) {
                            navigate(`/login?redirect=/astrologers/${id}`)
                            return
                          }
                          setShowReviewForm(true)
                        }}
                        className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700"
                      >
                        Write a Review
                      </button>
                    ) : (
                      <div className="bg-gray-50 p-6 rounded-lg">
                        <h4 className="font-semibold mb-4">Write Your Review</h4>
                        <form onSubmit={handleSubmitReview}>
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Rating
                            </label>
                            <div className="flex gap-2">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  type="button"
                                  onClick={() => setReviewData(prev => ({ ...prev, rating: star }))}
                                  className="text-3xl focus:outline-none"
                                >
                                  <span className={star <= reviewData.rating ? 'text-yellow-500' : 'text-gray-300'}>
                                    ★
                                  </span>
                                </button>
                              ))}
                              <span className="ml-2 text-gray-600">({reviewData.rating}/5)</span>
                            </div>
                          </div>

                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Your Review
                            </label>
                            <textarea
                              value={reviewData.review_text}
                              onChange={(e) => setReviewData(prev => ({ ...prev, review_text: e.target.value }))}
                              rows="4"
                              placeholder="Share your experience with this astrologer..."
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                              required
                            />
                          </div>

                          <div className="flex gap-3">
                            <button
                              type="submit"
                              disabled={submittingReview}
                              className="flex-1 bg-primary-600 text-white py-2 rounded-lg font-semibold hover:bg-primary-700 disabled:bg-gray-300"
                            >
                              {submittingReview ? 'Submitting...' : 'Submit Review'}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setShowReviewForm(false)
                                setReviewData({ rating: 5, review_text: '' })
                              }}
                              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50"
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      </div>
                    )}
                  </div>

                  {/* Reviews List */}
                  {astrologer.reviews && astrologer.reviews.length > 0 ? (
                    <div className="space-y-4">
                      {astrologer.reviews.map((review) => (
                        <div key={review.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                          <div className="flex items-start gap-3">
                            <img
                              src={review.user_profile_image || '/avatar-placeholder.png'}
                              alt={review.user_name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                            <div className="flex-grow">
                              <div className="flex items-center justify-between mb-1">
                                <h4 className="font-semibold">{review.user_name}</h4>
                                <div className="flex items-center">
                                  <span className="text-yellow-500">⭐</span>
                                  <span className="ml-1">{review.rating}</span>
                                </div>
                              </div>
                              <p className="text-gray-700 text-sm">{review.review_text}</p>
                              <p className="text-gray-500 text-xs mt-1">
                                {new Date(review.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500 mb-2">No reviews yet</p>
                      <p className="text-sm text-gray-400">Be the first to share your experience!</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar - Consultation Options */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
            <h3 className="text-lg font-semibold mb-4">Choose Consultation Type</h3>

            {/* Chat Consultation */}
            <div className="border border-gray-200 rounded-lg p-4 mb-4">
              <div className="flex items-center mb-2">
                <span className="text-2xl mr-2">💬</span>
                <div className="flex-grow">
                  <h4 className="font-semibold">Chat Consultation</h4>
                  <p className="text-sm text-gray-600">Text-based instant messaging</p>
                </div>
              </div>
              <div className="flex items-center justify-between mt-3">
                <span className="text-xl font-bold text-primary-600">
                  ₹{astrologer.chat_price}/min
                </span>
                <button
                  onClick={() => handleConsult('chat')}
                  disabled={!astrologer.is_available || startingConsultation}
                  className={`px-4 py-2 rounded-lg font-semibold ${
                    astrologer.is_available && !startingConsultation
                      ? 'bg-primary-600 text-white hover:bg-primary-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {startingConsultation ? 'Starting...' : (astrologer.is_available ? 'Chat Now' : 'Offline')}
                </button>
              </div>
            </div>

            {/* Call Consultation */}
            <div className="border border-gray-200 rounded-lg p-4 mb-4">
              <div className="flex items-center mb-2">
                <span className="text-2xl mr-2">📞</span>
                <div className="flex-grow">
                  <h4 className="font-semibold">Voice Call</h4>
                  <p className="text-sm text-gray-600">Audio consultation</p>
                </div>
              </div>
              <div className="flex items-center justify-between mt-3">
                <span className="text-xl font-bold text-primary-600">
                  ₹{astrologer.call_price}/min
                </span>
                <button
                  onClick={() => handleConsult('call')}
                  disabled={!astrologer.is_available || startingConsultation}
                  className={`px-4 py-2 rounded-lg font-semibold ${
                    astrologer.is_available && !startingConsultation
                      ? 'bg-primary-600 text-white hover:bg-primary-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {startingConsultation ? 'Starting...' : (astrologer.is_available ? 'Call Now' : 'Offline')}
                </button>
              </div>
            </div>

            {/* Video Consultation */}
            <div className="border border-gray-200 rounded-lg p-4 mb-4">
              <div className="flex items-center mb-2">
                <span className="text-2xl mr-2">📹</span>
                <div className="flex-grow">
                  <h4 className="font-semibold">Video Call</h4>
                  <p className="text-sm text-gray-600">Face-to-face consultation</p>
                </div>
              </div>
              <div className="flex items-center justify-between mt-3">
                <span className="text-xl font-bold text-primary-600">
                  ₹{astrologer.video_price}/min
                </span>
                <button
                  onClick={() => handleConsult('video')}
                  disabled={!astrologer.is_available || startingConsultation}
                  className={`px-4 py-2 rounded-lg font-semibold ${
                    astrologer.is_available && !startingConsultation
                      ? 'bg-primary-600 text-white hover:bg-primary-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {startingConsultation ? 'Starting...' : (astrologer.is_available ? 'Video Now' : 'Offline')}
                </button>
              </div>
            </div>

            {!astrologer.is_available && (
              <p className="text-sm text-gray-600 text-center mt-4">
                This astrologer is currently offline. Please check back later.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-fade-in">
            <div className="flex items-center mb-4">
              {modalConfig.type === 'success' && (
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
              {modalConfig.type === 'error' && (
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              )}
              {modalConfig.type === 'info' && (
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              )}
              <h3 className="text-xl font-bold text-gray-900">{modalConfig.title}</h3>
            </div>
            <p className="text-gray-700 mb-6 whitespace-pre-line">{modalConfig.message}</p>
            <div className="flex justify-end">
              <button
                onClick={closeModal}
                className={`px-6 py-2 rounded-lg font-semibold ${
                  modalConfig.type === 'success'
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : modalConfig.type === 'error'
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AstrologerDetail
