import api from './api'

export const userService = {
  // Get user profile
  getProfile: () => api.get('/users/profile/'),

  // Update user profile
  updateProfile: (data) => api.put('/users/profile/', data),

  // Change password
  changePassword: (data) => api.post('/users/change-password/', data),

  // Get wallet transactions
  getWalletTransactions: () => api.get('/users/wallet/transactions/'),

  // Get user addresses
  getAddresses: () => api.get('/users/addresses/'),

  // Create address
  createAddress: (data) => api.post('/users/addresses/', data),

  // Update address
  updateAddress: (id, data) => api.put(`/users/addresses/${id}/`, data),

  // Delete address
  deleteAddress: (id) => api.delete(`/users/addresses/${id}/`),
}

export default userService
