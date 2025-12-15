/**
 * Mapbox Search API Service
 * Handles location autocomplete suggestions using Mapbox Searchbox API
 */

const MAPBOX_API_TOKEN = import.meta.env.VITE_MAPBOX_API_TOKEN
const MAPBOX_SESSION_TOKEN = import.meta.env.VITE_MAPBOX_SESSION_TOKEN || generateSessionToken()

// Generate a unique session token if not provided
function generateSessionToken() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Search for general locations (pickup/dropoff)
 * @param {string} searchText - The search query
 * @returns {Promise<Array>} Array of location suggestions
 */
export const searchLocations = async (searchText) => {
  if (!searchText || searchText.trim().length < 2) {
    return []
  }

  if (!MAPBOX_API_TOKEN) {
    console.error('Mapbox API token is not configured')
    return []
  }

  try {
    const url = `https://api.mapbox.com/search/searchbox/v1/suggest?q=${encodeURIComponent(searchText)}&session_token=${MAPBOX_SESSION_TOKEN}&limit=5&navigation_profile=driving&access_token=${MAPBOX_API_TOKEN}`
    
    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error(`Mapbox API error: ${response.status}`)
    }

    const data = await response.json()
    
    // Transform the response to a simpler format
    return data.suggestions?.map(suggestion => ({
      id: suggestion.mapbox_id,
      name: suggestion.name,
      full_address: suggestion.full_address || suggestion.name,
      place_formatted: suggestion.place_formatted || suggestion.name,
      feature_type: suggestion.feature_type,
      coordinates: suggestion.coordinates,
      raw: suggestion // Keep raw data for potential future use
    })) || []
  } catch (error) {
    console.error('Error searching locations:', error)
    return []
  }
}

/**
 * Search for airports only
 * @param {string} searchText - The search query
 * @returns {Promise<Array>} Array of airport suggestions
 */
export const searchAirports = async (searchText) => {
  if (!searchText || searchText.trim().length < 2) {
    return []
  }

  if (!MAPBOX_API_TOKEN) {
    console.error('Mapbox API token is not configured')
    return []
  }

  try {
    const url = `https://api.mapbox.com/search/searchbox/v1/suggest?q=${encodeURIComponent(searchText)}&session_token=${MAPBOX_SESSION_TOKEN}&country=us&types=poi%2Ccountry&poi_category=airport%2Cairport_gate%2Cairport_terminal&limit=4&navigation_profile=driving&access_token=${MAPBOX_API_TOKEN}`
    
    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error(`Mapbox API error: ${response.status}`)
    }

    const data = await response.json()
    
    // Transform the response to a simpler format
    return data.suggestions?.map(suggestion => ({
      id: suggestion.mapbox_id,
      name: suggestion.name,
      full_address: suggestion.full_address || suggestion.name,
      place_formatted: suggestion.place_formatted || suggestion.name,
      feature_type: suggestion.feature_type,
      coordinates: suggestion.coordinates,
      raw: suggestion // Keep raw data for potential future use
    })) || []
  } catch (error) {
    console.error('Error searching airports:', error)
    return []
  }
}

/**
 * Retrieve full location details by mapbox_id
 * @param {string} mapboxId - The mapbox_id from the suggestion
 * @returns {Promise<Object>} Full location details including full_address
 */
export const retrieveLocation = async (mapboxId) => {
  if (!mapboxId) {
    throw new Error('Mapbox ID is required')
  }

  if (!MAPBOX_API_TOKEN) {
    throw new Error('Mapbox API token is not configured')
  }

  try {
    const url = `https://api.mapbox.com/search/searchbox/v1/retrieve/${mapboxId}?session_token=${MAPBOX_SESSION_TOKEN}&access_token=${MAPBOX_API_TOKEN}`
    
    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error(`Mapbox API error: ${response.status}`)
    }

    const data = await response.json()
    
    // Log full response for debugging
    console.log('Mapbox retrieve full response:', JSON.stringify(data, null, 2))
    
    // Mapbox retrieve API returns a FeatureCollection with features array
    // Extract from features[0].properties
    let fullAddress = ''
    let coordinates = null
    let name = ''
    let placeFormatted = ''
    let featureType = ''
    
    if (data.type === 'FeatureCollection' && data.features && data.features.length > 0) {
      const feature = data.features[0]
      const properties = feature.properties || {}
      const geometry = feature.geometry || {}
      
      // Extract full address
      fullAddress = properties.full_address || ''
      
      // Extract coordinates - check multiple possible locations
      // 1. properties.coordinates (as per user's example)
      // 2. geometry.coordinates (GeoJSON format: [longitude, latitude])
      if (properties.coordinates) {
        const lon = properties.coordinates.longitude !== undefined 
          ? properties.coordinates.longitude 
          : (properties.coordinates.lon !== undefined ? properties.coordinates.lon : null)
        const lat = properties.coordinates.latitude !== undefined 
          ? properties.coordinates.latitude 
          : (properties.coordinates.lat !== undefined ? properties.coordinates.lat : null)
        
        if (lon !== null && lat !== null) {
          coordinates = { lon, lat }
        }
      } else if (geometry.coordinates && Array.isArray(geometry.coordinates) && geometry.coordinates.length >= 2) {
        // GeoJSON format: [longitude, latitude]
        coordinates = {
          lon: geometry.coordinates[0],
          lat: geometry.coordinates[1]
        }
      }
      
      // Extract name, place_formatted, and feature_type
      name = properties.name || properties.name_preferred || ''
      placeFormatted = properties.place_formatted || ''
      featureType = properties.feature_type || ''
    } else {
      // Fallback for different response structure
      fullAddress = data.full_address || ''
      name = data.name || ''
      placeFormatted = data.place_formatted || ''
      
      if (data.coordinates) {
        const lon = data.coordinates.longitude !== undefined 
          ? data.coordinates.longitude 
          : (data.coordinates.lon !== undefined ? data.coordinates.lon : null)
        const lat = data.coordinates.latitude !== undefined 
          ? data.coordinates.latitude 
          : (data.coordinates.lat !== undefined ? data.coordinates.lat : null)
        
        if (lon !== null && lat !== null) {
          coordinates = { lon, lat }
        }
      }
    }
    
    // Log for debugging
    console.log('Mapbox retrieve response - coordinates:', coordinates)
    
    // Return the full address and coordinates from the response
    return {
      full_address: fullAddress,
      coordinates: coordinates,
      name: name,
      place_formatted: placeFormatted,
      feature_type: featureType,
      raw: data // Keep raw data for potential future use
    }
  } catch (error) {
    console.error('Error retrieving location:', error)
    throw error
  }
}

export { MAPBOX_SESSION_TOKEN }

