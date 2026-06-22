import { defineStore } from 'pinia'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(sessionStorage.getItem('user') || 'null'),
  }),

  getters: {
    isAuthenticated: (state) => !!state.user,
  },

  actions: {
    async register(name, email, password) {
      const res = await fetch(`${API}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name, email, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Error al registrarse')
      this._saveUser(data.user)
    },

    async login(email, password) {
      const res = await fetch(`${API}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Error al iniciar sesión')
      this._saveUser(data.user)
    },

    async logout() {
      await fetch(`${API}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      }).catch(() => {})
      this._clearUser()
    },

    _saveUser(user) {
      this.user = user
      sessionStorage.setItem('user', JSON.stringify(user))
    },

    _clearUser() {
      this.user = null
      sessionStorage.removeItem('user')
    },
  },
})
