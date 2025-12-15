import { useState } from 'react'
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Clock, 
  Car, 
  FileText, 
  DollarSign,
  Plane
} from 'lucide-react'
import LocationAutocomplete from './LocationAutocomplete'

// Helper function to get current date in YYYY-MM-DD format
const getCurrentDate = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Helper function to get current time in HH:MM format
const getCurrentTime = () => {
  const now = new Date()
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

const BookingForm = ({ onSubmit, isSubmitting, user }) => {
  const [formData, setFormData] = useState({
    // User fields (if not logged in)
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    // Booking fields
    service_type: 'drop-off',
    pickup_type: '',
    pickup_location: '',
    pickup_location_full_address: '',
    pickup_location_coordinates: null,
    dropoff_location: '',
    dropoff_location_full_address: '',
    dropoff_location_coordinates: null,
    pickupDate: getCurrentDate(),
    pickupTime: getCurrentTime(),
    dropoffDate: getCurrentDate(),
    dropoffTime: getCurrentTime(),
    hours: 1,
    notes: '',
  })

  const serviceTypes = [
    { value: 'drop-off', label: 'Drop-off', basePrice: 50 },
    { value: 'airport-service', label: 'Airport Service', basePrice: 75 },
    { value: 'hourly', label: 'Hourly', basePrice: 100 },
  ]

  const pickupTypes = [
    { value: 'from_airport', label: 'From Airport' },
    { value: 'to_airport', label: 'To Airport' },
  ]


  const handleDateTimeFocus = (e) => {
    const { name, value } = e.target
    // If field is empty, set to current date/time
    if (!value) {
      if (name.includes('Date')) {
        setFormData(prev => ({ ...prev, [name]: getCurrentDate() }))
      } else if (name.includes('Time')) {
        setFormData(prev => ({ ...prev, [name]: getCurrentTime() }))
      }
    }
  }

  const handleDateTimeClick = (e) => {
    // Open the native picker when clicking anywhere on the field
    if (e.target.showPicker && typeof e.target.showPicker === 'function') {
      e.target.showPicker().catch(err => {
        // Fallback if showPicker is not supported or fails
        e.target.focus()
      })
    } else {
      // Fallback for browsers that don't support showPicker
      e.target.focus()
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    const selectedLocation = e.selectedLocation // Get selectedLocation if it exists
    
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: value
      }
      
      // If a location was selected, store the full_address/name and coordinates
      if (selectedLocation && (name === 'pickup_location' || name === 'dropoff_location')) {
        const fullAddressKey = name === 'pickup_location' 
          ? 'pickup_location_full_address' 
          : 'dropoff_location_full_address'
        const coordinatesKey = name === 'pickup_location'
          ? 'pickup_location_coordinates'
          : 'dropoff_location_coordinates'
        
        // For airport locations in airport service, use name instead of full_address
        const isAirportLocation = selectedLocation.is_airport || false
        const isAirportService = newData.service_type === 'airport-service'
        
        if (isAirportLocation && isAirportService) {
          // Use name for airport locations
          newData[fullAddressKey] = selectedLocation.name || value
          newData[name] = selectedLocation.name || value
        } else {
          // Use full_address for regular locations
          newData[fullAddressKey] = selectedLocation.full_address || value
          newData[name] = selectedLocation.full_address || value
        }
        
        // Store coordinates if available
        if (selectedLocation.coordinates) {
          console.log(`Storing ${coordinatesKey}:`, selectedLocation.coordinates)
          newData[coordinatesKey] = selectedLocation.coordinates
        } else {
          console.warn(`No coordinates found for ${name}`)
        }
      }
      
      // Reset pickup_type when service_type changes away from airport-service
      if (name === 'service_type' && value !== 'airport-service') {
        newData.pickup_type = ''
        // Clear airport locations
        if (newData.pickup_location === 'airport') {
          newData.pickup_location = ''
          newData.pickup_location_full_address = ''
          newData.pickup_location_coordinates = null
        }
        if (newData.dropoff_location === 'airport') {
          newData.dropoff_location = ''
          newData.dropoff_location_full_address = ''
          newData.dropoff_location_coordinates = null
        }
      }
      
      // Reset hours when service_type changes to drop-off
      if (name === 'service_type' && value === 'drop-off') {
        newData.hours = 0
        // Clear dropoff date and time for drop-off service
        newData.dropoffDate = ''
        newData.dropoffTime = ''
      }
      
      // Reset hours when service_type changes to airport-service
      if (name === 'service_type' && value === 'airport-service') {
        newData.hours = 0
      }
      
      // Clear dropoff location when switching to hourly
      if (name === 'service_type' && value === 'hourly') {
        newData.dropoff_location = ''
        newData.dropoff_location_full_address = ''
        newData.dropoff_location_coordinates = null
        // Clear dropoff date and time for hourly service
        newData.dropoffDate = ''
        newData.dropoffTime = ''
      }
      
      return newData
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Prepare users object - use logged in user data or form data
    const usersData = user ? {
      first_name: user.first_name || user.firstName || '',
      last_name: user.last_name || user.lastName || '',
      email: user.email || '',
      phone: user.phone || ''
    } : {
      first_name: formData.first_name,
      last_name: formData.last_name,
      email: formData.email,
      phone: formData.phone
    }
    
    // Handle location for airport-service
    // For airport locations, use name; for others, use full_address
    let pickupLocation = formData.pickup_location
    let dropoffLocation = formData.dropoff_location
    
    // Note: For airport-service with airport locations, the location field already contains the name
    // (set in handleChange when isAirportLocation is true)
    
    // Handle date/time based on service type and pickup_type
    let pickupDateTime, dropoffDateTime
    
    if (formData.service_type === 'airport-service') {
      if (formData.pickup_type === 'from_airport') {
        // Only pickup time required
        pickupDateTime = new Date(`${formData.pickupDate}T${formData.pickupTime}`)
        dropoffDateTime = pickupDateTime // Use same as pickup for dropoff
      } else if (formData.pickup_type === 'to_airport') {
        // Only dropoff time required
        dropoffDateTime = new Date(`${formData.dropoffDate}T${formData.dropoffTime}`)
        pickupDateTime = dropoffDateTime // Use same as dropoff for pickup
      }
    } else if (formData.service_type === 'hourly') {
      // Only pickup time, calculate dropoff from hours
      pickupDateTime = new Date(`${formData.pickupDate}T${formData.pickupTime}`)
      // If dropoff date/time provided, use it; otherwise calculate from hours
      if (formData.dropoffDate && formData.dropoffTime) {
        dropoffDateTime = new Date(`${formData.dropoffDate}T${formData.dropoffTime}`)
      } else {
        dropoffDateTime = new Date(pickupDateTime.getTime() + (formData.hours * 60 * 60 * 1000))
      }
    } else {
      // drop-off: pickup time required, dropoff time optional
      pickupDateTime = new Date(`${formData.pickupDate}T${formData.pickupTime}`)
      // If dropoff date/time provided, use it; otherwise use pickup time
      if (formData.dropoffDate && formData.dropoffTime) {
        dropoffDateTime = new Date(`${formData.dropoffDate}T${formData.dropoffTime}`)
      } else {
        dropoffDateTime = pickupDateTime // Use pickup time if dropoff not provided
      }
    }
    
    const bookingData = {
      users: usersData,
      service_type: formData.service_type,
      pickup_time: pickupDateTime.toISOString(),
      dropoff_time: dropoffDateTime.toISOString(),
      pickup_location: pickupLocation,
      dropoff_location: dropoffLocation,
      hours: formData.service_type === 'hourly' ? formData.hours : null,
      notes: formData.notes || '',
    }
    
    // Add coordinates for pickup location (required by backend)
    if (formData.pickup_location_coordinates && 
        formData.pickup_location_coordinates.lon !== null && 
        formData.pickup_location_coordinates.lon !== undefined &&
        formData.pickup_location_coordinates.lat !== null &&
        formData.pickup_location_coordinates.lat !== undefined) {
      bookingData.pickup_location_coordinates = {
        lon: formData.pickup_location_coordinates.lon,
        lat: formData.pickup_location_coordinates.lat
      }
    } else {
      // Default to 0,0 if coordinates not available (backend requires this field)
      bookingData.pickup_location_coordinates = {
        lon: 0,
        lat: 0
      }
    }
    
    // Add coordinates for dropoff location (required by backend)
    if (formData.dropoff_location_coordinates && 
        formData.dropoff_location_coordinates.lon !== null && 
        formData.dropoff_location_coordinates.lon !== undefined &&
        formData.dropoff_location_coordinates.lat !== null &&
        formData.dropoff_location_coordinates.lat !== undefined) {
      bookingData.dropoff_location_coordinates = {
        lon: formData.dropoff_location_coordinates.lon,
        lat: formData.dropoff_location_coordinates.lat
      }
    } else {
      // Default to 0,0 if coordinates not available (backend requires this field)
      bookingData.dropoff_location_coordinates = {
        lon: 0,
        lat: 0
      }
    }
    
    // Add pickup_type only for airport-service
    if (formData.service_type === 'airport-service' && formData.pickup_type) {
      bookingData.pickup_type = formData.pickup_type
    }
    
    console.log('Final booking data:', JSON.stringify(bookingData, null, 2))
    
    onSubmit(bookingData)
  }

  const isAirportService = formData.service_type === 'airport-service'
  const isDropOff = formData.service_type === 'drop-off'
  const isHourly = formData.service_type === 'hourly'

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
      {/* User Information Section (if not logged in) */}
      {!user && (
        <div className="space-y-4 pb-4 sm:pb-6 border-b border-bleached-700/30">
          <h4 className="text-lg sm:text-xl font-display text-white mb-3 sm:mb-4">Contact Information</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs sm:text-sm font-medium text-white">
                <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
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

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs sm:text-sm font-medium text-white">
                <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
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

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs sm:text-sm font-medium text-white">
                <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg glass border border-bleached-600/40 text-white placeholder-bleached-400 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-bleached-500 focus:border-transparent transition-all"
                placeholder="john@example.com"
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs sm:text-sm font-medium text-white">
                <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                Phone
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg glass border border-bleached-600/40 text-white placeholder-bleached-400 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-bleached-500 focus:border-transparent transition-all"
                placeholder="+1 (555) 123-4567"
              />
            </div>
          </div>
        </div>
      )}

      {/* Booking Details Section */}
      <div className="space-y-4">
        <h4 className="text-lg sm:text-xl font-display text-white mb-3 sm:mb-4">Booking Details</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {/* Service Type - First Field */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs sm:text-sm font-medium text-white">
              <Car className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              Service Type
            </label>
            <select
              name="service_type"
              value={formData.service_type}
              onChange={handleChange}
              required
              className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg glass border border-bleached-600/40 text-white text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-bleached-500 focus:border-transparent transition-all bg-bleached-900"
            >
              {serviceTypes.map(service => (
                <option key={service.value} value={service.value} className="bg-bleached-900">
                  {service.label}{service.value === 'hourly' ? ` - $${service.basePrice}/hr` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Pickup Type - Only for airport-service */}
          {isAirportService && (
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs sm:text-sm font-medium text-white">
                <Plane className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                Pickup Type
              </label>
              <select
                name="pickup_type"
                value={formData.pickup_type}
                onChange={handleChange}
                required
                className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg glass border border-bleached-600/40 text-white text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-bleached-500 focus:border-transparent transition-all bg-bleached-900"
              >
                <option value="" className="bg-bleached-900">Select pickup type</option>
                {pickupTypes.map(type => (
                  <option key={type.value} value={type.value} className="bg-bleached-900">
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Pickup Location */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs sm:text-sm font-medium text-white">
              <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              Pickup Location
              {isAirportService && formData.pickup_type === 'from_airport' && (
                <span className="text-bleached-400 text-xs">(Airport search)</span>
              )}
            </label>
            <LocationAutocomplete
              value={formData.pickup_location}
              onChange={handleChange}
              name="pickup_location"
              placeholder="Enter pickup address"
              isAirport={isAirportService && formData.pickup_type === 'from_airport'}
              required
              className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg glass border border-bleached-600/40 text-white placeholder-bleached-400 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-bleached-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Dropoff Location - Not shown for hourly */}
          {!isHourly && (
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs sm:text-sm font-medium text-white">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                Dropoff Location
                {isAirportService && formData.pickup_type === 'to_airport' && (
                  <span className="text-bleached-400 text-xs">(Airport search)</span>
                )}
              </label>
              <LocationAutocomplete
                value={formData.dropoff_location}
                onChange={handleChange}
                name="dropoff_location"
                placeholder="Enter dropoff address"
                isAirport={isAirportService && formData.pickup_type === 'to_airport'}
                required
                className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg glass border border-bleached-600/40 text-white placeholder-bleached-400 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-bleached-500 focus:border-transparent transition-all"
              />
            </div>
          )}

          {/* Pickup Date - Not shown for to_airport */}
          {!(isAirportService && formData.pickup_type === 'to_airport') && (
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs sm:text-sm font-medium text-white">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                Pickup Date
              </label>
              <input
                type="date"
                name="pickupDate"
                value={formData.pickupDate}
                onChange={handleChange}
                onFocus={handleDateTimeFocus}
                onClick={handleDateTimeClick}
                required
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg glass border border-bleached-600/40 text-white text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-bleached-500 focus:border-transparent transition-all cursor-pointer"
              />
            </div>
          )}

          {/* Pickup Time - Not shown for to_airport */}
          {!(isAirportService && formData.pickup_type === 'to_airport') && (
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs sm:text-sm font-medium text-white">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                Pickup Time
              </label>
              <input
                type="time"
                name="pickupTime"
                value={formData.pickupTime}
                onChange={handleChange}
                onFocus={handleDateTimeFocus}
                onClick={handleDateTimeClick}
                required
                className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg glass border border-bleached-600/40 text-white text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-bleached-500 focus:border-transparent transition-all cursor-pointer"
              />
            </div>
          )}

          {/* Dropoff Date - Not shown for hourly, drop-off, or from_airport */}
          {!isHourly && !isDropOff && !(isAirportService && formData.pickup_type === 'from_airport') && (
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs sm:text-sm font-medium text-white">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                Dropoff Date
              </label>
              <input
                type="date"
                name="dropoffDate"
                value={formData.dropoffDate}
                onChange={handleChange}
                onFocus={handleDateTimeFocus}
                onClick={handleDateTimeClick}
                required
                min={formData.pickupDate || new Date().toISOString().split('T')[0]}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg glass border border-bleached-600/40 text-white text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-bleached-500 focus:border-transparent transition-all cursor-pointer"
              />
            </div>
          )}

          {/* Dropoff Time - Not shown for hourly, drop-off, or from_airport */}
          {!isHourly && !isDropOff && !(isAirportService && formData.pickup_type === 'from_airport') && (
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs sm:text-sm font-medium text-white">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                Dropoff Time
              </label>
              <input
                type="time"
                name="dropoffTime"
                value={formData.dropoffTime}
                onChange={handleChange}
                onFocus={handleDateTimeFocus}
                onClick={handleDateTimeClick}
                required
                className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg glass border border-bleached-600/40 text-white text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-bleached-500 focus:border-transparent transition-all cursor-pointer"
              />
            </div>
          )}

          {/* Hours - Required for hourly, grayed out for drop-off and airport-service */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs sm:text-sm font-medium text-white">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              Duration (hours)
              {isHourly && <span className="text-bleached-400 text-xs">(Required)</span>}
            </label>
            <input
              type="number"
              name="hours"
              value={formData.hours}
              onChange={handleChange}
              min="1"
              required={isHourly}
              disabled={isDropOff || isAirportService}
              className={`w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg glass border border-bleached-600/40 text-white placeholder-bleached-400 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-bleached-500 focus:border-transparent transition-all ${
                (isDropOff || isAirportService) ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              placeholder="1"
            />
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-xs sm:text-sm font-medium text-white">
          <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          Special Requests or Notes
        </label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows="4"
          className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg glass border border-bleached-600/40 text-white placeholder-bleached-400 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-bleached-500 focus:border-transparent transition-all resize-none"
          placeholder="Any special requests, accessibility needs, or additional information..."
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3 sm:py-4 px-6 sm:px-8 bg-bleached-800 hover:bg-bleached-700 border border-bleached-600/40 rounded-lg font-display text-white text-base sm:text-lg transform hover:scale-105 transition-all shadow-lg hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
      >
        {isSubmitting ? 'Processing Booking...' : 'Book Your Ride Now'}
      </button>
    </form>
  )
}

export default BookingForm
