import api from './api'

export const foodService = {
  scanFood: async (formData) => {
    const response = await api.post('/food/scan', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  },

  saveFood: async (foodData) => {
    const response = await api.post('/food', foodData)
    return response.data
  },

  saveImageOnly: async (formData) => {
    const response = await api.post('/food/save-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  },

  getAllFoods: async () => {
    const response = await api.get('/food')
    return response.data
  },

  getRecentFoods: async () => {
    const response = await api.get('/food/recent')
    return response.data
  },

  getStats: async () => {
    const response = await api.get('/food/stats')
    return response.data
  },

  deleteFood: async (id) => {
    const response = await api.delete(`/food/${id}`)
    return response.data
  }
}
