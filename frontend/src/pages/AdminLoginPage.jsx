import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, Shield, ArrowRight } from 'lucide-react'
import { authService } from '../services/api'
import TokenExpirationModal from '../components/TokenExpirationModal'
import { isTokenExpired, getTokenExpirationTime } from '../utils/tokenUtils'

const AdminLoginPage = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [showExpirationModal, setShowExpirationModal] = useState(false)
  const [expirationCountdown, setExpirationCountdown] = useState(300)

  useEffect(() => {
    // Check if admin is already logged in
    const token = localStorage.getItem('bho_access_token')
    const adminUser = localStorage.getItem('bho_admin_user')
    
    if (token && adminUser) {
      // Check if token is expired or expiring soon
      if (isTokenExpired(token)) {
        localStorage.removeItem('bho_access_token')
        localStorage.removeItem('bho_admin_user')
      } else {
        // Check if token expires soon
        const expirationTime = getTokenExpirationTime(token)
        if (expirationTime) {
          const timeUntilExpiry = expirationTime - Date.now()
          if (timeUntilExpiry < 300000 && timeUntilExpiry > 0) {
            // Show expiration modal if less than 5 minutes remaining
            setExpirationCountdown(Math.floor(timeUntilExpiry / 1000))
            setShowExpirationModal(true)
          } else if (timeUntilExpiry > 0) {
            // Navigate to dashboard if token is still valid
            navigate('/admin/dashboard')
          }
        }
      }
    }
  }, [navigate])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
    setError(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const response = await authService.login(formData.username, formData.password, true)
      
      if (response.access_token) {
        localStorage.setItem('bho_access_token', response.access_token)
        localStorage.setItem('bho_admin_user', JSON.stringify({
          email: formData.username,
          isAdmin: true
        }))
        navigate('/admin/dashboard')
      }
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 
                          err.response?.data?.message ||
                          'Login failed. Please check your credentials.'
      setError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRefreshToken = async () => {
    try {
      const response = await authService.refreshToken()
      if (response.access_token) {
        localStorage.setItem('bho_access_token', response.access_token)
        setShowExpirationModal(false)
      }
    } catch (err) {
      console.error('Error refreshing token:', err)
      // If refresh fails, logout
      localStorage.removeItem('bho_access_token')
      localStorage.removeItem('bho_admin_user')
      setShowExpirationModal(false)
      setError('Session expired. Please login again.')
    }
  }

  const handleDismissExpiration = () => {
    setShowExpirationModal(false)
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-bleached-950">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-bleached-800/20 rounded-full blur-3xl animate-float" />
        <div className="absolute top-40 right-20 w-96 h-96 bg-bleached-700/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-bleached-800/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }} />
      </div>

      {/* Main Content */}
      <main className="relative z-10 min-h-screen flex items-center justify-center px-4 sm:px-6 py-8 sm:py-12">
        <div className="glass-strong rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-bleached-600/40">
          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-bleached-800/50 mb-4">
              <Shield className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-display mb-2 text-white">
              Admin Login
            </h1>
            <p className="text-sm sm:text-base text-bleached-300">
              Sign in to access the admin portal
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-status-purple/20 border border-status-purple/50">
              <p className="text-sm text-status-purple">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="flex items-center gap-2 text-xs sm:text-sm font-medium mb-2 text-white">
                <Mail className="w-4 h-4 text-white" />
                Email
              </label>
              <input
                type="email"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg glass border border-bleached-600/40 text-white placeholder-bleached-400 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-bleached-500 focus:border-transparent transition-all"
                placeholder="admin@example.com"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-xs sm:text-sm font-medium mb-2 text-white">
                <Lock className="w-4 h-4 text-white" />
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg glass border border-bleached-600/40 text-white placeholder-bleached-400 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-bleached-500 focus:border-transparent transition-all"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-6 bg-bleached-800 hover:bg-bleached-700 border border-bleached-600/40 rounded-lg font-display text-white text-sm sm:text-base transform hover:scale-[1.02] transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                'Logging in...'
              ) : (
                <>
                  Login
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-bleached-400">
              Don't have an account?{' '}
              <Link to="/admin/register" className="text-white hover:text-bleached-300 transition-colors">
                Register here
              </Link>
            </p>
          </div>
        </div>
      </main>

      {/* Token Expiration Modal */}
      <TokenExpirationModal
        isOpen={showExpirationModal}
        onRefresh={handleRefreshToken}
        onDismiss={handleDismissExpiration}
        countdown={expirationCountdown}
      />
    </div>
  )
}

export default AdminLoginPage

