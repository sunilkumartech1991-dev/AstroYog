import api from './api'

export const astrologerService = {
  // Get all astrologers with filters
  getAstrologers: (params) => api.get('/astrologers/', { params }),

  // Get astrologer details
  getAstrologerById: (id) => api.get(`/astrologers/${id}/`),

  // Get featured astrologers
  getFeaturedAstrologers: () => api.get('/astrologers/featured/'),

  // Get specializations
  getSpecializations: () => api.get('/astrologers/specializations/'),

  // Get astrologer reviews
  getReviews: (astrologerId) => api.get(`/astrologers/${astrologerId}/reviews/`),

  // Submit review
  submitReview: (astrologerId, reviewData) =>
    api.post(`/astrologers/${astrologerId}/reviews/`, reviewData),

  // Update availability status (astrologer only)
  updateAvailabilityStatus: (status) =>
    api.post('/astrologers/profile/status/', { status }),
}

export default astrologerService
