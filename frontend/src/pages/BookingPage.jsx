import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { User, LogOut, CheckCircle2, XCircle, Car, Clock, CheckCircle, MapPin, Calendar, DollarSign, FileText, UserPlus, LogIn, List } from 'lucide-react'
import BookingForm from '../components/BookingForm'
import SignInModal from '../components/SignInModal'
import SignUpModal from '../components/SignUpModal'
import OTPVerificationModal from '../components/OTPVerificationModal'
import { bookingService, authService, userService } from '../services/api'

const BookingPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [user, setUser] = useState(null)
  const [isSignInOpen, setIsSignInOpen] = useState(false)
  const [isSignUpOpen, setIsSignUpOpen] = useState(false)
  const [isOTPModalOpen, setIsOTPModalOpen] = useState(false)
  const [pendingUserEmail, setPendingUserEmail] = useState(null)
  const [pendingUserData, setPendingUserData] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [bookingStatus, setBookingStatus] = useState(null)
  const [bookingDetails, setBookingDetails] = useState(null)
  const [authError, setAuthError] = useState(null)

  // Check if we should show sign up/in modals from approval page
  useEffect(() => {
    if (location.state?.showSignUp) {
      setIsSignUpOpen(true)
    } else if (location.state?.showSignIn) {
      setIsSignInOpen(true)
    }
  }, [location])

  const handleSignIn = async (username, password) => {
    setAuthError(null)
    try {
      const response = await authService.login(username, password, false)
      
      // Store access token
      if (response.access_token) {
        localStorage.setItem('bho_access_token', response.access_token)
      }
      
      // Fetch user data (we'll need to decode token or fetch user info)
      // For now, we'll store the email/username
      const userData = {
        email: username,
        // We can decode the token later or fetch user data from API
      }
      
      setUser(userData)
      localStorage.setItem('bho_user', JSON.stringify(userData))
      setIsSignInOpen(false)
      setBookingStatus({
        success: true,
        message: 'Login successful!'
      })
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Login failed. Please check your credentials.'
      setAuthError(errorMessage)
      throw error
    }
  }

  const handleSignUp = async (userData) => {
    setAuthError(null)
    try {
      const response = await userService.createUser(userData)
      
      // After successful signup, show OTP verification modal
      if (response.email) {
        setPendingUserEmail(response.email)
        setPendingUserData({
          ...response,
          password: userData.password // Store password for login after verification
        })
        setIsSignUpOpen(false)
        setIsOTPModalOpen(true)
        setBookingStatus({
          success: true,
          message: 'Account created! Please verify your email with the code we sent.'
        })
      }
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Sign up failed. Please try again.'
      setAuthError(errorMessage)
      throw error
    }
  }

  const handleOTPVerify = async (otp) => {
    setAuthError(null)
    try {
      // Verify the OTP
      await userService.verifyToken(pendingUserEmail, otp)
      
      // After successful verification, log in the user
      if (pendingUserData && pendingUserData.password) {
        try {
          const loginResponse = await authService.login(pendingUserData.email, pendingUserData.password, false)
          
          if (loginResponse.access_token) {
            localStorage.setItem('bho_access_token', loginResponse.access_token)
          }
          
          const savedUserData = {
            id: pendingUserData.id,
            first_name: pendingUserData.first_name,
            last_name: pendingUserData.last_name,
            email: pendingUserData.email,
            phone: pendingUserData.phone
          }
          
          setUser(savedUserData)
          localStorage.setItem('bho_user', JSON.stringify(savedUserData))
          setIsOTPModalOpen(false)
          setPendingUserEmail(null)
          setPendingUserData(null)
          setBookingStatus({
            success: true,
            message: 'Email verified successfully! You are now logged in.'
          })
        } catch (loginError) {
          // Verification succeeded but login failed
          setAuthError('Email verified but login failed. Please login manually.')
          throw loginError
        }
      }
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Invalid verification code. Please try again.'
      setAuthError(errorMessage)
      throw error
    }
  }

  const handleResendOTP = async () => {
    setAuthError(null)
    try {
      await userService.resendToken(pendingUserEmail)
      setBookingStatus({
        success: true,
        message: 'Verification code resent to your email.'
      })
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Failed to resend code. Please try again.'
      setAuthError(errorMessage)
      throw error
    }
  }

  const handleSignOut = () => {
    setUser(null)
    localStorage.removeItem('bho_user')
    localStorage.removeItem('bho_access_token')
  }

  const handleBookingSubmit = async (bookingData) => {
    setIsSubmitting(true)
    setBookingStatus(null)
    setBookingDetails(null)
    
    // Log the booking data for debugging
    console.log('Submitting booking data:', JSON.stringify(bookingData, null, 2))
    
    try {
      const result = await bookingService.createBooking(bookingData)
      
      // Handle new response structure: { success, message, data }
      const responseData = result.data || result
      
      // Update user data if user was already signed in
      if (user && responseData && responseData.users && responseData.users.id) {
        const userData = {
          id: responseData.users.id,
          first_name: responseData.users.first_name,
          last_name: responseData.users.last_name,
          email: responseData.users.email,
          phone: responseData.users.phone
        }
        localStorage.setItem('bho_user', JSON.stringify(userData))
        setUser(userData)
      }
      
      // Navigate to approval page with booking data
      navigate('/book/approve', { 
        state: { 
          booking: responseData 
        } 
      })
    } catch (error) {
      // Log full error response for debugging
      console.error('Full error response:', error.response?.data)
      console.error('Error status:', error.response?.status)
      
      // Handle FastAPI validation errors (array of error objects)
      let errorMessage = 'Failed to create booking. Please try again.'
      
      if (error.response?.data?.detail) {
        const detail = error.response.data.detail
        
        // If detail is an array (validation errors), format them
        if (Array.isArray(detail)) {
          errorMessage = detail.map(err => {
            const field = err.loc?.slice(1).join('.') || 'field'
            return `${field}: ${err.msg}`
          }).join(', ')
        } else if (typeof detail === 'string') {
          errorMessage = detail
        } else {
          errorMessage = JSON.stringify(detail)
        }
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error
      } else if (error.message) {
        errorMessage = error.message
      }
      
      setBookingStatus({ 
        success: false, 
        message: errorMessage
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSignUpClick = () => {
    setAuthError(null)
    setIsSignUpOpen(true)
  }

  const handleLoginClick = () => {
    setAuthError(null)
    setIsSignInOpen(true)
  }

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('bho_user')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
  }, [])

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
            {user ? (
              <div className="flex items-center gap-2 sm:gap-3">
                <Link
                  to="/bookings"
                  className="flex items-center gap-2 glass px-3 sm:px-4 py-2 rounded-lg hover:glass-strong transition-all text-white/90 hover:text-white border border-bleached-600/40"
                >
                  <List className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-sm sm:text-base hidden sm:inline">My Bookings</span>
                </Link>
                <div className="flex items-center gap-2 glass px-3 sm:px-4 py-2 rounded-lg border border-bleached-600/40">
                  <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  <span className="text-white/90 text-sm sm:text-base hidden sm:inline">{user.first_name || user.firstName} {user.last_name || user.lastName}</span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="px-3 sm:px-4 py-2 text-bleached-300 hover:text-white transition-colors text-sm flex items-center gap-1 sm:gap-2"
                >
                  <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={handleSignUpClick}
                  className="flex items-center gap-2 glass px-3 sm:px-4 py-2 rounded-lg hover:glass-strong transition-all text-white/90 hover:text-white border border-bleached-600/40"
                >
                  <UserPlus className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-sm sm:text-base hidden sm:inline">Sign Up</span>
                </button>
                <button
                  onClick={handleLoginClick}
                  className="flex items-center gap-2 glass px-3 sm:px-4 py-2 rounded-lg hover:glass-strong transition-all text-white/90 hover:text-white border border-bleached-600/40"
                >
                  <LogIn className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-sm sm:text-base hidden sm:inline">Login</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Hero Section */}
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display mb-4 text-white leading-tight">
            Book Your Premium
            <br />
            <span className="text-gradient">
              Limo Experience
            </span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-bleached-300 max-w-2xl mx-auto px-4">
            Experience luxury like never before. Book your ride with BHO and travel in style.
          </p>
        </div>

        {/* Booking Status Message */}
        {bookingStatus && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 border ${
            bookingStatus.success 
              ? 'bg-status-green/20 border-status-green/50' 
              : 'bg-status-purple/20 border-status-purple/50'
          }`}>
            {bookingStatus.success ? (
              <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-status-green flex-shrink-0" />
            ) : (
              <XCircle className="w-5 h-5 sm:w-6 sm:h-6 text-status-purple flex-shrink-0" />
            )}
            <p className={`text-sm sm:text-base ${bookingStatus.success ? 'text-status-green' : 'text-status-purple'}`}>
              {bookingStatus.message}
            </p>
          </div>
        )}

        {/* Booking Details Display (for non-signed-in users) */}
        {bookingDetails && !user && (
          <div className="mb-6 glass-strong rounded-2xl p-6 sm:p-8 shadow-2xl border border-bleached-600/40">
            <div className="flex items-center gap-3 mb-6">
              <CheckCircle2 className="w-6 h-6 sm:w-8 sm:h-8 text-status-green flex-shrink-0" />
              <h3 className="text-xl sm:text-2xl font-display text-white">Booking Confirmed!</h3>
            </div>
            
            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-bleached-400 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-bleached-400 mb-1">Passenger</p>
                    <p className="text-sm sm:text-base text-white">
                      {bookingDetails.users?.first_name} {bookingDetails.users?.last_name}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Car className="w-5 h-5 text-bleached-400 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-bleached-400 mb-1">Service Type</p>
                    <p className="text-sm sm:text-base text-white capitalize">
                      {bookingDetails.service_type?.replace('-', ' ')}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-bleached-400 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-bleached-400 mb-1">Pickup Location</p>
                    <p className="text-sm sm:text-base text-white">
                      {bookingDetails.pickup_location}
                    </p>
                  </div>
                </div>
                
                {/* Dropoff Location - Not shown for hourly */}
                {bookingDetails.service_type !== 'hourly' && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-bleached-400 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-bleached-400 mb-1">Dropoff Location</p>
                      <p className="text-sm sm:text-base text-white">
                        {bookingDetails.dropoff_location}
                      </p>
                    </div>
                  </div>
                )}
                
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-bleached-400 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-bleached-400 mb-1">Pickup Time</p>
                    <p className="text-sm sm:text-base text-white">
                      {new Date(bookingDetails.pickup_time).toLocaleString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-bleached-400 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-bleached-400 mb-1">Estimated Time of Arrival</p>
                    <p className="text-sm sm:text-base text-white">
                      {new Date(bookingDetails.dropoff_time).toLocaleString()}
                    </p>
                  </div>
                </div>
                
                {bookingDetails.hours && (
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-bleached-400 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-bleached-400 mb-1">Duration</p>
                      <p className="text-sm sm:text-base text-white">
                        {bookingDetails.hours} hour{bookingDetails.hours !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                )}
                
                <div className="flex items-start gap-3">
                  <DollarSign className="w-5 h-5 text-bleached-400 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-bleached-400 mb-1">Total Price</p>
                    <p className="text-lg sm:text-xl font-display text-white">
                      ${bookingDetails.total_price?.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
              
              {bookingDetails.notes && (
                <div className="flex items-start gap-3 pt-4 border-t border-bleached-700/30">
                  <FileText className="w-5 h-5 text-bleached-400 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-bleached-400 mb-1">Notes</p>
                    <p className="text-sm sm:text-base text-white">
                      {bookingDetails.notes}
                    </p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Account Setup Prompt */}
            <div className="glass rounded-lg p-4 sm:p-6 border border-bleached-600/40 mb-4">
              <div className="flex items-start gap-3 mb-4">
                <UserPlus className="w-5 h-5 sm:w-6 sm:h-6 text-bleached-300 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="text-base sm:text-lg font-display text-white mb-2">
                    Create an Account for Easier Management
                  </h4>
                  <p className="text-sm sm:text-base text-bleached-300 mb-4">
                    Sign up with us to easily manage your bookings, view your ride history, and get faster service for future bookings.
                  </p>
                  <div className="flex flex-wrap gap-2 sm:gap-3">
                    <button
                      onClick={handleSignUpClick}
                      className="px-4 sm:px-6 py-2 sm:py-3 bg-bleached-800 hover:bg-bleached-700 border border-bleached-600/40 rounded-lg font-display text-white text-sm sm:text-base transform hover:scale-105 transition-all"
                    >
                      <span className="flex items-center gap-2">
                        <UserPlus className="w-4 h-4 sm:w-5 sm:h-5" />
                        Sign Up
                      </span>
                    </button>
                    <button
                      onClick={handleLoginClick}
                      className="px-4 sm:px-6 py-2 sm:py-3 glass hover:glass-strong border border-bleached-600/40 rounded-lg font-display text-white text-sm sm:text-base transform hover:scale-105 transition-all"
                    >
                      <span className="flex items-center gap-2">
                        <LogIn className="w-4 h-4 sm:w-5 sm:h-5" />
                        Login
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => {
                setBookingDetails(null)
                setBookingStatus(null)
              }}
              className="w-full sm:w-auto px-6 sm:px-8 py-2 sm:py-3 glass hover:glass-strong border border-bleached-600/40 rounded-lg font-display text-white text-sm sm:text-base transition-all"
            >
              Book Another Ride
            </button>
          </div>
        )}

        {/* Booking Form Card - Hide if booking details are shown for non-signed-in users */}
        {!(bookingDetails && !user) && (
          <div className="glass-strong rounded-2xl p-6 sm:p-8 md:p-12 shadow-2xl border border-bleached-600/40">
            <div className="mb-6 sm:mb-8">
              <h3 className="text-xl sm:text-2xl font-display mb-2 text-white">Reserve Your Ride</h3>
              <p className="text-sm sm:text-base text-bleached-300">
                {user 
                  ? `Welcome back, ${user.first_name || user.firstName}! Fill in the details below to book your ride.`
                  : 'Fill in the details below to book your ride. Sign up or login to track your bookings.'}
              </p>
            </div>
            
            <BookingForm 
              onSubmit={handleBookingSubmit} 
              isSubmitting={isSubmitting}
              user={user}
            />
          </div>
        )}

        {/* Features Section */}
        <div className="mt-12 sm:mt-16 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          <div className="glass rounded-xl p-4 sm:p-6 text-center hover:glass-strong transition-all transform hover:scale-105 border border-bleached-600/40">
            <Car className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 text-white" />
            <h4 className="text-lg sm:text-xl font-display text-white mb-2">Premium Fleet</h4>
            <p className="text-bleached-300 text-xs sm:text-sm">Luxury vehicles maintained to the highest standards</p>
          </div>
          <div className="glass rounded-xl p-4 sm:p-6 text-center hover:glass-strong transition-all transform hover:scale-105 border border-bleached-600/40">
            <Clock className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 text-white" />
            <h4 className="text-lg sm:text-xl font-display text-white mb-2">24/7 Service</h4>
            <p className="text-bleached-300 text-xs sm:text-sm">Available whenever you need us, day or night</p>
          </div>
          <div className="glass rounded-xl p-4 sm:p-6 text-center hover:glass-strong transition-all transform hover:scale-105 border border-bleached-600/40">
            <CheckCircle className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 text-white" />
            <h4 className="text-lg sm:text-xl font-display text-white mb-2">Easy Booking</h4>
            <p className="text-bleached-300 text-xs sm:text-sm">Simple, fast, and secure booking process</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 mt-12 sm:mt-20 pb-6 sm:pb-8 text-center text-bleached-400 text-xs sm:text-sm px-4">
        <p>© 2024 BHO Premium Limo Service. All rights reserved.</p>
      </footer>

      {/* Sign In Modal */}
      <SignInModal
        isOpen={isSignInOpen}
        onClose={() => {
          setIsSignInOpen(false)
          setAuthError(null)
        }}
        onSignIn={handleSignIn}
        error={authError}
      />

      {/* Sign Up Modal */}
      <SignUpModal
        isOpen={isSignUpOpen}
        onClose={() => {
          setIsSignUpOpen(false)
          setAuthError(null)
        }}
        onSignUp={handleSignUp}
        error={authError}
      />

      {/* OTP Verification Modal */}
      <OTPVerificationModal
        isOpen={isOTPModalOpen}
        onClose={() => {
          setIsOTPModalOpen(false)
          setAuthError(null)
        }}
        email={pendingUserEmail}
        onVerify={handleOTPVerify}
        onResend={handleResendOTP}
        error={authError}
      />
    </div>
  )
}

export default BookingPage
