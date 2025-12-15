import { useState, useEffect } from 'react'
import { X, User, Mail, Phone, MapPin, Calendar, Clock, Car, DollarSign, FileText, Loader2, CheckCircle } from 'lucide-react'
import { bookingService, adminService } from '../services/api'

const BookingDetailsModal = ({ isOpen, onClose, bookingId, onStatusUpdate }) => {
  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [statusUpdateError, setStatusUpdateError] = useState(null)

  useEffect(() => {
    if (isOpen && bookingId) {
      fetchBookingDetails()
    } else {
      setBooking(null)
      setError(null)
    }
  }, [isOpen, bookingId])

  const fetchBookingDetails = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await bookingService.getBookingById(bookingId)
      
      // Handle response structure: { success, message, data, error }
      if (response.success && response.data) {
        setBooking(response.data)
      } else if (response.error) {
        setError(response.error || response.message || 'Failed to load booking details')
      } else if (response.data) {
        setBooking(response.data)
      } else {
        setError('Booking not found')
      }
    } catch (err) {
      console.error('Error fetching booking details:', err)
      const errorMessage = err.response?.data?.error || 
                          err.response?.data?.detail || 
                          err.response?.data?.message ||
                          'Failed to load booking details'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

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

  const formatServiceType = (serviceType) => {
    if (!serviceType) return 'N/A'
    return serviceType
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  const handleStatusUpdate = async (newStatus) => {
    if (!bookingId || !newStatus) return
    
    setUpdatingStatus(true)
    setStatusUpdateError(null)
    
    try {
      await adminService.updateBookingStatus(bookingId, newStatus)
      // Refresh booking details
      await fetchBookingDetails()
      // Notify parent component if callback provided
      if (onStatusUpdate) {
        onStatusUpdate(bookingId, newStatus)
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || 
                          err.response?.data?.detail || 
                          err.response?.data?.message ||
                          'Failed to update booking status'
      setStatusUpdateError(errorMessage)
    } finally {
      setUpdatingStatus(false)
    }
  }

  const getStatusColor = (status) => {
    const statusLower = status?.toLowerCase()
    if (statusLower === 'completed') {
      return 'bg-status-green/20 text-status-green border-status-green/50'
    } else if (statusLower === 'pending') {
      return 'bg-status-yellow/20 text-status-yellow border-status-yellow/50'
    } else if (statusLower === 'active') {
      return 'bg-blue-500/20 text-blue-400 border-blue-500/50'
    }
    return 'bg-status-purple/20 text-status-purple border-status-purple/50'
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-bleached-950/90 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative glass-strong rounded-2xl p-6 sm:p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-bleached-600/40">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-bleached-300 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-2xl sm:text-3xl font-display mb-6 text-white">Booking Details</h2>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
        ) : error ? (
          <div className="p-4 rounded-lg bg-status-purple/20 border border-status-purple/50">
            <p className="text-status-purple">{error}</p>
          </div>
        ) : booking ? (
          <div className="space-y-6">
            {/* Booking ID and Status Update */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-bleached-700/30">
              <div>
                <p className="text-xs text-bleached-400 mb-1">Booking ID</p>
                <p className="text-sm font-mono text-white">{booking.id}</p>
              </div>
              
              {/* Status Update Controls */}
              <div className="flex flex-col gap-2">
                <p className="text-xs text-bleached-400 mb-1">Update Status</p>
                <div className="flex flex-wrap gap-2">
                  {['pending', 'active', 'completed'].map((status) => (
                    <button
                      key={status}
                      onClick={() => handleStatusUpdate(status)}
                      disabled={updatingStatus || booking.status?.toLowerCase() === status}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 ${
                        booking.status?.toLowerCase() === status
                          ? getStatusColor(status) + ' cursor-default'
                          : 'bg-bleached-800/50 text-white border-bleached-600/40 hover:bg-bleached-700/50 hover:border-bleached-500/60'
                      }`}
                    >
                      {updatingStatus && booking.status?.toLowerCase() === status ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin" />
                          Updating...
                        </>
                      ) : booking.status?.toLowerCase() === status ? (
                        <>
                          <CheckCircle className="w-3 h-3" />
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </>
                      ) : (
                        status.charAt(0).toUpperCase() + status.slice(1)
                      )}
                    </button>
                  ))}
                </div>
                {statusUpdateError && (
                  <p className="text-xs text-status-purple mt-1">{statusUpdateError}</p>
                )}
              </div>
            </div>

            {/* Customer Information */}
            <div className="glass rounded-lg p-4 sm:p-6 border border-bleached-600/40">
              <h3 className="text-lg font-display text-white mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                Customer Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-bleached-400 mb-1">Name</p>
                  <p className="text-sm sm:text-base text-white">
                    {booking.users?.first_name} {booking.users?.last_name}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-bleached-400 mb-1 flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    Email
                  </p>
                  <p className="text-sm sm:text-base text-white break-all">
                    {booking.users?.email}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-bleached-400 mb-1 flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    Phone
                  </p>
                  <p className="text-sm sm:text-base text-white">
                    {booking.users?.phone || 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Service Details */}
            <div className="glass rounded-lg p-4 sm:p-6 border border-bleached-600/40">
              <h3 className="text-lg font-display text-white mb-4 flex items-center gap-2">
                <Car className="w-5 h-5" />
                Service Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-bleached-400 mb-1">Service Type</p>
                  <p className="text-sm sm:text-base text-white">
                    {formatServiceType(booking.service_type)}
                  </p>
                </div>
                {booking.pickup_type && (
                  <div>
                    <p className="text-xs text-bleached-400 mb-1">Pickup Type</p>
                    <p className="text-sm sm:text-base text-white capitalize">
                      {booking.pickup_type.replace('_', ' ')}
                    </p>
                  </div>
                )}
                {booking.hours && (
                  <div>
                    <p className="text-xs text-bleached-400 mb-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Duration
                    </p>
                    <p className="text-sm sm:text-base text-white">
                      {booking.hours} {booking.hours === 1 ? 'hour' : 'hours'}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-bleached-400 mb-1 flex items-center gap-1">
                    <DollarSign className="w-3 h-3" />
                    Total Price
                  </p>
                  <p className="text-lg sm:text-xl font-display text-white">
                    ${booking.total_price?.toFixed(2) || '0.00'}
                  </p>
                </div>
              </div>
            </div>

            {/* Location Details */}
            <div className="glass rounded-lg p-4 sm:p-6 border border-bleached-600/40">
              <h3 className="text-lg font-display text-white mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Location Details
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-bleached-400 mb-1">Pickup Location</p>
                  <p className="text-sm sm:text-base text-white">{booking.pickup_location}</p>
                  {booking.pickup_time && (
                    <p className="text-xs text-bleached-500 mt-1 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(booking.pickup_time)}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-xs text-bleached-400 mb-1">Dropoff Location</p>
                  <p className="text-sm sm:text-base text-white">{booking.dropoff_location}</p>
                  {booking.dropoff_time && (
                    <p className="text-xs text-bleached-500 mt-1 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(booking.dropoff_time)}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Notes */}
            {booking.notes && (
              <div className="glass rounded-lg p-4 sm:p-6 border border-bleached-600/40">
                <h3 className="text-lg font-display text-white mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Special Notes
                </h3>
                <p className="text-sm sm:text-base text-white whitespace-pre-wrap">
                  {booking.notes}
                </p>
              </div>
            )}

            {/* Booking Metadata */}
            <div className="pt-4 border-t border-bleached-700/30">
              <p className="text-xs text-bleached-400 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Created: {formatDate(booking.created_at)}
              </p>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default BookingDetailsModal

