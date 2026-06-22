import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { useAuthStore } from '@/stores/auth'

import App from './App.vue'
import router from './router'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)

router.beforeEach((to) => {
  const auth = useAuthStore()
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: 'login', replace: true }
  }
  if (to.name === 'login' && auth.isAuthenticated) {
    return { name: 'home', replace: true }
  }
})

app.use(router)
app.mount('#app')
