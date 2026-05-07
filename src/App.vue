<template>
  <div id="phaser-container"></div>
</template>

<script setup>
import { onMounted } from 'vue';
import { initGame } from './game/main'; // Importas la inicialización

onMounted(() => {
  initGame(); // Inicia el juego cuando Vue termina de cargar
});
</script>

<style>
#phaser-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #000; /* Fondo negro para el canvas */
}
</style>