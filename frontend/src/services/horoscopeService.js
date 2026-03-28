import api from './api'

export const horoscopeService = {
  // Generate Kundli
  generateKundli: (data) => api.post('/horoscope/kundli/generate/', data),

  // Get user's Kundlis
  getKundlis: () => api.get('/horoscope/kundli/'),

  // Get Kundli by ID
  getKundliById: (id) => api.get(`/horoscope/kundli/${id}/`),

  // Delete Kundli
  deleteKundli: (id) => api.delete(`/horoscope/kundli/${id}/`),

  // Get daily horoscope by zodiac sign
  getDailyHoroscope: (zodiacSign) => api.get(`/horoscope/daily/${zodiacSign}/`),

  // Get all daily horoscopes
  getAllDailyHoroscopes: () => api.get('/horoscope/daily/'),
}

export default horoscopeService
