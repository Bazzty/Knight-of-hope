<script setup>
import { onMounted, onUnmounted } from 'vue'
import { initGame, destroyGame } from '@/game/main'

onMounted(() => {
  initGame()
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
