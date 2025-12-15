import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  User, 
  LogOut, 
  MapPin, 
  Calendar, 
  Clock, 
  Car, 
  DollarSign,
  FileText,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Loader2
} from 'lucide-react'
import { bookingService } from '../services/api'

const BookingsPage = () => {
  const [user, setUser] = useState(null)
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    // Load user from localStorage
    const savedUser = localStorage.getItem('bho_user')
    if (savedUser) {
      const userData = JSON.parse(savedUser)
      setUser(userData)
      // Fetch bookings for this user
      fetchBookings(userData)
    } else {
      // Redirect to booking page if no user
      navigate('/book')
    }
  }, [navigate])

  const fetchBookings = async (userData) => {
    try {
      setLoading(true)
      setError(null)
      // Use the new endpoint that returns all bookings for the authenticated user
      const response = await bookingService.getAllBookings()
      
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
      const errorMessage = err.response?.data?.error || 
                          err.response?.data?.detail || 
                          err.response?.data?.message ||
                          'Failed to load bookings'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = () => {
    setUser(null)
    localStorage.removeItem('bho_user')
    navigate('/book')
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'text-status-green'
      case 'pending':
        return 'text-status-yellow'
      case 'cancelled':
        return 'text-status-purple'
      default:
        return 'text-bleached-300'
    }
  }

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-status-green" />
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-status-purple" />
      default:
        return <Clock className="w-5 h-5 text-status-yellow" />
    }
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

  const formatServiceType = (serviceType) => {
    if (!serviceType) return 'N/A'
    
    // Handle new service types: drop-off, airport-service, hourly
    const serviceTypeMap = {
      'drop-off': 'Drop-off',
      'airport-service': 'Airport Service',
      'hourly': 'Hourly'
    }
    
    return serviceTypeMap[serviceType] || serviceType
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  if (!user) {
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
      <header className="relative z-10 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 sm:gap-3">
            <h1 className="text-2xl sm:text-3xl font-display text-white">BHO</h1>
            <span className="text-xs sm:text-sm text-bleached-400 font-light hidden sm:inline">Premium Limo Service</span>
          </Link>
          
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-2 glass px-3 sm:px-4 py-2 rounded-lg border border-bleached-600/40">
                <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                <span className="text-white/90 text-sm sm:text-base hidden sm:inline">
                  {user.first_name || user.firstName} {user.last_name || user.lastName}
                </span>
              </div>
              <button
                onClick={handleSignOut}
                className="px-3 sm:px-4 py-2 text-bleached-300 hover:text-white transition-colors text-sm flex items-center gap-1 sm:gap-2"
              >
                <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Header Section */}
        <div className="mb-8 sm:mb-12">
          <Link
            to="/book"
            className="inline-flex items-center gap-2 text-bleached-300 hover:text-white transition-colors mb-4 sm:mb-6"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-sm sm:text-base">Back to Booking</span>
          </Link>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display mb-4 text-white">
            My Bookings
          </h2>
          <p className="text-base sm:text-lg text-bleached-300">
            View all your booking history and upcoming rides
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 sm:w-12 sm:h-12 text-white animate-spin" />
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="glass-strong rounded-lg p-6 border border-status-purple/50 mb-6">
            <div className="flex items-center gap-3">
              <XCircle className="w-5 h-5 sm:w-6 sm:h-6 text-status-purple flex-shrink-0" />
              <p className="text-status-purple text-sm sm:text-base">{error}</p>
            </div>
          </div>
        )}

        {/* Bookings List */}
        {!loading && !error && (
          <>
            {bookings.length === 0 ? (
              <div className="glass-strong rounded-2xl p-8 sm:p-12 text-center border border-bleached-600/40">
                <Car className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-bleached-400" />
                <h3 className="text-xl sm:text-2xl font-display text-white mb-2">
                  No Bookings Yet
                </h3>
                <p className="text-bleached-300 mb-6">
                  You haven't made any bookings yet. Start by booking your first ride!
                </p>
                <Link
                  to="/book"
                  className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-bleached-800 hover:bg-bleached-700 border border-bleached-600/40 rounded-lg font-display text-white text-sm sm:text-base transform hover:scale-105 transition-all"
                >
                  Book Now
                </Link>
              </div>
            ) : (
              <div className="space-y-4 sm:space-y-6">
                {bookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="glass-strong rounded-xl p-6 sm:p-8 border border-bleached-600/40 hover:border-bleached-500/60 transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          {getStatusIcon(booking.status)}
                          <h3 className="text-lg sm:text-xl font-display text-white">
                            {formatServiceType(booking.service_type)}
                          </h3>
                          <span className={`text-xs sm:text-sm font-medium px-2 sm:px-3 py-1 rounded-full ${getStatusColor(booking.status)} bg-${booking.status?.toLowerCase() === 'completed' ? 'status-green' : booking.status?.toLowerCase() === 'pending' ? 'status-yellow' : 'status-purple'}/20`}>
                            {booking.status?.toUpperCase() || 'PENDING'}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-bleached-400 mb-2">
                          Booking ID: {booking.id}
                        </p>
                        {booking.pickup_type && (
                          <p className="text-xs sm:text-sm text-bleached-400">
                            Type: {booking.pickup_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2 text-xl sm:text-2xl font-display text-white">
                          <DollarSign className="w-5 h-5 sm:w-6 sm:h-6" />
                          {booking.total_price?.toFixed(2) || '0.00'}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-4">
                      <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-white flex-shrink-0 mt-1" />
                        <div>
                          <p className="text-xs sm:text-sm text-bleached-400 mb-1">Pickup</p>
                          <p className="text-sm sm:text-base text-white">{booking.pickup_location || 'N/A'}</p>
                          {booking.pickup_time && (
                            <p className="text-xs text-bleached-500 mt-1">
                              {formatDate(booking.pickup_time)}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-white flex-shrink-0 mt-1" />
                        <div>
                          <p className="text-xs sm:text-sm text-bleached-400 mb-1">Dropoff</p>
                          <p className="text-sm sm:text-base text-white">{booking.dropoff_location || 'N/A'}</p>
                          {booking.dropoff_time && (
                            <p className="text-xs text-bleached-500 mt-1">
                              {formatDate(booking.dropoff_time)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {booking.hours && (
                      <div className="flex items-center gap-3 mb-4">
                        <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                        <div>
                          <p className="text-xs sm:text-sm text-bleached-400">Duration</p>
                          <p className="text-sm sm:text-base text-white">{booking.hours} {booking.hours === 1 ? 'hour' : 'hours'}</p>
                        </div>
                      </div>
                    )}

                    {booking.notes && (
                      <div className="flex items-start gap-3 mb-4">
                        <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-white flex-shrink-0 mt-1" />
                        <div>
                          <p className="text-xs sm:text-sm text-bleached-400 mb-1">Notes</p>
                          <p className="text-sm sm:text-base text-white">{booking.notes}</p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-3 pt-4 border-t border-bleached-700/30">
                      <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-bleached-400" />
                      <p className="text-xs sm:text-sm text-bleached-400">
                        Created: {formatDate(booking.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 mt-12 sm:mt-20 pb-6 sm:pb-8 text-center text-bleached-400 text-xs sm:text-sm px-4">
        <p>© 2024 BHO Premium Limo Service. All rights reserved.</p>
      </footer>
    </div>
  )
}

export default BookingsPage

