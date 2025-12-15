import { useState, useEffect } from 'react'
import { AlertTriangle, RefreshCw, X } from 'lucide-react'

const TokenExpirationModal = ({ isOpen, onRefresh, onDismiss, countdown }) => {
  const [timeLeft, setTimeLeft] = useState(countdown)

  useEffect(() => {
    if (isOpen && countdown > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [isOpen, countdown])

  if (!isOpen) return null

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-bleached-950/90 backdrop-blur-sm" />
      <div className="relative glass-strong rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-status-yellow/50">
        <div className="flex items-start gap-4 mb-6">
          <div className="flex-shrink-0">
            <AlertTriangle className="w-8 h-8 sm:w-10 sm:h-10 text-status-yellow" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl sm:text-2xl font-display mb-2 text-white">
              Session Expiring Soon
            </h2>
            <p className="text-sm sm:text-base text-bleached-300 mb-4">
              Your session will expire in <strong className="text-white">{formatTime(timeLeft)}</strong>. 
              Would you like to stay logged in?
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onRefresh}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-bleached-800 hover:bg-bleached-700 border border-bleached-600/40 rounded-lg font-display text-white text-sm sm:text-base transform hover:scale-[1.02] transition-all"
          >
            <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />
            Stay Logged In
          </button>
          <button
            onClick={onDismiss}
            className="flex-1 px-6 py-3 glass hover:glass-strong border border-bleached-600/40 rounded-lg font-display text-white text-sm sm:text-base transition-all"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  )
}

export default TokenExpirationModal

