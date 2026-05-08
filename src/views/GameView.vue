<script setup>
import { onMounted } from 'vue'
import { initGame } from '@/game/main'

onMounted(() => {
  initGame()
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
