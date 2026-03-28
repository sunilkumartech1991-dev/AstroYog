import api from './api'

export const paymentService = {
  // Initiate payment
  initiatePayment: (data) => api.post('/payments/initiate/', data),

  // Get payment history
  getPayments: () => api.get('/payments/'),

  // Get payment details
  getPaymentById: (id) => api.get(`/payments/${id}/`),

  // Request refund
  requestRefund: (data) => api.post('/payments/refunds/request/', data),

  // Get refunds
  getRefunds: () => api.get('/payments/refunds/'),
}

export default paymentService
