import api from './api'

export const consultationService = {
  // Start a new consultation
  startConsultation: (data) => api.post('/consultations/start/', data),

  // Accept consultation (astrologer)
  acceptConsultation: (consultationId) =>
    api.post(`/consultations/${consultationId}/accept/`),

  // End consultation
  endConsultation: (consultationId) =>
    api.post(`/consultations/${consultationId}/end/`),

  // Get consultation list
  getConsultations: () => api.get('/consultations/'),

  // Get consultation details
  getConsultationById: (consultationId) =>
    api.get(`/consultations/${consultationId}/`),

  // Create booking
  createBooking: (data) => api.post('/consultations/bookings/', data),

  // Get bookings
  getBookings: () => api.get('/consultations/bookings/'),

  // Submit feedback
  submitFeedback: (data) => api.post('/consultations/feedback/', data),
}

export default consultationService
