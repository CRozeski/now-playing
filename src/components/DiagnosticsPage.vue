<template>
  <div class="diagnostics-container">
    <div class="diagnostics-card">
      <h1>Spotify Configuration Diagnostics</h1>
      
      <div class="status-block">
        <h2>Client ID</h2>
        <div class="status" :class="{ 'status-ok': hasClientId, 'status-error': !hasClientId }">
          <i :class="hasClientId ? 'fas fa-check-circle' : 'fas fa-times-circle'"></i>
          <span>{{ clientIdStatus }}</span>
        </div>
        <p class="source" v-if="hasClientId">Source: {{ clientIdSource }}</p>
      </div>
      
      <div class="status-block">
        <h2>Redirect URI</h2>
        <div class="status" :class="{ 'status-ok': hasRedirectUri, 'status-error': !hasRedirectUri }">
          <i :class="hasRedirectUri ? 'fas fa-check-circle' : 'fas fa-times-circle'"></i>
          <span>{{ redirectUriStatus }}</span>
        </div>
        <p class="source" v-if="hasRedirectUri">Source: {{ redirectUriSource }}</p>
      </div>
        <div class="status-block">
        <h2>Client Secret</h2>
        <div class="status" :class="{ 'status-ok': hasClientSecret, 'status-error': !hasClientSecret }">
          <i :class="hasClientSecret ? 'fas fa-check-circle' : 'fas fa-times-circle'"></i>
          <span>{{ clientSecretStatus }}</span>
        </div>
        <p class="source" v-if="hasClientSecret">Source: Environment Variable</p>
      </div>
      
      <div class="status-block">
        <h2>Client Secret Security</h2>
        <div class="status" :class="{ 'status-ok': isClientSecretSecured() }">
          <i :class="isClientSecretSecured() ? 'fas fa-check-circle' : 'fas fa-exclamation-triangle'"></i>
          <span>{{ isClientSecretSecured() ? 'Properly secured' : 'WARNING: Client secret might be exposed!' }}</span>
        </div>
        <p class="hint" v-if="!isClientSecretSecured()">
          Client secrets should never be directly included in client-side code.
          Use a server-side proxy instead.
        </p>
      </div>
      
      <div class="solutions" v-if="!hasClientId || !hasRedirectUri || !hasClientSecret">
        <h2>Possible Solutions</h2>
        <ol>
          <li v-if="!hasClientId || !hasRedirectUri">
            Check that <code>public/config.js</code> has correct values:
            <pre>
window.spotifyConfig = {
  clientId: '27aa67e34db74f19a9d8ff298b467189',
  redirectUri: 'http://localhost:8080/callback'
}
            </pre>
          </li>
          <li v-if="!hasClientId || !hasRedirectUri || !hasClientSecret">
            Ensure <code>.env</code> file exists at project root with:
            <pre>
VUE_APP_SPOTIFY_CLIENT_ID=27aa67e34db74f19a9d8ff298b467189
VUE_APP_SPOTIFY_CLIENT_SECRET=03890a7c9f124f818fcd3cf2d8f68269
VUE_APP_REDIRECT_URI=http://localhost:8080/callback
            </pre>
          </li>
          <li>Restart the development server with <code>npm run serve</code></li>
          <li>Clear your browser cache and reload the page</li>
          <li>Make sure <code>index.html</code> loads <code>config.js</code> before the Vue application</li>
        </ol>
      </div>
      
      <div class="actions">
        <button @click="goToLogin" class="button">Return to Login</button>
        <button @click="runTests" class="button secondary">Run Diagnostic Tests</button>
      </div>
      
      <div class="advanced" v-if="showAdvanced">
        <h2>Advanced Diagnostics</h2>
        <pre>{{ JSON.stringify(diagnosticData, null, 2) }}</pre>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DiagnosticsPage',
  data() {
    return {
      showAdvanced: false,
      diagnosticData: {}
    }
  },
  computed: {
    configClientId() {
      return window.spotifyConfig?.clientId || ''
    },
    envClientId() {
      return process.env.VUE_APP_SPOTIFY_CLIENT_ID || ''
    },
    configRedirectUri() {
      return window.spotifyConfig?.redirectUri || ''
    },
    envRedirectUri() {
      return process.env.VUE_APP_REDIRECT_URI || ''
    },
    envClientSecret() {
      return process.env.VUE_APP_SPOTIFY_CLIENT_SECRET || ''
    },
    hasClientId() {
      return !!this.configClientId || !!this.envClientId
    },
    hasRedirectUri() {
      return !!this.configRedirectUri || !!this.envRedirectUri
    },
    hasClientSecret() {
      return !!this.envClientSecret
    },
    clientIdStatus() {
      return this.hasClientId 
        ? `Found: ${this.clientIdDisplay(this.configClientId || this.envClientId)}` 
        : 'Not found'
    },
    redirectUriStatus() {
      return this.hasRedirectUri 
        ? `Found: ${this.configRedirectUri || this.envRedirectUri}` 
        : 'Not found'
    },    clientSecretStatus() {
      return this.hasClientSecret 
        ? 'Found (hidden for security)' 
        : 'Not found'
    },
    
    // Check if the client secret is correctly secured
    isClientSecretSecured() {
      const clientSecretExposed = document.documentElement.innerHTML.includes(this.envClientSecret);
      return !clientSecretExposed;
    },
    clientIdSource() {
      if (this.configClientId) return 'config.js'
      if (this.envClientId) return 'Environment Variable'
      return 'None'
    },
    redirectUriSource() {
      if (this.configRedirectUri) return 'config.js'
      if (this.envRedirectUri) return 'Environment Variable' 
      return 'None'
    }
  },
  created() {
    this.runTests()
  },
  methods: {
    clientIdDisplay(id) {
      if (!id) return 'Not set'
      return id.substring(0, 4) + '...' + id.substring(id.length - 4)
    },
    goToLogin() {
      this.$router.push('/login')
    },
    runTests() {
      this.showAdvanced = true
      this.diagnosticData = {
        environment: {
          nodeEnv: process.env.NODE_ENV,
          baseUrl: process.env.BASE_URL,
          window: typeof window !== 'undefined',
          localStorage: typeof localStorage !== 'undefined'
        },
        spotify: {
          configLoaded: typeof window.spotifyConfig !== 'undefined',
          configClientId: this.clientIdDisplay(this.configClientId),
          configClientIdSource: this.clientIdSource,
          configRedirectUri: this.configRedirectUri,
          envVarsAvailable: {
            clientId: !!process.env.VUE_APP_SPOTIFY_CLIENT_ID,
            clientSecret: !!process.env.VUE_APP_SPOTIFY_CLIENT_SECRET,
            redirectUri: !!process.env.VUE_APP_REDIRECT_URI
          }
        }
      }
    }
  }
}
</script>

<style scoped>
.diagnostics-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #121212;
  color: white;
  padding: 2rem 1rem;
}

.diagnostics-card {
  background-color: #282828;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
  width: 100%;
  max-width: 800px;
}

h1 {
  color: #1DB954;
  margin-bottom: 2rem;
}

h2 {
  color: #b3b3b3;
  margin-top: 1.5rem;
  margin-bottom: 0.5rem;
}

.status-block {
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #3e3e3e;
}

.status {
  display: flex;
  align-items: center;
}

.status i {
  margin-right: 0.5rem;
  font-size: 1.5rem;
}

.status-ok i {
  color: #1DB954;
}

.status-error i {
  color: #ff4f4f;
}

.source {
  margin-top: 0.5rem;
  font-size: 0.9rem;
  color: #b3b3b3;
}

pre {
  background-color: #1e1e1e;
  padding: 1rem;
  border-radius: 4px;
  overflow-x: auto;
  white-space: pre-wrap;
  word-wrap: break-word;
  font-family: monospace;
  margin: 1rem 0;
}

code {
  background-color: #1e1e1e;
  padding: 2px 5px;
  border-radius: 3px;
  font-family: monospace;
}

.solutions {
  margin-top: 2rem;
  padding: 1.5rem;
  background-color: #333333;
  border-radius: 4px;
}

.solutions ol {
  padding-left: 1.5rem;
}

.solutions li {
  margin-bottom: 1rem;
}

.actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

.button {
  background-color: #1DB954;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 30px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s;
}

.button:hover {
  background-color: #1ed760;
}

.secondary {
  background-color: #535353;
}

.secondary:hover {
  background-color: #646464;
}

.advanced {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #3e3e3e;
}
</style>
