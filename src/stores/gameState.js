import { defineStore } from 'pinia'

export const useGameStore = defineStore('game', {
  state: () => ({
    hp: 10,
    maxHp: 10,
    roomCount: 0,
    playerDamage: 1,
    playerSpeed: 150,
  }),
  actions: {
    setHp(value) {
      this.hp = value
    },
    reset() {
      this.maxHp = 10
      this.hp = 10
      this.roomCount = 0
      this.playerDamage = 1
      this.playerSpeed = 150
    },
    incrementRoom() {
      this.roomCount++
    },
    applyUpgrade(type) {
      if (type === 'health') {
        this.maxHp += 10
        this.hp = Math.min(this.hp + 10, this.maxHp)
      } else if (type === 'attack') {
        this.playerDamage += 5
      } else if (type === 'speed') {
        this.playerSpeed = Math.round(this.playerSpeed * 1.1)
      }
    },
  },
})
