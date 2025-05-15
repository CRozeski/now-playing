class SpotifyService {
  constructor() {
    this.baseUrl = 'https://api.spotify.com/v1'
  }
  
  // Helper method to make authenticated requests
  async makeRequest(endpoint, method = 'GET', body = null) {
    const token = localStorage.getItem('spotify_token')
    
    if (!token) {
      throw new Error('No authentication token available')
    }
    
    const options = {
      method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
    
    if (body && method !== 'GET') {
      options.body = JSON.stringify(body)
    }
    
    const response = await fetch(`${this.baseUrl}${endpoint}`, options)
    
  // Handle token expiration
    if (response.status === 401) {
      console.log('Token expired, attempting to refresh...')
      const refreshed = await this.refreshToken()
      if (refreshed) {
        // Retry the request with new token
        return this.makeRequest(endpoint, method, body)
      } else {
        throw new Error('Failed to refresh token')
      }
    }
    
    // Return null for empty responses (status 204)
    if (response.status === 204) {
      return null
    }
    
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`)
    }
    
    return await response.json()
  }
  
  // Add a token refresh method
  async refreshToken() {
    const refreshToken = localStorage.getItem('spotify_refresh_token')
    if (!refreshToken) {
      return false
    }
    
    const CLIENT_ID = window.spotifyConfig?.clientId || process.env.VUE_APP_SPOTIFY_CLIENT_ID
    const CLIENT_SECRET = process.env.VUE_APP_SPOTIFY_CLIENT_SECRET
    
    if (!CLIENT_ID || !CLIENT_SECRET) {
      console.error('Missing client credentials for token refresh')
      return false
    }
    
    try {
      const authString = `${CLIENT_ID}:${CLIENT_SECRET}`
      const base64Auth = btoa(authString)
      
      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${base64Auth}`
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: refreshToken
        })
      })
      
      if (!response.ok) {
        console.error('Token refresh failed:', await response.text())
        return false
      }
      
      const data = await response.json()
      localStorage.setItem('spotify_token', data.access_token)
      
      // Save new refresh token if provided
      if (data.refresh_token) {
        localStorage.setItem('spotify_refresh_token', data.refresh_token)
      }
      
      return true
    } catch (error) {
      console.error('Error refreshing token:', error)
      return false
    }
  }
  
  // Get the user's currently playing track
  async getCurrentlyPlaying() {
    return await this.makeRequest('/me/player/currently-playing')
  }
  
  // Get the user's playback state
  async getPlaybackState() {
    return await this.makeRequest('/me/player')
  }
  
  // Control playback
  async play() {
    return await this.makeRequest('/me/player/play', 'PUT')
  }
  
  async pause() {
    return await this.makeRequest('/me/player/pause', 'PUT')
  }
  
  async nextTrack() {
    return await this.makeRequest('/me/player/next', 'POST')
  }
  
  async previousTrack() {
    return await this.makeRequest('/me/player/previous', 'POST')
  }
}

export default new SpotifyService()