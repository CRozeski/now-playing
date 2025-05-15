// src/components/LoginPage.vue
<template>
  <div class="login-container">
    <div class="login-card">
      <div class="spotify-logo">
        <!-- Simple Spotify logo with CSS -->
        <div class="spotify-icon"></div>
      </div>
      <h1>Spotify Now Playing</h1>
      <p>Connect your Spotify account to see what you're currently listening to</p>
      <button @click="login" class="login-button">
        Connect with Spotify
      </button>
      
      <div class="troubleshoot-link">
        <a @click="goToDiagnostics" href="#">Having trouble connecting?</a>
      </div>
      
      <div v-if="showDebug" class="debug-info">
        <h3>Debug Info</h3>
        <p>Client ID: {{ clientIdDisplay }}</p>
        <p>Redirect URI: {{ redirectUri }}</p>
        <button @click="testEnvVars" class="debug-button">Test Environment Variables</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LoginPage',
  data() {
    return {
      showDebug: false,
      clientId: window.spotifyConfig?.clientId || process.env.VUE_APP_SPOTIFY_CLIENT_ID || '',
      redirectUri: window.spotifyConfig?.redirectUri || process.env.VUE_APP_REDIRECT_URI || `${window.location.origin}/callback`
    }
  },
  computed: {
    clientIdDisplay() {
      if (!this.clientId) return 'Not set'
      return this.clientId.substring(0, 4) + '...' + this.clientId.substring(this.clientId.length - 4)
    }
  },
  created() {
    // Check if environment variables are loaded
    if (!this.clientId) {
      console.error('Client ID not found in environment variables')
      this.showDebug = true
    }
  },
  methods: {
    login() {
      const CLIENT_ID = window.spotifyConfig?.clientId || process.env.VUE_APP_SPOTIFY_CLIENT_ID
      
      if (!CLIENT_ID) {
        alert('Spotify Client ID is missing. Please check your configuration.')
        this.showDebug = true
        return
      }
      
      const REDIRECT_URI = this.redirectUri
      const scopes = [
        'user-read-currently-playing',
        'user-read-playback-state',
        'user-modify-playback-state'
      ]
      
      const authUrl = new URL('https://accounts.spotify.com/authorize')
      authUrl.searchParams.append('client_id', CLIENT_ID)
      authUrl.searchParams.append('response_type', 'code')
      authUrl.searchParams.append('redirect_uri', REDIRECT_URI)
      authUrl.searchParams.append('scope', scopes.join(' '))
      
      console.log('Redirecting to:', authUrl.toString())
      window.location.href = authUrl.toString()
    },
    testEnvVars() {
      console.log('Configuration:')
      console.log('window.spotifyConfig Client ID:', window.spotifyConfig?.clientId)
      console.log('window.spotifyConfig Redirect URI:', window.spotifyConfig?.redirectUri)
      console.log('VUE_APP_SPOTIFY_CLIENT_ID:', process.env.VUE_APP_SPOTIFY_CLIENT_ID)
      console.log('VUE_APP_REDIRECT_URI:', process.env.VUE_APP_REDIRECT_URI)
      console.log('Is Production:', process.env.NODE_ENV === 'production')
      
      if (!this.clientId) {
        alert('Client ID not found! Check both .env file and public/config.js.')
      } else {
        alert('Client ID found! Check console for details. Source: ' + 
              (window.spotifyConfig?.clientId ? 'config.js' : 'environment variables'))
      }
    },
    
    goToDiagnostics() {
      this.$router.push('/diagnostics')
    }
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #121212;
}

.login-card {
  background-color: #282828;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
  max-width: 400px;
  color: white;
}

.spotify-logo {
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
}

.spotify-icon {
  width: 60px;
  height: 60px;
  background-color: #1DB954;
  border-radius: 50%;
  position: relative;
}

.spotify-icon:after {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-40%, -50%);
  width: 0;
  height: 0;
  border-top: 10px solid transparent;
  border-bottom: 10px solid transparent;
  border-left: 16px solid white;
}

h1 {
  color: #1DB954;
  margin-bottom: 1rem;
}

p {
  margin-bottom: 2rem;
  color: #b3b3b3;
}

.login-button {
  background-color: #1DB954;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 30px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s;
  width: 100%;
}

.login-button:hover {
  background-color: #1ed760;
}

.troubleshoot-link {
  margin-top: 1rem;
  font-size: 0.9rem;
}

.troubleshoot-link a {
  color: #b3b3b3;
  text-decoration: underline;
  cursor: pointer;
}

.troubleshoot-link a:hover {
  color: #1DB954;
}

.debug-info {
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #535353;
  text-align: left;
}

.debug-info h3 {
  color: #b3b3b3;
  font-size: 1rem;
  margin-bottom: 0.5rem;
}

.debug-info p {
  margin: 0.5rem 0;
  font-family: monospace;
  font-size: 0.9rem;
}

.debug-button {
  background-color: #535353;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  margin-top: 1rem;
  cursor: pointer;
  font-size: 0.8rem;
}

.debug-button:hover {
  background-color: #646464;
}
</style>