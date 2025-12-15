import { useState, useEffect, useRef } from 'react'
import { MapPin } from 'lucide-react'
import { searchLocations, searchAirports, retrieveLocation } from '../services/mapboxService'

const LocationAutocomplete = ({
  value,
  onChange,
  name,
  placeholder = 'Enter location',
  isAirport = false,
  disabled = false,
  required = true,
  className = '',
}) => {
  const [searchText, setSearchText] = useState(value || '')
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef(null)
  const suggestionsRef = useRef(null)
  const debounceTimerRef = useRef(null)

  // Update search text when value prop changes
  useEffect(() => {
    setSearchText(value || '')
  }, [value])

  // Debounced search function
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    if (searchText.trim().length < 2) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    setIsLoading(true)
    debounceTimerRef.current = setTimeout(async () => {
      try {
        const results = isAirport
          ? await searchAirports(searchText)
          : await searchLocations(searchText)
        
        setSuggestions(results)
        setShowSuggestions(results.length > 0)
        setSelectedIndex(-1)
      } catch (error) {
        console.error('Error fetching suggestions:', error)
        setSuggestions([])
        setShowSuggestions(false)
      } finally {
        setIsLoading(false)
      }
    }, 300) // 300ms debounce

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [searchText, isAirport])

  // Handle input change
  const handleInputChange = (e) => {
    const newValue = e.target.value
    setSearchText(newValue)
    onChange({ target: { name: e.target.name, value: newValue } })
    setShowSuggestions(true)
  }

  // Handle suggestion selection
  const handleSelectSuggestion = async (suggestion) => {
    setShowSuggestions(false)
    setSuggestions([])
    setIsLoading(true)
    
    try {
      // Retrieve full location details using mapbox_id
      if (suggestion.id) {
        const locationDetails = await retrieveLocation(suggestion.id)
        
        // For airport locations in airport service, use name instead of full_address
        const isAirportLocation = locationDetails.feature_type === 'poi' && isAirport
        const displayValue = isAirportLocation 
          ? (locationDetails.name || suggestion.name || '')
          : (locationDetails.full_address || suggestion.full_address || suggestion.name)
        
        setSearchText(displayValue)
        
        // Call onChange with the selected location, full address/name, and coordinates
        console.log('Location selected - coordinates:', locationDetails.coordinates, 'isAirport:', isAirportLocation)
        onChange({
          target: {
            name: name || 'location',
            value: displayValue, // Use name for airports, full_address for others
          },
          selectedLocation: {
            ...suggestion,
            full_address: locationDetails.full_address,
            name: locationDetails.name,
            feature_type: locationDetails.feature_type,
            is_airport: isAirportLocation,
            coordinates: locationDetails.coordinates // Include coordinates from retrieve
          },
        })
      } else {
        // Fallback if no mapbox_id - use full_address if available
        const displayValue = suggestion.full_address || suggestion.place_formatted || suggestion.name
        setSearchText(displayValue)
        onChange({
          target: {
            name: name || 'location',
            value: displayValue,
          },
          selectedLocation: suggestion,
        })
      }
    } catch (error) {
      console.error('Error retrieving location details:', error)
      // Still call onChange with what we have
      const displayValue = suggestion.full_address || suggestion.place_formatted || suggestion.name
      setSearchText(displayValue)
      onChange({
        target: {
          name: name || 'location',
          value: displayValue,
        },
        selectedLocation: suggestion,
      })
    } finally {
      setIsLoading(false)
      inputRef.current?.focus()
    }
  }

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === 'Enter') {
        e.preventDefault()
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex((prev) => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1))
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSelectSuggestion(suggestions[selectedIndex])
        }
        break
      case 'Escape':
        setShowSuggestions(false)
        setSelectedIndex(-1)
        break
      default:
        break
    }
  }

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target) &&
        inputRef.current &&
        !inputRef.current.contains(event.target)
      ) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <div className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          name={name}
          value={searchText}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowSuggestions(true)
            }
          }}
          disabled={disabled}
          required={required}
          placeholder={placeholder}
          className={className}
          autoComplete="off"
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          </div>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-bleached-900/95 backdrop-blur-md border border-bleached-600/40 rounded-lg shadow-xl max-h-60 overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion.id || index}
              type="button"
              onClick={() => handleSelectSuggestion(suggestion)}
              className={`w-full text-left px-4 py-3 hover:bg-bleached-800/50 transition-colors ${
                index === selectedIndex ? 'bg-bleached-800/50' : ''
              } ${index !== suggestions.length - 1 ? 'border-b border-bleached-700/30' : ''}`}
            >
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-bleached-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white font-medium truncate">
                    {suggestion.name}
                  </p>
                  {suggestion.place_formatted && suggestion.place_formatted !== suggestion.name && (
                    <p className="text-xs text-bleached-400 truncate mt-0.5">
                      {suggestion.place_formatted}
                    </p>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default LocationAutocomplete

