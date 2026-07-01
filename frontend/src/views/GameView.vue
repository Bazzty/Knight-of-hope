<script setup>
import { onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { destroyGame, initGame } from '@/game/main'
import { useGameStore } from '@/stores/gameState'

const router = useRouter()
const store = useGameStore()
let game = null

function handleQuit() {
  destroyGame()
  game = null
  router.push('/home')
}

onMounted(() => {
  const startScene = store.continueRun ? store.continueSceneName : null
  game = initGame(startScene)
  window.addEventListener('koh-quit', handleQuit)
})

onUnmounted(() => {
  window.removeEventListener('koh-quit', handleQuit)
  if (game) {
    destroyGame()
    game = null
  }
})
</script>

<template>
  <div id="phaser-container"></div>
</template>

<style scoped>
#phaser-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #000;
}
</style>
