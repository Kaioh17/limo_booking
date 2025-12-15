import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { 
  CheckCircle, 
  XCircle, 
  MapPin, 
  Calendar, 
  Clock, 
  Car, 
  DollarSign, 
  FileText,
  UserPlus,
  LogIn,
  Loader2
} from 'lucide-react'
import { bookingService } from '../services/api'

const BookingApprovalPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [booking, setBooking] = useState(null)
  const [isApproving, setIsApproving] = useState(false)
  const [isRejecting, setIsRejecting] = useState(false)
  const [error, setError] = useState(null)
  const [user, setUser] = useState(null)

  useEffect(() => {
    // Get booking data from location state (passed from BookingPage)
    if (location.state?.booking) {
      setBooking(location.state.booking)
    } else {
      // If no booking data, redirect back to booking page
      navigate('/book')
    }

    // Check if user is logged in
    const savedUser = localStorage.getItem('bho_user')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
  }, [location, navigate])

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleApprove = async () => {
    if (!booking?.id) return
    
    setIsApproving(true)
    setError(null)
    
    try {
      const response = await bookingService.approveBooking(booking.id, true)
      // Navigate to bookings page or show success message
      navigate('/bookings', { 
        state: { 
          message: 'Booking approved successfully!',
          success: true 
        } 
      })
    } catch (err) {
      // Handle FastAPI validation errors (array of error objects)
      let errorMessage = 'Failed to approve booking. Please try again.'
      
      if (err.response?.data?.detail) {
        const detail = err.response.data.detail
        
        // If detail is an array (validation errors), format them
        if (Array.isArray(detail)) {
          errorMessage = detail.map(errorObj => {
            const field = errorObj.loc?.slice(1).join('.') || 'field'
            return `${field}: ${errorObj.msg}`
          }).join(', ')
        } else if (typeof detail === 'string') {
          errorMessage = detail
        } else {
          errorMessage = JSON.stringify(detail)
        }
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error
      } else if (err.message) {
        errorMessage = err.message
      }
      
      setError(errorMessage)
    } finally {
      setIsApproving(false)
    }
  }

  const handleReject = async () => {
    if (!booking?.id) return
    
    setIsRejecting(true)
    setError(null)
    
    try {
      await bookingService.approveBooking(booking.id, false)
      // Navigate back to booking page
      navigate('/book', { 
        state: { 
          message: 'Booking cancelled.',
          success: true 
        } 
      })
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 
                          err.response?.data?.error || 
                          'Failed to cancel booking. Please try again.'
      setError(errorMessage)
    } finally {
      setIsRejecting(false)
    }
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-bleached-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-white animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bleached-950 text-white py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-display mb-2 text-white">
            Review Your Booking
          </h1>
          <p className="text-bleached-300">
            Please review the details below and confirm your booking
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-600/40 rounded-lg text-red-200">
            {error}
          </div>
        )}

        {/* Booking Summary Card */}
        <div className="glass-strong rounded-2xl p-6 sm:p-8 shadow-2xl border border-bleached-600/40 mb-6">
          <h2 className="text-2xl font-display mb-6 text-white flex items-center gap-2">
            <Car className="w-6 h-6" />
            Booking Summary
          </h2>

          <div className="space-y-6">
            {/* Service Type */}
            <div className="flex items-start gap-3">
              <Car className="w-5 h-5 text-bleached-400 mt-1 flex-shrink-0" />
              <div>
                <p className="text-xs text-bleached-400 mb-1">Service Type</p>
                <p className="text-sm sm:text-base text-white capitalize">
                  {booking.service_type?.replace('-', ' ') || 'N/A'}
                </p>
                {booking.pickup_type && (
                  <p className="text-xs text-bleached-500 mt-1 capitalize">
                    {booking.pickup_type.replace('_', ' ')}
                  </p>
                )}
              </div>
            </div>

            {/* Pickup Location */}
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-bleached-400 mt-1 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-bleached-400 mb-1">Pickup Location</p>
                <p className="text-sm sm:text-base text-white">
                  {booking.pickup_location || 'N/A'}
                </p>
              </div>
            </div>

            {/* Dropoff Location - Not shown for hourly */}
            {booking.service_type !== 'hourly' && booking.dropoff_location && (
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-bleached-400 mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-bleached-400 mb-1">Dropoff Location</p>
                  <p className="text-sm sm:text-base text-white">
                    {booking.dropoff_location || 'N/A'}
                  </p>
                </div>
              </div>
            )}

            {/* Pickup Time */}
            {booking.pickup_time && (
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-bleached-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-xs text-bleached-400 mb-1">Pickup Time</p>
                  <p className="text-sm sm:text-base text-white">
                    {formatDate(booking.pickup_time)}
                  </p>
                </div>
              </div>
            )}

            {/* Dropoff Time (Estimated Time of Arrival) */}
            {booking.dropoff_time && (
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-bleached-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-xs text-bleached-400 mb-1">Estimated Time of Arrival</p>
                  <p className="text-sm sm:text-base text-white">
                    {formatDate(booking.dropoff_time)}
                  </p>
                </div>
              </div>
            )}

            {/* Duration for hourly */}
            {booking.hours && (
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-bleached-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-xs text-bleached-400 mb-1">Duration</p>
                  <p className="text-sm sm:text-base text-white">
                    {booking.hours} {booking.hours === 1 ? 'hour' : 'hours'}
                  </p>
                </div>
              </div>
            )}

            {/* Notes */}
            {booking.notes && (
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-bleached-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-xs text-bleached-400 mb-1">Special Requests</p>
                  <p className="text-sm sm:text-base text-white">{booking.notes}</p>
                </div>
              </div>
            )}

            {/* Price */}
            <div className="flex items-start gap-3 pt-4 border-t border-bleached-700/30">
              <DollarSign className="w-5 h-5 text-bleached-400 mt-1 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-bleached-400 mb-1">Total Price</p>
                <p className="text-2xl sm:text-3xl font-display text-white">
                  ${booking.total_price?.toFixed(2) || '0.00'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Account Creation Info for Non-Logged-In Users */}
        {!user && (
          <div className="glass rounded-lg p-6 mb-6 border border-bleached-600/40">
            <div className="flex items-start gap-3 mb-4">
              <UserPlus className="w-5 h-5 text-bleached-400 mt-1 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-display text-white mb-2">
                  Create an Account
                </h3>
                <p className="text-sm text-bleached-300 mb-4">
                  Create a free account to track your bookings, view booking history, and manage your rides easily.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => navigate('/book', { state: { showSignUp: true } })}
                    className="px-4 py-2 bg-bleached-800 hover:bg-bleached-700 border border-bleached-600/40 rounded-lg font-display text-white text-sm transition-all flex items-center justify-center gap-2"
                  >
                    <UserPlus className="w-4 h-4" />
                    Sign Up
                  </button>
                  <button
                    onClick={() => navigate('/book', { state: { showSignIn: true } })}
                    className="px-4 py-2 glass hover:glass-strong border border-bleached-600/40 rounded-lg font-display text-white text-sm transition-all flex items-center justify-center gap-2"
                  >
                    <LogIn className="w-4 h-4" />
                    Sign In
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleReject}
            disabled={isApproving || isRejecting}
            className="flex-1 px-6 py-3 glass hover:glass-strong border border-bleached-600/40 rounded-lg font-display text-white text-base transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isRejecting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Cancelling...
              </>
            ) : (
              <>
                <XCircle className="w-5 h-5" />
                Cancel Booking
              </>
            )}
          </button>

          <button
            onClick={handleApprove}
            disabled={isApproving || isRejecting}
            className="flex-1 px-6 py-3 bg-bleached-800 hover:bg-bleached-700 border border-bleached-600/40 rounded-lg font-display text-white text-base transition-all shadow-lg hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isApproving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Approving...
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                Approve & Confirm Booking
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default BookingApprovalPage

