// Utility functions for JWT token management

export const decodeToken = (token) => {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch (error) {
    console.error('Error decoding token:', error)
    return null
  }
}

export const isTokenExpired = (token) => {
  if (!token) return true
  
  const decoded = decodeToken(token)
  if (!decoded || !decoded.exp) return true
  
  // Check if token expires in less than 5 minutes (300 seconds)
  const expirationTime = decoded.exp * 1000 // Convert to milliseconds
  const currentTime = Date.now()
  const timeUntilExpiry = expirationTime - currentTime
  
  // Return true if expired or expires in less than 5 minutes
  return timeUntilExpiry < 300000 // 5 minutes in milliseconds
}

export const getTokenExpirationTime = (token) => {
  if (!token) return null
  
  const decoded = decodeToken(token)
  if (!decoded || !decoded.exp) return null
  
  return decoded.exp * 1000 // Return in milliseconds
}

