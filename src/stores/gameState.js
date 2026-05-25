import { defineStore } from 'pinia'

export const useGameStore = defineStore('game', {
  state: () => ({
    hp: 10,
    maxHp: 10,
  }),
  actions: {
    setHp(value) {
      this.hp = value
    },
    reset() {
      this.hp = this.maxHp
    },
  },
})
