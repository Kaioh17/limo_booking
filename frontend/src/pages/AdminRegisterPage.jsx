import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, Mail, Lock, ArrowLeft, Shield } from 'lucide-react'
import { adminService } from '../services/api'

const AdminRegisterPage = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirm_password: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

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
    setSuccess(false)

    // Validation
    if (formData.password !== formData.confirm_password) {
      setError('Passwords do not match')
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setIsSubmitting(true)
    try {
      await adminService.register(formData)
      setSuccess(true)
      setTimeout(() => {
        navigate('/admin/login')
      }, 2000)
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 
                          err.response?.data?.message ||
                          'Registration failed. Please try again.'
      setError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
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
        <div className="max-w-7xl mx-auto">
          <Link
            to="/admin/login"
            className="inline-flex items-center gap-2 text-bleached-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-sm sm:text-base">Back to Login</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-md mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="glass-strong rounded-2xl p-6 sm:p-8 shadow-2xl border border-bleached-600/40">
          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-bleached-800/50 mb-4">
              <Shield className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-display mb-2 text-white">
              Admin Registration
            </h1>
            <p className="text-sm sm:text-base text-bleached-300">
              Create your admin account
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-status-purple/20 border border-status-purple/50">
              <p className="text-sm text-status-purple">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 rounded-lg bg-status-green/20 border border-status-green/50">
              <p className="text-sm text-status-green">
                Registration successful! Redirecting to login...
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2 text-xs sm:text-sm font-medium mb-2 text-white">
                  <User className="w-4 h-4 text-white" />
                  First Name
                </label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg glass border border-bleached-600/40 text-white placeholder-bleached-400 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-bleached-500 focus:border-transparent transition-all"
                  placeholder="John"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-xs sm:text-sm font-medium mb-2 text-white">
                  <User className="w-4 h-4 text-white" />
                  Last Name
                </label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg glass border border-bleached-600/40 text-white placeholder-bleached-400 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-bleached-500 focus:border-transparent transition-all"
                  placeholder="Doe"
                />
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-xs sm:text-sm font-medium mb-2 text-white">
                <Mail className="w-4 h-4 text-white" />
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
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
                minLength={6}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg glass border border-bleached-600/40 text-white placeholder-bleached-400 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-bleached-500 focus:border-transparent transition-all"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-xs sm:text-sm font-medium mb-2 text-white">
                <Lock className="w-4 h-4 text-white" />
                Confirm Password
              </label>
              <input
                type="password"
                name="confirm_password"
                value={formData.confirm_password}
                onChange={handleChange}
                required
                minLength={6}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg glass border border-bleached-600/40 text-white placeholder-bleached-400 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-bleached-500 focus:border-transparent transition-all"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || success}
              className="w-full py-3 px-6 bg-bleached-800 hover:bg-bleached-700 border border-bleached-600/40 rounded-lg font-display text-white text-sm sm:text-base transform hover:scale-[1.02] transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Registering...' : 'Register'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-bleached-400">
              Already have an account?{' '}
              <Link to="/admin/login" className="text-white hover:text-bleached-300 transition-colors">
                Login here
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}

export default AdminRegisterPage

