// src/components/CallbackPage.vue
<template>
  <div class="callback-container">
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Connecting to Spotify...</p>
    </div>
    <div v-if="error" class="error-message">
      <p>{{ error }}</p>
      <button @click="returnToLogin" class="retry-button">Return to Login</button>
      <button v-if="showDiagnostics" @click="runDiagnostics" class="retry-button diagnostics-button">
        Run Diagnostics
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CallbackPage',
  data() {
    return {
      loading: true,
      error: null,
      showDiagnostics: false
    }
  },
  created() {
    this.handleCallback()
  },
  methods: {
    async handleCallback() {
      const urlParams = new URLSearchParams(window.location.search)
      const code = urlParams.get('code')
      const error = urlParams.get('error')
      
      if (error) {
        this.error = `Spotify authentication error: ${error}`
        this.loading = false
        return
      }
      
      if (!code) {
        this.error = "No authorization code received from Spotify"
        this.loading = false
        return
      }
      
      try {
        // Import the auth proxy service
        const { exchangeCodeForToken } = await import('@/services/authProxy')
        
        // Get the redirect URI from the auth proxy
        const redirectUri = process.env.VUE_APP_REDIRECT_URI || 'http://localhost:8080/callback'
        console.log("Using redirect URI:", redirectUri)
        
        // Exchange the code for a token using our proxy service
        const data = await exchangeCodeForToken(code, redirectUri)
        console.log("Token exchange successful")
        
        // Store tokens in Vuex store
        this.$store.commit('setToken', data.access_token)
        this.$store.commit('setRefreshToken', data.refresh_token)
        
        // Redirect to main page
        this.$router.push('/')
      } catch (error) {
        console.error("Authentication error:", error)
        
        // Check if this is likely a client ID or configuration issue
        if (error.message.includes('invalid_client') || error.message.includes('401')) {
          this.error = `Authentication failed: Invalid client credentials. Please check the configuration.`
          this.showDiagnostics = true
        } else {
          this.error = `Authentication error: ${error.message}`
        }
        
        this.loading = false
      }
    },
    
    returnToLogin() {
      this.$router.push('/login')
    },
    
    runDiagnostics() {
      this.$router.push('/diagnostics')
    }
  }
}
</script>

<style scoped>
.callback-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #121212;
  color: white;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  border-top-color: #1DB954;
  animation: spin 1s ease-in-out infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-message {
  background-color: #282828;
  padding: 2rem;
  border-radius: 8px;
  max-width: 500px;
  text-align: center;
}

.retry-button {
  background-color: #1DB954;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 30px;
  font-weight: bold;
  cursor: pointer;
  margin-top: 20px;
}

.retry-button:hover {
  background-color: #1ed760;
}

.diagnostics-button {
  margin-top: 1rem;
  background-color: #535353;
}

.diagnostics-button:hover {
  background-color: #646464;
}
</style>