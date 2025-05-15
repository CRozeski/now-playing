import { createApp } from 'vue'
import { createStore } from 'vuex'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import '@fortawesome/fontawesome-free/css/all.css'

// Initialize spotifyConfig if it doesn't exist
if (!window.spotifyConfig) {
  window.spotifyConfig = {
    clientId: process.env.VUE_APP_SPOTIFY_CLIENT_ID || '',
    redirectUri: process.env.VUE_APP_REDIRECT_URI || 'http://localhost:8080/callback'
  }
}

// Log configuration on startup for debugging
console.log('Spotify configuration loaded:', { 
  clientId: window.spotifyConfig.clientId ? 
    `${window.spotifyConfig.clientId.substring(0,4)}...${window.spotifyConfig.clientId.substring(window.spotifyConfig.clientId.length-4)}` : 
    'Not set',
  redirectUri: window.spotifyConfig.redirectUri
})


// Create store
const store = createStore({
  state() {
    return {
      token: localStorage.getItem('spotify_token') || null,
      refreshToken: localStorage.getItem('spotify_refresh_token') || null,
      currentTrack: null,
      isPlaying: false
    }
  },
  mutations: {
    setToken(state, token) {
      state.token = token
      localStorage.setItem('spotify_token', token)
    },
    setRefreshToken(state, refreshToken) {
      state.refreshToken = refreshToken
      localStorage.setItem('spotify_refresh_token', refreshToken)
    },
    setCurrentTrack(state, track) {
      state.currentTrack = track
    },
    setIsPlaying(state, isPlaying) {
      state.isPlaying = isPlaying
    },
    logout(state) {
      state.token = null
      state.refreshToken = null
      state.currentTrack = null
      state.isPlaying = false
      localStorage.removeItem('spotify_token')
      localStorage.removeItem('spotify_refresh_token')
    }
  },
  actions: {
    async fetchCurrentTrack({ commit, state, dispatch }) {
      if (!state.token) return
      
      try {
        const response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
          headers: {
            'Authorization': `Bearer ${state.token}`
          }
        })
        
        if (response.status === 204) {
          // No track currently playing
          commit('setCurrentTrack', null)
          commit('setIsPlaying', false)
          return
        }
        
        if (!response.ok) {
          throw new Error('Failed to fetch current track')
        }
        
        const data = await response.json()
        commit('setCurrentTrack', data.item)
        commit('setIsPlaying', data.is_playing)
      } catch (error) {
        console.error('Error fetching current track:', error)
        // Handle token expiration
        if (error.response && error.response.status === 401) {
          await dispatch('refreshAccessToken')
        }
      }
    },
    async refreshAccessToken({ commit, state }) {
      if (!state.refreshToken) return
      
      const CLIENT_ID = process.env.VUE_APP_SPOTIFY_CLIENT_ID
      // In a real app, you'd handle this server-side to protect your client secret
      const CLIENT_SECRET = process.env.VUE_APP_SPOTIFY_CLIENT_SECRET
      
      try {
        const response = await fetch('https://accounts.spotify.com/api/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + btoa(CLIENT_ID + ':' + CLIENT_SECRET)
          },
          body: new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: state.refreshToken
          })
        })
        
        if (!response.ok) {
          throw new Error('Failed to refresh token')
        }
        
        const data = await response.json()
        commit('setToken', data.access_token)
        if (data.refresh_token) {
          commit('setRefreshToken', data.refresh_token)
        }
      } catch (error) {
        console.error('Error refreshing token:', error)
        commit('logout')
      }
    }
  }
})

// Create router
const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: () => import('./components/NowPlaying.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('./components/LoginPage.vue')
    },
    {
      path: '/callback',
      name: 'Callback',
      component: () => import('./components/CallbackPage.vue')
    }
  ]
})

// Navigation guard
router.beforeEach((to, from, next) => {
  const isAuthenticated = store.state.token !== null
  
  if (to.matched.some(record => record.meta.requiresAuth) && !isAuthenticated) {
    next({ name: 'Login' })
  } else {
    next()
  }
})

const app = createApp(App)
app.use(store)
app.use(router)
app.mount('#app')