<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const proximamenteVisible = ref(false)

function play() {
  router.push('/game')
}

function mostrarProximamente() {
  proximamenteVisible.value = true
  setTimeout(() => {
    proximamenteVisible.value = false
  }, 1800)
}
</script>

<template>
  <div class="home">
    <div class="menu">
      <h1 class="titulo">KNIGHT OF HOPE</h1>

      <div class="botones">
        <button class="btn" @click="play">PLAY</button>
        <button class="btn btn--disabled" @click="mostrarProximamente">CONFIGURATIONS</button>
        <button class="btn btn--disabled" @click="mostrarProximamente">QUIT</button>
      </div>

      <p v-if="proximamenteVisible" class="proximamente">PRÓXIMAMENTE</p>
    </div>
  </div>
</template>

<style scoped>
.home {
  width: 100vw;
  height: 100vh;
  background-image: url('/assets/HomeView.jpg');
  background-size: cover;
  background-position: center;
  image-rendering: pixelated;
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.menu {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 48px 40px;
}

.titulo {
  font-family: 'Press Start 2P', monospace;
  font-size: 18px;
  color: #f0e68c;
  text-shadow:
    2px 2px 0 #000,
    -1px -1px 0 #000;
  margin-bottom: 24px;
  line-height: 1.6;
}

.botones {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.btn {
  font-family: 'Press Start 2P', monospace;
  font-size: 16px;
  color: #ffffff;
  background-color: rgba(0, 0, 0, 0.75);
  border: 3px solid #ffffff;
  padding: 12px 20px;
  cursor: pointer;
  text-align: left;
  image-rendering: pixelated;
  transition: background-color 0.1s, color 0.1s;
  width: fit-content;
  min-width: 260px;
}

.btn:hover {
  background-color: #ffffff;
  color: #000000;
}

.btn--disabled {
  color: #aaaaaa;
  border-color: #aaaaaa;
  cursor: not-allowed;
}

.btn--disabled:hover {
  background-color: rgba(0, 0, 0, 0.75);
  color: #aaaaaa;
}

.proximamente {
  font-family: 'Press Start 2P', monospace;
  font-size: 12px;
  color: #f0e68c;
  text-shadow: 1px 1px 0 #000;
  margin-top: 8px;
  animation: parpadeo 0.5s infinite;
}

@keyframes parpadeo {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}
</style>
