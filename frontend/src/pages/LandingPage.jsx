import { Link } from 'react-router-dom'
import { 
  MapPin, 
  Clock, 
  Shield, 
  Star, 
  Users, 
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Phone,
  Mail
} from 'lucide-react'

const LandingPage = () => {
  const features = [
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Premium Fleet',
      description: 'Luxury vehicles maintained to the highest standards'
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: '24/7 Service',
      description: 'Available whenever you need us, day or night'
    },
    {
      icon: <Star className="w-6 h-6" />,
      title: 'Professional Drivers',
      description: 'Experienced and courteous chauffeurs'
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Group Travel',
      description: 'Perfect for events, parties, and corporate travel'
    }
  ]

  const benefits = [
    'Luxury vehicles with premium amenities',
    'Professional, licensed chauffeurs',
    'Flexible booking options',
    'Competitive pricing',
    '24/7 customer support',
    'Real-time booking confirmation'
  ]

  return (
    <div className="min-h-screen bg-bleached-950 text-white">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-bleached-800/20 rounded-full blur-3xl animate-float" />
          <div className="absolute top-40 right-20 w-96 h-96 bg-bleached-700/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
          <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-bleached-800/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }} />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto text-center py-20 sm:py-24 lg:py-32">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display mb-4 sm:mb-6 leading-tight">
              <span className="text-white">BHO</span>
              <br />
              <span className="text-gradient">Premium Limo Service</span>
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-bleached-300 max-w-2xl mx-auto px-4">
              Experience luxury like never before. Travel in style with our premium fleet of limousines.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center mt-8 sm:mt-12 px-4">
            <Link
              to="/book"
              className="w-full sm:w-auto px-8 sm:px-12 py-4 sm:py-5 bg-bleached-800 hover:bg-bleached-700 border border-bleached-600/40 rounded-lg font-display text-white text-lg sm:text-xl transform hover:scale-105 transition-all shadow-lg hover:shadow-2xl flex items-center justify-center gap-2"
            >
              Book Now
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href="#features"
              className="w-full sm:w-auto px-8 sm:px-12 py-4 sm:py-5 glass border border-bleached-600/40 rounded-lg font-display text-white text-lg sm:text-xl transform hover:scale-105 transition-all flex items-center justify-center gap-2"
            >
              Learn More
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-display mb-4 text-white">
              Why Choose BHO?
            </h2>
            <p className="text-lg sm:text-xl text-bleached-300 max-w-2xl mx-auto">
              Premium service, exceptional quality, unmatched luxury
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="glass rounded-xl p-6 sm:p-8 text-center hover:glass-strong transition-all transform hover:scale-105 border border-bleached-600/40"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 mb-4 sm:mb-6 text-white">
                  {feature.icon}
                </div>
                <h3 className="text-xl sm:text-2xl font-display text-white mb-2 sm:mb-3">
                  {feature.title}
                </h3>
                <p className="text-bleached-300 text-sm sm:text-base">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-bleached-900/30">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-16 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-semibold mb-6 sm:mb-8 text-white">
                What You Get
              </h2>
              <div className="space-y-4 sm:space-y-5">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3 sm:gap-4">
                    <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-status-green flex-shrink-0 mt-1" />
                    <p className="text-base sm:text-lg text-bleached-200">
                      {benefit}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-strong rounded-2xl p-8 sm:p-12 border border-bleached-600/40">
              <div className="text-center mb-6 sm:mb-8">
                <Sparkles className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-white" />
                <h3 className="text-2xl sm:text-3xl font-display text-white mb-2">
                  Ready to Book?
                </h3>
                <p className="text-bleached-300 text-sm sm:text-base">
                  Start your luxury journey today
                </p>
              </div>
              <Link
                to="/book"
                className="w-full px-8 py-4 sm:py-5 bg-bleached-800 hover:bg-bleached-700 border border-bleached-600/40 rounded-lg font-display font-medium text-white text-lg sm:text-xl transform hover:scale-105 transition-all shadow-lg hover:shadow-2xl flex items-center justify-center gap-2"
              >
                Book Your Ride
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-semibold mb-6 sm:mb-8 text-white">
            Get in Touch
          </h2>
          <p className="text-lg sm:text-xl text-bleached-300 mb-8 sm:mb-12">
            Have questions? We're here to help
          </p>
          <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 justify-center items-center">
            <a
              href="tel:+1234567890"
              className="flex items-center gap-3 glass px-6 sm:px-8 py-4 rounded-lg border border-bleached-600/40 hover:glass-strong transition-all"
            >
              <Phone className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              <span className="text-white text-base sm:text-lg">Call Us</span>
            </a>
            <a
              href="mailto:info@bho.com"
              className="flex items-center gap-3 glass px-6 sm:px-8 py-4 rounded-lg border border-bleached-600/40 hover:glass-strong transition-all"
            >
              <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              <span className="text-white text-base sm:text-lg">Email Us</span>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 border-t border-bleached-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0">
            <div className="text-center sm:text-left">
              <h3 className="text-2xl sm:text-3xl font-display text-white mb-2">BHO</h3>
              <p className="text-bleached-400 text-sm sm:text-base">Premium Limo Service</p>
            </div>
            <div className="text-center sm:text-right">
              <p className="text-bleached-400 text-sm sm:text-base">
                © 2024 BHO Premium Limo Service. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage

