<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useGameStore } from '@/stores/gameState'

const router = useRouter()
const auth = useAuthStore()
const store = useGameStore()

const mode = ref('login')
const name = ref('')
const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

const isEs = computed(() => store.language === 'es')

const labels = computed(() => ({
  title:       isEs.value ? 'INICIAR SESIÓN' : 'LOGIN',
  titleReg:    isEs.value ? 'REGISTRARSE'    : 'REGISTER',
  name:        isEs.value ? 'NOMBRE'         : 'NAME',
  email:       'EMAIL',
  password:    isEs.value ? 'CONTRASEÑA'     : 'PASSWORD',
  submit:      isEs.value ? 'ENTRAR'         : 'ENTER',
  submitReg:   isEs.value ? 'CREAR CUENTA'   : 'CREATE ACCOUNT',
  switchLogin: isEs.value ? '¿Ya tienes cuenta? Inicia sesión' : 'Already have an account? Login',
  switchReg:   isEs.value ? '¿No tienes cuenta? Regístrate'    : "Don't have an account? Register",
  back:        isEs.value ? 'VOLVER'         : 'BACK',
}))

async function submit() {
  error.value = ''
  loading.value = true
  try {
    if (mode.value === 'login') {
      await auth.login(email.value, password.value)
    } else {
      await auth.register(name.value, email.value, password.value)
    }
    router.push('/home')
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

function switchMode() {
  mode.value = mode.value === 'login' ? 'register' : 'login'
  error.value = ''
  name.value = ''
  email.value = ''
  password.value = ''
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-box">
      <h1 class="auth-title">
        {{ mode === 'login' ? labels.title : labels.titleReg }}
      </h1>

      <form class="auth-form" @submit.prevent="submit">
        <div v-if="mode === 'register'" class="field">
          <label class="field-label">{{ labels.name }}</label>
          <input
            v-model="name"
            class="field-input"
            type="text"
            required
            autocomplete="username"
          />
        </div>

        <div class="field">
          <label class="field-label">{{ labels.email }}</label>
          <input
            v-model="email"
            class="field-input"
            type="email"
            required
            autocomplete="email"
          />
        </div>

        <div class="field">
          <label class="field-label">{{ labels.password }}</label>
          <input
            v-model="password"
            class="field-input"
            type="password"
            required
            autocomplete="current-password"
          />
        </div>

        <p v-if="error" class="error-msg">{{ error }}</p>

        <button class="btn" type="submit" :disabled="loading">
          {{ loading ? '...' : (mode === 'login' ? labels.submit : labels.submitReg) }}
        </button>
      </form>

      <button class="switch-btn" @click="switchMode">
        {{ mode === 'login' ? labels.switchReg : labels.switchLogin }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.auth-page {
  width: 100vw;
  height: 100vh;
  background-image: url('/assets/backgrounds/HomeView.jpg');
  background-size: cover;
  background-position: center;
  image-rendering: pixelated;
  display: flex;
  align-items: center;
  justify-content: center;
}

.auth-box {
  background: rgba(0, 0, 0, 0.88);
  border: 3px solid #f0e68c;
  padding: 40px 48px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-width: 360px;
  gap: 0;
}

.auth-title {
  font-family: 'Press Start 2P', monospace;
  font-size: 14px;
  color: #f0e68c;
  margin: 0 0 32px 0;
  text-shadow: 1px 1px 0 #000;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field-label {
  font-family: 'Press Start 2P', monospace;
  font-size: 9px;
  color: #f0e68c;
}

.field-input {
  font-family: 'Press Start 2P', monospace;
  font-size: 10px;
  color: #ffffff;
  background: #111;
  border: 2px solid #555;
  padding: 10px 12px;
  outline: none;
  width: 100%;
  box-sizing: border-box;
  transition: border-color 0.1s;
}

.field-input:focus {
  border-color: #f0e68c;
}

.error-msg {
  font-family: 'Press Start 2P', monospace;
  font-size: 8px;
  color: #ff6b6b;
  line-height: 1.8;
  margin: 0;
}

.btn {
  font-family: 'Press Start 2P', monospace;
  font-size: 12px;
  color: #ffffff;
  background-color: rgba(0, 0, 0, 0.75);
  border: 3px solid #ffffff;
  padding: 12px 20px;
  cursor: pointer;
  text-align: center;
  transition: background-color 0.1s, color 0.1s;
  width: 100%;
  margin-top: 8px;
}

.btn:hover:not(:disabled) {
  background-color: #ffffff;
  color: #000000;
}

.btn:disabled {
  opacity: 0.5;
  cursor: default;
}

.switch-btn {
  font-family: 'Press Start 2P', monospace;
  font-size: 8px;
  color: #888888;
  background: none;
  border: none;
  cursor: pointer;
  padding: 16px 0 0 0;
  text-decoration: underline;
  line-height: 1.8;
  text-align: left;
}

.switch-btn:hover {
  color: #f0e68c;
}
</style>
