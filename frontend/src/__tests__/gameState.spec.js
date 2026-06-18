import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useGameStore } from '../stores/gameState'

// Antes de cada test se crea una instancia limpia de Pinia.
// Esto evita que el estado de un test afecte al siguiente.
beforeEach(() => {
    setActivePinia(createPinia())
})

describe('gameState store', () => {

    // Verifica que el store arranca con los valores correctos.
    // Si alguien cambia un default sin querer, este test lo detecta.
    it('tiene los valores iniciales correctos', () => {
        const store = useGameStore()
        expect(store.hp).toBe(10)
        expect(store.maxHp).toBe(10)
        expect(store.roomCount).toBe(0)
        expect(store.playerDamage).toBe(1)
        expect(store.playerSpeed).toBe(150)
    })

    // Verifica que reset() vuelve todo al estado inicial sin importar
    // cuántas modificaciones se hayan hecho antes.
    it('reset() restaura todos los valores al estado inicial', () => {
        const store = useGameStore()
        store.setHp(3)
        store.incrementRoom()
        store.applyUpgrade('attack')
        store.reset()
        expect(store.hp).toBe(10)
        expect(store.maxHp).toBe(10)
        expect(store.roomCount).toBe(0)
        expect(store.playerDamage).toBe(1)
        expect(store.playerSpeed).toBe(150)
    })

    // Verifica que setHp() guarda el valor exacto que recibe.
    // Es el mecanismo de persistencia de HP entre salas.
    it('setHp() actualiza el HP del jugador', () => {
        const store = useGameStore()
        store.setHp(6)
        expect(store.hp).toBe(6)
    })

    // Verifica que incrementRoom() acumula correctamente el contador.
    // roomCount controla cuándo aparece la pantalla de upgrades.
    it('incrementRoom() aumenta el contador de salas en 1 por llamada', () => {
        const store = useGameStore()
        store.incrementRoom()
        store.incrementRoom()
        expect(store.roomCount).toBe(2)
    })

    // Verifica que la mejora de salud sube maxHp y rellena HP parcialmente.
    // El jugador llega herido (5 HP) y la mejora le suma 10, sin superar el nuevo maxHp.
    it('applyUpgrade("health") aumenta maxHp y rellena HP sin superar el máximo', () => {
        const store = useGameStore()
        store.setHp(5)
        store.applyUpgrade('health')
        expect(store.maxHp).toBe(20)
        expect(store.hp).toBe(15)
    })

    // Verifica que la mejora de ataque suma exactamente 5 al daño base.
    it('applyUpgrade("attack") aumenta el daño del jugador en 5', () => {
        const store = useGameStore()
        store.applyUpgrade('attack')
        expect(store.playerDamage).toBe(6)
    })

    // Verifica que la mejora de velocidad aplica el 10% correctamente.
    // Math.round(150 * 1.1) = 165
    it('applyUpgrade("speed") aumenta la velocidad un 10%', () => {
        const store = useGameStore()
        store.applyUpgrade('speed')
        expect(store.playerSpeed).toBe(165)
    })

})
