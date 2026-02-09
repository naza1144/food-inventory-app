import api from './api'

export const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password })
    return response.data
  },

  signup: async (userData) => {
    const response = await api.post('/auth/signup', userData)
    return response.data
  },

  verifyToken: async (token) => {
    const response = await api.get('/auth/verify', {
      headers: { Authorization: `Bearer ${token}` }
    })
    return response.data
  }
}
