import { useState } from 'react'
import { X, Mail, Lock } from 'lucide-react'

const SignInModal = ({ isOpen, onClose, onSignIn, error }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      await onSignIn(formData.username, formData.password)
      setFormData({ username: '', password: '' })
    } catch (err) {
      // Error is handled by parent component
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
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
        
        <h2 className="text-2xl sm:text-3xl font-display mb-2 text-white">Login</h2>
        <p className="text-sm sm:text-base text-bleached-300 mb-4 sm:mb-6">Sign in to track your bookings</p>
        
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-status-purple/20 border border-status-purple/50">
            <p className="text-sm text-status-purple">{error}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
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
              placeholder="john@example.com"
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
            className="w-full py-3 px-6 bg-bleached-800 hover:bg-bleached-700 border border-bleached-600/40 rounded-lg font-display text-white text-sm sm:text-base transform hover:scale-[1.02] transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default SignInModal
