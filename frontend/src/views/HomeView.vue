<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '@/stores/gameState'

const router = useRouter()
const store = useGameStore()

const howToPlayVisible = ref(false)
const configVisible = ref(false)
const quitMessage = ref(false)
const musicVolume = ref(10)

let menuMusic = null
let buttonSfx = null

const labels = computed(() => {
  const es = store.language === 'es'
  return {
    play:         es ? 'JUGAR'         : 'PLAY',
    howToPlay:    es ? 'CÓMO JUGAR'    : 'HOW TO PLAY',
    config:       es ? 'CONFIGURACIÓN' : 'CONFIGURATIONS',
    quit:         es ? 'SALIR'         : 'QUIT',
    howToPlayTitle: es ? 'CÓMO JUGAR'  : 'HOW TO PLAY',
    configTitle:  es ? 'CONFIGURACIÓN' : 'CONFIGURATIONS',
    move:         es ? 'Moverse'       : 'Move',
    attack:       es ? 'Atacar (combo x3)' : 'Attack (combo x3)',
    block:        es ? 'Bloquear'      : 'Block',
    sprint:       es ? 'Doble tap dirección' : 'Double tap dir.',
    hint:         es ? 'Elimina todos los enemigos para avanzar.' : 'Clear all enemies to open the next room.',
    music:        es ? 'MÚSICA'        : 'MUSIC',
    language:     es ? 'IDIOMA'        : 'LANGUAGE',
    close:        es ? 'CERRAR'        : 'CLOSE',
    back:         es ? 'VOLVER'        : 'BACK',
    closeBrowser: es ? 'Cierra esta pestaña del navegador para salir.' : 'Close this browser tab to exit.',
  }
})

onMounted(() => {
  store.loadProgress()
  const audioConfig = new Audio()
  const ext = audioConfig.canPlayType('audio/ogg') ? 'ogg' : 'mp3'

  menuMusic = new Audio(`/assets/audio/music/Menu.${ext}`)
  menuMusic.loop = true
  menuMusic.volume = musicVolume.value / 100

  menuMusic.play().catch(error => {
    console.warn('Autoplay bloqueado hasta la interacción del usuario:', error)
  })

  buttonSfx = new Audio(`/assets/audio/music/sfx/buttom.${ext}`)
  buttonSfx.preload = 'auto'
  buttonSfx.volume = 0.6

  const onFirstInteraction = async () => {
    try {
      if (menuMusic && menuMusic.paused) await menuMusic.play()
    } catch (e) {
      console.warn('Intento de reproducir menuMusic en interacción falló:', e)
    }
    try {
      if (buttonSfx && buttonSfx.paused) await buttonSfx.play()
      if (buttonSfx) buttonSfx.pause()
      if (buttonSfx) buttonSfx.currentTime = 0
    } catch (e) { }
    window.removeEventListener('pointerdown', onFirstInteraction)
  }
  window.addEventListener('pointerdown', onFirstInteraction, { once: true })
})

onUnmounted(() => {
  if (menuMusic) { menuMusic.pause(); menuMusic.currentTime = 0 }
  if (buttonSfx) { buttonSfx.pause(); buttonSfx.currentTime = 0 }
})

function playButtonSfx() {
  if (!buttonSfx) return
  try {
    const r = buttonSfx.play && buttonSfx.play()
    if (r && typeof r.catch === 'function') r.catch(() => {})
  } catch (e) { }
}

async function play() {
  playButtonSfx()
  try {
    const isTest = typeof import.meta !== 'undefined' && import.meta.env?.MODE === 'test'
    if (!isTest && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext
      if (AudioCtx) {
        try {
          const ctx = new AudioCtx()
          if (ctx?.state === 'suspended') ctx.resume().catch(() => {})
        } catch (e) { }
      }
    }
  } catch (e) { }
  await new Promise(r => setTimeout(r, 180))
  router.push('/game')
}

function openHowToPlay() { playButtonSfx(); howToPlayVisible.value = true }
function openConfig()    { playButtonSfx(); configVisible.value = true }

function updateVolume(e) {
  musicVolume.value = Number(e.target.value)
  if (menuMusic) menuMusic.volume = musicVolume.value / 100
}

function toggleLanguage() {
  store.setLanguage(store.language === 'en' ? 'es' : 'en')
}

function quit() {
  playButtonSfx()
  window.close()
  setTimeout(() => { quitMessage.value = true }, 300)
}

function closeModal() {
  howToPlayVisible.value = false
  configVisible.value = false
  quitMessage.value = false
}
</script>

<template>
  <div class="home">
    <div class="menu">
      <h1 class="titulo">KNIGHT OF HOPE</h1>
      <div class="botones">
        <button class="btn" @click="play">{{ labels.play }}</button>
        <button class="btn" @click="openHowToPlay">{{ labels.howToPlay }}</button>
        <button class="btn" @click="openConfig">{{ labels.config }}</button>
        <button class="btn" @click="quit">{{ labels.quit }}</button>
      </div>
    </div>

    <!-- HOW TO PLAY -->
    <div v-if="howToPlayVisible" class="overlay" @click.self="closeModal">
      <div class="modal">
        <h2 class="modal-title">{{ labels.howToPlayTitle }}</h2>
        <table class="controls-table">
          <tbody>
            <tr><td class="key">WASD / ARROWS</td><td class="desc">{{ labels.move }}</td></tr>
            <tr><td class="key">SPACE</td><td class="desc">{{ labels.attack }}</td></tr>
            <tr><td class="key">SHIFT</td><td class="desc">{{ labels.block }}</td></tr>
            <tr><td class="key">{{ labels.sprint }}</td><td class="desc">Sprint</td></tr>
          </tbody>
        </table>
        <p class="modal-hint">{{ labels.hint }}</p>
        <button class="btn btn--small" @click="closeModal">{{ labels.close }}</button>
      </div>
    </div>

    <!-- CONFIGURATIONS -->
    <div v-if="configVisible" class="overlay" @click.self="closeModal">
      <div class="modal">
        <h2 class="modal-title">{{ labels.configTitle }}</h2>

        <div class="config-row">
          <span class="config-label">{{ labels.music }}</span>
          <input
            type="range"
            min="0"
            max="100"
            :value="musicVolume"
            @input="updateVolume"
            class="slider"
          />
          <span class="config-value">{{ musicVolume }}</span>
        </div>

        <div class="config-row">
          <span class="config-label">{{ labels.language }}</span>
          <button
            class="lang-btn"
            :class="{ active: store.language === 'en' }"
            @click="store.language !== 'en' && toggleLanguage()"
          >EN</button>
          <button
            class="lang-btn"
            :class="{ active: store.language === 'es' }"
            @click="store.language !== 'es' && toggleLanguage()"
          >ES</button>
        </div>

        <button class="btn btn--small" @click="closeModal">{{ labels.close }}</button>
      </div>
    </div>

    <!-- QUIT fallback -->
    <div v-if="quitMessage" class="overlay" @click.self="closeModal">
      <div class="modal">
        <p class="quit-text">{{ labels.closeBrowser }}</p>
        <button class="btn btn--small" @click="closeModal">{{ labels.back }}</button>
      </div>
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

.btn--small {
  font-size: 12px;
  padding: 10px 16px;
  min-width: 120px;
  margin-top: 20px;
  text-align: center;
}

/* ── OVERLAY / MODAL ───────────────────────────────── */

.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.78);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.modal {
  background: #0a0a0a;
  border: 3px solid #f0e68c;
  padding: 36px 44px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-width: 380px;
  image-rendering: pixelated;
}

.modal-title {
  font-family: 'Press Start 2P', monospace;
  font-size: 14px;
  color: #f0e68c;
  margin: 0 0 28px 0;
  text-shadow: 1px 1px 0 #000;
}

/* ── CONTROLS TABLE ────────────────────────────────── */

.controls-table {
  border-collapse: collapse;
  margin-bottom: 8px;
  width: 100%;
}

.controls-table tr {
  border-bottom: 1px solid #222;
}

.key {
  font-family: 'Press Start 2P', monospace;
  font-size: 9px;
  color: #f0e68c;
  padding: 10px 20px 10px 0;
  white-space: nowrap;
}

.desc {
  font-family: 'Press Start 2P', monospace;
  font-size: 9px;
  color: #cccccc;
  padding: 10px 0;
}

.modal-hint {
  font-family: 'Press Start 2P', monospace;
  font-size: 8px;
  color: #666666;
  margin: 16px 0 0 0;
  line-height: 1.8;
}

/* ── CONFIG ────────────────────────────────────────── */

.config-row {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.config-label {
  font-family: 'Press Start 2P', monospace;
  font-size: 10px;
  color: #f0e68c;
  min-width: 80px;
}

.slider {
  -webkit-appearance: none;
  appearance: none;
  width: 160px;
  height: 6px;
  background: #444;
  outline: none;
  cursor: pointer;
  border: 1px solid #666;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 18px;
  height: 18px;
  background: #f0e68c;
  cursor: pointer;
  border: 2px solid #000;
}

.slider::-moz-range-thumb {
  width: 18px;
  height: 18px;
  background: #f0e68c;
  cursor: pointer;
  border: 2px solid #000;
  border-radius: 0;
}

.config-value {
  font-family: 'Press Start 2P', monospace;
  font-size: 10px;
  color: #cccccc;
  min-width: 30px;
}

.lang-btn {
  font-family: 'Press Start 2P', monospace;
  font-size: 11px;
  color: #888888;
  background: transparent;
  border: 2px solid #555;
  padding: 6px 12px;
  cursor: pointer;
  transition: all 0.1s;
}

.lang-btn.active {
  color: #f0e68c;
  border-color: #f0e68c;
}

.lang-btn:not(.active):hover {
  color: #cccccc;
  border-color: #888;
}

/* ── QUIT MESSAGE ──────────────────────────────────── */

.quit-text {
  font-family: 'Press Start 2P', monospace;
  font-size: 10px;
  color: #cccccc;
  line-height: 1.8;
  margin: 0;
}
</style>
