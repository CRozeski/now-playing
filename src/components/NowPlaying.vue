// src/components/NowPlaying.vue
<template>
  <div class="now-playing-container">
    <div v-if="!currentTrack" class="no-track">
      <p>No track currently playing</p>
      <button @click="refreshTrack" class="refresh-button">Refresh</button>
    </div>
    
    <div v-else class="track-card">
      <!-- Album Cover (Now Larger) -->
      <div class="album-cover-container">
        <img :src="currentTrack.album.images[0].url" alt="Album Cover" class="album-cover" />
      </div>
      
      <!-- Track Info -->
      <div class="track-info">
        <h2>{{ currentTrack.name }}</h2>
        <p class="artist">{{ artistNames }}</p>
        <p class="album">{{ currentTrack.album.name }}</p>
      </div>
      
      <!-- Progress Bar 
      <div class="progress-container">
        <div class="progress-bar">
          <div class="progress" :style="{ width: progressPercentage + '%' }"></div>
        </div>
        <div class="time-info">
          <span>{{ formatTime(progressMs) }}</span>
          <span>{{ formatTime(currentTrack.duration_ms) }}</span>
        </div>
      </div>
    -->
      <!-- Music Player Controls -->
      <MusicPlayer />
    </div>
  </div>
</template>

<script>
import MusicPlayer from './MusicPlayer.vue'

export default {
  name: 'NowPlaying',
  components: {
    MusicPlayer
  },
  data() {
    return {
      progressMs: 0,
      progressInterval: null,
      pollingInterval: null,
      pollingFrequency: 1000
    }
  },
  computed: {
    currentTrack() {
      return this.$store.state.currentTrack
    },
    isPlaying() {
      return this.$store.state.isPlaying
    },
    artistNames() {
      if (!this.currentTrack) return ''
      return this.currentTrack.artists.map(artist => artist.name).join(', ')
    },
    progressPercentage() {
      if (!this.currentTrack) return 0
      return (this.progressMs / this.currentTrack.duration_ms) * 100
    }
  },
  methods: {
    formatTime(ms) {
      const seconds = Math.floor((ms / 1000) % 60)
      const minutes = Math.floor((ms / (1000 * 60)) % 60)
      
      return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
    },
    refreshTrack() {
      this.$store.dispatch('fetchCurrentTrack')
    },
    startProgressTimer() {
      if (this.progressInterval) {
        clearInterval(this.progressInterval)
      }
      
      this.progressInterval = setInterval(() => {
        if (this.isPlaying && this.progressMs < this.currentTrack.duration_ms) {
          this.progressMs += 1000
        } else if (this.progressMs >= this.currentTrack.duration_ms) {
          this.refreshTrack()
        }
      }, 1000)
    }
  },
  created() {
    this.refreshTrack()
    
    // Poll for track updates every .5 seconds
    this.trackInterval = setInterval(() => {
      this.refreshTrack()
    }, 500)
  },
  watch: {
    currentTrack(newTrack) {
      if (newTrack) {
        // Start progress timer
        this.progressMs = this.$store.state.progressMs || 0;
        this.startProgressTimer()
      }
    },
    isPlaying(playing) {
      if (playing) {
        this.startProgressTimer()
      } else if (this.progressInterval) {
        clearInterval(this.progressInterval)
      }
    }
  },
  beforeUnmount() {
    if (this.progressInterval) {
      clearInterval(this.progressInterval)
    }
    
    if (this.trackInterval) {
      clearInterval(this.trackInterval)
    }
  }
}
</script>

<style scoped>
.now-playing-container {
  max-width: 100%;
  margin: 0 auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
}

.no-track {
  text-align: center;
  background-color: #24356f;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
  margin-top: 2rem;
  width: 90%;
  max-width: 500px;
}

.refresh-button {
  background-color: #1DB954;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 30px;
  margin-top: 1rem;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.2s ease;
}

.refresh-button:hover {
  background-color: #1ed760;
  transform: scale(1.05);
}

.track-card {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}

.album-cover-container {
  width: 100%;
  padding: 1rem;
  display: flex;
  justify-content: center;
}

.album-cover {
  width: 100%;
  max-width: 600px;
  height: auto;
  border-radius: 12px;
  box-shadow: 8px 8px 24px rgba(118, 118, 118, 0.5);
  object-fit: cover;
}

.track-info {
  padding: 1.5rem;
  text-align: center;
  margin-top: 1rem;
}

h2 {
  margin: 0;
  font-size: 2rem;
  color: white;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.artist {
  color: #bccad0;
  margin: 0.5rem 0;
  font-size: 1.2rem;
  font-weight: 500;
}

.album {
  color: #9ba8ae;
  margin-bottom: 0.5rem;
  font-weight: 400;
}

.progress-container {
  margin: 1rem 2rem;
}

.progress-bar {
  height: 6px;
  background-color: #414141;
  border-radius: 3px;
  overflow: hidden;
  cursor: pointer;
}

.progress {
  height: 100%;
  background-color: #ff0000;
  transition: width 0.1s linear;
}

.time-info {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  color: #b3b3b3;
  margin-top: 0.5rem;
  padding: 0 0.5rem;
}
</style>