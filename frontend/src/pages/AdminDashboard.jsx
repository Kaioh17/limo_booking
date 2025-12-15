import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  LogOut, 
  Shield, 
  Car, 
  Users, 
  DollarSign, 
  Calendar,
  AlertTriangle,
  RefreshCw
} from 'lucide-react'
import { bookingService, authService } from '../services/api'
import TokenExpirationModal from '../components/TokenExpirationModal'
import BookingDetailsModal from '../components/BookingDetailsModal'
import { isTokenExpired, getTokenExpirationTime } from '../utils/tokenUtils'

const AdminDashboard = () => {
  const navigate = useNavigate()
  const [admin, setAdmin] = useState(null)
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showExpirationModal, setShowExpirationModal] = useState(false)
  const [expirationCountdown, setExpirationCountdown] = useState(300)
  const [selectedBookingId, setSelectedBookingId] = useState(null)
  const [showBookingDetails, setShowBookingDetails] = useState(false)

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('bho_access_token')
    const adminUser = localStorage.getItem('bho_admin_user')

    if (!token || !adminUser) {
      navigate('/admin/login')
      return
    }

    // Check if token is expired
    if (isTokenExpired(token)) {
      localStorage.removeItem('bho_access_token')
      localStorage.removeItem('bho_admin_user')
      navigate('/admin/login')
      return
    }

    // Check if token expires soon
    const expirationTime = getTokenExpirationTime(token)
    if (expirationTime) {
      const timeUntilExpiry = expirationTime - Date.now()
      if (timeUntilExpiry < 300000 && timeUntilExpiry > 0) {
        // Show expiration modal if less than 5 minutes remaining
        setExpirationCountdown(Math.floor(timeUntilExpiry / 1000))
        setShowExpirationModal(true)
      }
    }

    setAdmin(JSON.parse(adminUser))
    fetchBookings()

    // Set up interval to check token expiration
    const interval = setInterval(() => {
      const currentToken = localStorage.getItem('bho_access_token')
      if (currentToken && isTokenExpired(currentToken)) {
        setShowExpirationModal(true)
        setExpirationCountdown(0)
      } else if (currentToken) {
        const expTime = getTokenExpirationTime(currentToken)
        if (expTime) {
          const timeUntilExpiry = expTime - Date.now()
          if (timeUntilExpiry < 300000 && timeUntilExpiry > 0) {
            setExpirationCountdown(Math.floor(timeUntilExpiry / 1000))
            setShowExpirationModal(true)
          }
        }
      }
    }, 60000) // Check every minute

    return () => clearInterval(interval)
  }, [navigate])

  const fetchBookings = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await bookingService.getBookings()
      
      // Handle response structure: { success, message, data, error }
      if (response.success && response.data) {
        setBookings(response.data)
      } else if (response.error) {
        setError(response.error || response.message || 'Failed to load bookings')
      } else if (Array.isArray(response)) {
        // Fallback if response is directly an array
        setBookings(response)
      } else if (response.data && Array.isArray(response.data)) {
        // Fallback if response has data array
        setBookings(response.data)
      } else {
        setBookings([])
      }
    } catch (err) {
      console.error('Error fetching bookings:', err)
      if (err.response?.status === 401) {
        // Token expired
        localStorage.removeItem('bho_access_token')
        localStorage.removeItem('bho_admin_user')
        navigate('/admin/login')
      } else {
        const errorMessage = err.response?.data?.error || 
                            err.response?.data?.detail || 
                            err.response?.data?.message ||
                            'Failed to load bookings'
        setError(errorMessage)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = () => {
    localStorage.removeItem('bho_access_token')
    localStorage.removeItem('bho_admin_user')
    navigate('/admin/login')
  }

  const handleRefreshToken = async () => {
    try {
      const response = await authService.refreshToken()
      if (response.access_token) {
        localStorage.setItem('bho_access_token', response.access_token)
        setShowExpirationModal(false)
        // Reset expiration check
        const expirationTime = getTokenExpirationTime(response.access_token)
        if (expirationTime) {
          const timeUntilExpiry = expirationTime - Date.now()
          if (timeUntilExpiry > 0) {
            setExpirationCountdown(Math.floor(timeUntilExpiry / 1000))
          }
        }
      }
    } catch (err) {
      console.error('Error refreshing token:', err)
      // If refresh fails, logout
      localStorage.removeItem('bho_access_token')
      localStorage.removeItem('bho_admin_user')
      setShowExpirationModal(false)
      navigate('/admin/login')
    }
  }

  const handleDismissExpiration = () => {
    setShowExpirationModal(false)
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const totalRevenue = bookings.reduce((sum, booking) => sum + (booking.total_price || 0), 0)
  const totalBookings = bookings.length
  const pendingBookings = bookings.filter(b => b.status?.toLowerCase() === 'pending').length

  if (!admin) {
    return null
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-bleached-950">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-bleached-800/20 rounded-full blur-3xl animate-float" />
        <div className="absolute top-40 right-20 w-96 h-96 bg-bleached-700/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-bleached-800/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }} />
      </div>

      {/* Header */}
      <header className="relative z-10 p-4 sm:p-6 border-b border-bleached-700/30">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            <h1 className="text-xl sm:text-2xl font-display text-white">Admin Portal</h1>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 glass px-3 sm:px-4 py-2 rounded-lg border border-bleached-600/40">
              <span className="text-white/90 text-sm sm:text-base">{admin.email}</span>
            </div>
            <button
              onClick={handleSignOut}
              className="px-3 sm:px-4 py-2 text-bleached-300 hover:text-white transition-colors text-sm flex items-center gap-2"
            >
              <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-8">
          <div className="glass-strong rounded-xl p-6 border border-bleached-600/40">
            <div className="flex items-center justify-between mb-4">
              <Car className="w-8 h-8 text-white" />
              <span className="text-2xl sm:text-3xl font-display text-white">{totalBookings}</span>
            </div>
            <p className="text-sm text-bleached-400">Total Bookings</p>
          </div>
          
          <div className="glass-strong rounded-xl p-6 border border-bleached-600/40">
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="w-8 h-8 text-white" />
              <span className="text-2xl sm:text-3xl font-display text-white">${totalRevenue.toFixed(2)}</span>
            </div>
            <p className="text-sm text-bleached-400">Total Revenue</p>
          </div>
          
          <div className="glass-strong rounded-xl p-6 border border-bleached-600/40">
            <div className="flex items-center justify-between mb-4">
              <AlertTriangle className="w-8 h-8 text-status-yellow" />
              <span className="text-2xl sm:text-3xl font-display text-white">{pendingBookings}</span>
            </div>
            <p className="text-sm text-bleached-400">Pending Bookings</p>
          </div>
        </div>

        {/* Bookings List */}
        <div className="glass-strong rounded-2xl p-6 sm:p-8 border border-bleached-600/40">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl sm:text-2xl font-display text-white">All Bookings</h2>
            <button
              onClick={fetchBookings}
              className="flex items-center gap-2 px-4 py-2 glass hover:glass-strong border border-bleached-600/40 rounded-lg text-white text-sm transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-bleached-400">Loading bookings...</p>
            </div>
          ) : error ? (
            <div className="p-4 rounded-lg bg-status-purple/20 border border-status-purple/50">
              <p className="text-status-purple">{error}</p>
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-12">
              <Car className="w-12 h-12 mx-auto mb-4 text-bleached-400" />
              <p className="text-bleached-400">No bookings found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  onClick={() => {
                    setSelectedBookingId(booking.id)
                    setShowBookingDetails(true)
                  }}
                  className="glass rounded-lg p-4 sm:p-6 border border-bleached-600/40 hover:border-bleached-500/60 transition-all cursor-pointer"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-display text-white">
                          {booking.service_type?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'N/A'}
                        </h3>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          booking.status?.toLowerCase() === 'completed' 
                            ? 'bg-status-green/20 text-status-green'
                            : booking.status?.toLowerCase() === 'pending'
                            ? 'bg-status-yellow/20 text-status-yellow'
                            : 'bg-status-purple/20 text-status-purple'
                        }`}>
                          {booking.status?.toUpperCase() || 'PENDING'}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                        <p className="text-bleached-400">
                          <span className="text-white">Customer:</span> {booking.users?.first_name} {booking.users?.last_name}
                        </p>
                        <p className="text-bleached-400">
                          <span className="text-white">Email:</span> {booking.users?.email}
                        </p>
                        <p className="text-bleached-400">
                          <span className="text-white">Pickup:</span> {booking.pickup_location}
                        </p>
                        <p className="text-bleached-400">
                          <span className="text-white">Dropoff:</span> {booking.dropoff_location}
                        </p>
                        <p className="text-bleached-400">
                          <span className="text-white">Pickup Time:</span> {formatDate(booking.pickup_time)}
                        </p>
                        <p className="text-bleached-400">
                          <span className="text-white">Created:</span> {formatDate(booking.created_at)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl sm:text-2xl font-display text-white mb-2">
                        ${booking.total_price?.toFixed(2) || '0.00'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Token Expiration Modal */}
      <TokenExpirationModal
        isOpen={showExpirationModal}
        onRefresh={handleRefreshToken}
        onDismiss={handleDismissExpiration}
        countdown={expirationCountdown}
      />

      {/* Booking Details Modal */}
      <BookingDetailsModal
        isOpen={showBookingDetails}
        onClose={() => {
          setShowBookingDetails(false)
          setSelectedBookingId(null)
        }}
        bookingId={selectedBookingId}
        onStatusUpdate={(bookingId, newStatus) => {
          // Refresh bookings list when status is updated
          fetchBookings()
        }}
      />
    </div>
  )
}

export default AdminDashboard

