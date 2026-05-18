<script setup>
import { onMounted, onUnmounted } from 'vue'
import { destroyGame, initGame } from '@/game/main'

let game = null

onMounted(() => {
  game = initGame()
})

onUnmounted(() => {
  if (game) {
    destroyGame()
    game = null
  }
})

onUnmounted(() => {
  destroyGame()
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
