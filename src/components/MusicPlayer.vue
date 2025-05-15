// src/components/MusicPlayer.vue
<template>
  <div class="player-controls">
    <button @click="previous" class="control-button">
      <i class="fas fa-step-backward"></i>
    </button>
    
    <button @click="togglePlayPause" class="play-button">
      <i :class="isPlaying ? 'fas fa-pause' : 'fas fa-play'"></i>
    </button>
    
    <button @click="next" class="control-button">
      <i class="fas fa-step-forward"></i>
    </button>
  </div>
</template>

<script>
export default {
  name: 'MusicPlayer',
  computed: {
    isPlaying() {
      return this.$store.state.isPlaying
    }
  },
  methods: {
    async togglePlayPause() {
      if (!this.$store.state.token) return
      
      try {
        const endpoint = this.isPlaying 
          ? 'https://api.spotify.com/v1/me/player/pause'
          : 'https://api.spotify.com/v1/me/player/play'
        
        const response = await fetch(endpoint, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${this.$store.state.token}`
          }
        })
        
        if (response.status === 204) {
          this.$store.commit('setIsPlaying', !this.isPlaying)
        }
      } catch (error) {
        console.error('Error toggling playback:', error)
      }
    },
    
    async previous() {
      if (!this.$store.state.token) return
      
      try {
        await fetch('https://api.spotify.com/v1/me/player/previous', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.$store.state.token}`
          }
        })
        
        // Wait a moment for Spotify to update
        setTimeout(() => {
          this.$store.dispatch('fetchCurrentTrack')
        }, 500)
      } catch (error) {
        console.error('Error skipping to previous track:', error)
      }
    },
    
    async next() {
      if (!this.$store.state.token) return
      
      try {
        await fetch('https://api.spotify.com/v1/me/player/next', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.$store.state.token}`
          }
        })
        
        // Wait a moment for Spotify to update
        setTimeout(() => {
          this.$store.dispatch('fetchCurrentTrack')
        }, 500)
      } catch (error) {
        console.error('Error skipping to next track:', error)
      }
    }
  }
}
</script>

<style scoped>
.player-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1.5rem;
  margin: 1rem 0 2rem 0;
}

.control-button, .play-button {
  background: none;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.control-button {
  color: #b3b3b3;
  font-size: 1.8rem;
  margin: 0 1.5rem;
  width: 40px;
  height: 40px;
}

.control-button:hover {
  color: #62008c;
  transform: scale(1.15);
}

.play-button {
  font-size: 2.5rem;
  color: #e3e8ea;
  width: 60px;
  height: 60px;
  background-color: #282828;
  border-radius: 50%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
}

.play-button:hover {
  color: #62008c;
  transform: scale(1.15);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.5);
}

.play-button i {
  margin-left: 3px; /* Adjust for play icon visual centering */
}

.play-button i.fa-pause {
  margin-left: 0; /* Reset for pause icon */
}
</style>