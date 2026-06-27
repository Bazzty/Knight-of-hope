import { defineStore } from 'pinia'

export const useGameStore = defineStore('game', {
  state: () => ({
    hp: 10,
    maxHp: 10,
    roomCount: 1,
    playerDamage: 1,
    playerSpeed: 150,
    language: 'en',
    mejorasActivas: [],
    continueRun: false,
  }),

  getters: {
    hasSavedRun: (state) => state.roomCount > 1 && state.roomCount < 5,
    continueSceneName: (state) => {
      const map = ['GameScene', 'Scenario2', 'Scenario3', 'ScenarioBoss']
      return map[state.roomCount - 1] || 'GameScene'
    },
  },
  actions: {
    setHp(value) {
      this.hp = value
      this.saveProgress()
    },
    setLanguage(lang) {
      this.language = lang
    },
    reset() {
      this.maxHp = 10
      this.hp = 10
      this.roomCount = 1
      this.playerDamage = 1
      this.playerSpeed = 150
      this.mejorasActivas = []
      this.continueRun = false
      this.saveProgress()
      // language persists across runs
    },
    incrementRoom() {
      this.roomCount++
      this.saveProgress()
    },
    applyUpgrade(type) {
      if (type === 'health') {
        this.maxHp += 10
        this.hp = Math.min(this.hp + 10, this.maxHp)
        this.mejorasActivas.push('health')
      } else if (type === 'attack') {
        this.playerDamage += 5
        this.mejorasActivas.push('attack')
      } else if (type === 'speed') {
        this.playerSpeed = Math.round(this.playerSpeed * 1.1)
        this.mejorasActivas.push('speed')
      }
      this.saveProgress()
    },

    async loadProgress() {
      try {
        const API = import.meta.env.VITE_API_URL || 'http://localhost:3000'
        const res = await fetch(`${API}/api/progress`, {
          credentials: 'include'
        })
        if (!res.ok) throw new Error('No autorizado')
        const data = await res.json()
        this.maxHp = 10
        this.playerDamage = 1
        this.playerSpeed = 150
        this.mejorasActivas = data.mejorasActivas || []
        for (const mejora of this.mejorasActivas) {
          if (mejora === 'health') this.maxHp += 10
          else if (mejora === 'attack') this.playerDamage += 5
          else if (mejora === 'speed') this.playerSpeed = Math.round(this.playerSpeed * 1.1)
        }
        this.hp = Math.min(data.hp, this.maxHp)
        this.roomCount = data.salaActual
      } catch {
        console.warn('No se pudo cargar progreso')
      }
    },

    setContinueRun(value) {
      this.continueRun = value
    },

    async saveProgress() {
      try {
        const API = import.meta.env.VITE_API_URL || 'http://localhost:3000'
        await fetch(`${API}/api/progress/save`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            hp: this.hp,
            salaActual: this.roomCount,
            mejorasActivas: this.mejorasActivas
          })
        })
      } catch {
        console.warn('No se pudo guardar progreso')
      }
    },
  },
})
