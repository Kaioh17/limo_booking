import { useState, useEffect } from 'react'
import { X, Mail, Clock, RefreshCw } from 'lucide-react'

const OTPVerificationModal = ({ isOpen, onClose, email, onVerify, onResend, error }) => {
  const [otp, setOtp] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [countdown, setCountdown] = useState(60)
  const [canResend, setCanResend] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setOtp('')
      setCountdown(60)
      setCanResend(false)
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (countdown === 0) {
      setCanResend(true)
    }
  }, [isOpen, countdown])

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (otp.length !== 6) {
      return
    }
    setIsSubmitting(true)
    try {
      await onVerify(otp)
    } catch (err) {
      // Error is handled by parent component
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResend = async () => {
    setIsResending(true)
    try {
      await onResend()
      setCountdown(60)
      setCanResend(false)
      setOtp('')
    } catch (err) {
      // Error is handled by parent component
    } finally {
      setIsResending(false)
    }
  }

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6)
    setOtp(value)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-bleached-950/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative glass-strong rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl transform transition-all border border-bleached-600/40">
        <button
          onClick={onClose}
          className="absolute top-3 sm:top-4 right-3 sm:right-4 text-bleached-300 hover:text-white transition-colors"
        >
          <X className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
        
        <div className="text-center mb-4">
          <Mail className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-white" />
          <h2 className="text-2xl sm:text-3xl font-display mb-2 text-white">Verify Your Email</h2>
          <p className="text-sm sm:text-base text-bleached-300 mb-2">
            We've sent a verification code to
          </p>
          <p className="text-sm sm:text-base font-medium text-white mb-4">
            {email}
          </p>
        </div>
        
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-status-purple/20 border border-status-purple/50">
            <p className="text-sm text-status-purple">{error}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium mb-2 text-white text-center">
              Enter 6-digit code
            </label>
            <input
              type="text"
              value={otp}
              onChange={handleOtpChange}
              required
              maxLength={6}
              className="w-full px-4 py-3 rounded-lg glass border border-bleached-600/40 text-white placeholder-bleached-400 text-center text-2xl sm:text-3xl font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-bleached-500 focus:border-transparent transition-all"
              placeholder="000000"
              autoFocus
            />
          </div>
          
          <div className="flex items-center justify-center gap-2 text-sm text-bleached-400">
            {!canResend ? (
              <>
                <Clock className="w-4 h-4" />
                <span>Resend code in {countdown}s</span>
              </>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                disabled={isResending}
                className="flex items-center gap-2 text-bleached-300 hover:text-white transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isResending ? 'animate-spin' : ''}`} />
                <span>{isResending ? 'Sending...' : 'Resend Code'}</span>
              </button>
            )}
          </div>
          
          <button
            type="submit"
            disabled={isSubmitting || otp.length !== 6}
            className="w-full py-3 px-6 bg-bleached-800 hover:bg-bleached-700 border border-bleached-600/40 rounded-lg font-display text-white text-sm sm:text-base transform hover:scale-[1.02] transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Verifying...' : 'Verify Email'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default OTPVerificationModal

