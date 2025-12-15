import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add request interceptor to include access token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('bho_access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Add response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // If error is 401 and we haven't already tried to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      // Try to refresh token
      try {
        const refreshResponse = await api.post('/api/v1/auth/refresh')
        if (refreshResponse.data.access_token) {
          localStorage.setItem('bho_access_token', refreshResponse.data.access_token)
          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${refreshResponse.data.access_token}`
          return api(originalRequest)
        }
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect to login
        localStorage.removeItem('bho_access_token')
        localStorage.removeItem('bho_admin_user')
        localStorage.removeItem('bho_user')
        // Don't redirect here, let components handle it
      }
    }

    return Promise.reject(error)
  }
)

export const bookingService = {
  createBooking: async (bookingData) => {
    try {
      const response = await api.post('/api/v1/book/', bookingData)
      return response.data
    } catch (error) {
      console.error('Error creating booking:', error)
      throw error
    }
  },
  
  getBookings: async () => {
    try {
      const response = await api.get('/api/v1/book/all')
      return response.data
    } catch (error) {
      console.error('Error fetching bookings:', error)
      throw error
    }
  },

  getBookingsByUserId: async (userId) => {
    try {
      const response = await api.get('/api/v1/book/all', {
        params: { user_id: userId }
      })
      return response.data
    } catch (error) {
      console.error('Error fetching bookings by user ID:', error)
      throw error
    }
  },

  getAllBookings: async () => {
    try {
      const response = await api.get('/api/v1/book/all')
      return response.data
    } catch (error) {
      console.error('Error fetching all bookings:', error)
      throw error
    }
  },

  getBookingById: async (bookingId) => {
    try {
      const response = await api.get(`/api/v1/book/${bookingId}`)
      return response.data
    } catch (error) {
      console.error('Error fetching booking by ID:', error)
      throw error
    }
  },

  approveBooking: async (bookingId, isApprove) => {
    try {
      const response = await api.patch(`/api/v1/book/?id=${bookingId}&is_approve=${isApprove}`)
      return response.data
    } catch (error) {
      console.error('Error approving booking:', error)
      throw error
    }
  },
}

export const authService = {
  login: async (username, password, isAdmin = false) => {
    try {
      // OAuth2PasswordRequestForm requires form data, not JSON
      const formData = new URLSearchParams()
      formData.append('username', username)
      formData.append('password', password)
      
      const response = await api.post(
        `/api/v1/auth/login?is_admin=${isAdmin}`,
        formData,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      )
      return response.data
    } catch (error) {
      console.error('Error logging in:', error)
      throw error
    }
  },

  refreshToken: async () => {
    try {
      const response = await api.post('/api/v1/auth/refresh')
      return response.data
    } catch (error) {
      console.error('Error refreshing token:', error)
      throw error
    }
  },
}

export const adminService = {
  register: async (adminData) => {
    try {
      const response = await api.patch('/api/v1/admin/register', adminData)
      return response.data
    } catch (error) {
      console.error('Error registering admin:', error)
      throw error
    }
  },

  updateBookingStatus: async (bookingId, status) => {
    try {
      const response = await api.patch(`/api/v1/admin/booking/${bookingId}?status=${status}`)
      return response.data
    } catch (error) {
      console.error('Error updating booking status:', error)
      throw error
    }
  },
}

export const userService = {
  createUser: async (userData) => {
    try {
      const response = await api.post('/api/v1/user/', userData)
      return response.data
    } catch (error) {
      console.error('Error creating user:', error)
      throw error
    }
  },
  
  verifyToken: async (email, token) => {
    try {
      const response = await api.post('/api/v1/user/token', {
        email,
        token: parseInt(token)
      })
      return response.data
    } catch (error) {
      console.error('Error verifying token:', error)
      throw error
    }
  },
  
  resendToken: async (email) => {
    try {
      const response = await api.post('/api/v1/user/resend/token', {
        email
      })
      return response.data
    } catch (error) {
      console.error('Error resending token:', error)
      throw error
    }
  },
}

export default api

