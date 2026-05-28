<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const proximamenteVisible = ref(false)

// Guardará la referencia a nuestro audio nativo
let menuMusic = null
// Efecto de sonido del botón
let buttonSfx = null

onMounted(() => {
  // Determinamos qué extensión soporta mejor el navegador de forma nativa
  const audioConfig = new Audio();
  const ext = audioConfig.canPlayType('audio/ogg') ? 'ogg' : 'mp3';

  // Instanciamos el audio usando la variable dinámica ext
  menuMusic = new Audio(`/assets/audio/music/Menu.${ext}`)
  menuMusic.loop = true    // Para que la canción vuelva a empezar al terminar
  menuMusic.volume = 0.1  

  // try/catch con Promesa porque los navegadores bloquean el sonido automático
  menuMusic.play().catch(error => {
    console.warn("Autoplay bloqueado hasta la interacción del usuario:", error)
  })

  // Instanciamos el sfx del botón con la misma extensión
  buttonSfx = new Audio(`/assets/audio/music/sfx/buttom.${ext}`)
  buttonSfx.preload = 'auto'
  buttonSfx.volume = 0.6
    // Fallback: en la primera interacción del usuario intentamos reproducir
    // (sirve para navegadores que bloquean autoplay incluso tras carga)
    const onFirstInteraction = async () => {
      try {
        if (menuMusic && menuMusic.paused) await menuMusic.play()
      } catch (e) {
        console.warn('Intento de reproducir menuMusic en interacción falló:', e)
      }
      try {
        if (buttonSfx && buttonSfx.paused) await buttonSfx.play()
        if (buttonSfx) buttonSfx.pause(); // no queremos dejarlo sonando aquí
        if (buttonSfx) buttonSfx.currentTime = 0
      } catch (e) {
        // ignorar
      }
      // removemos el listener (usamos once pero limpiamos por si acaso)
      window.removeEventListener('pointerdown', onFirstInteraction)
    }
    window.addEventListener('pointerdown', onFirstInteraction, { once: true })
})

// Cuando este componente muere (el usuario cambia de ruta hacia el juego)
onUnmounted(() => {
  if (menuMusic) {
    menuMusic.pause()
    menuMusic.currentTime = 0
  }
  if (buttonSfx) {
    buttonSfx.pause()
    buttonSfx.currentTime = 0
  }
})

async function play() {
  // Reproducir sfx al hacer clic (es interacción del usuario, suele permitirse)
  if (buttonSfx) {
    try {
      // Intentamos arrancarlo y esperamos un poquito para que se escuche antes de navegar
      await buttonSfx.play()
    } catch (e) {
      console.warn('No se pudo reproducir el sfx del botón:', e)
    }
  }

  // pequeña espera para que el click sound se perciba (ajustable)
  await new Promise(r => setTimeout(r, 180))

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
  background-image: url('/assets/backgrounds/HomeView.jpg');
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
