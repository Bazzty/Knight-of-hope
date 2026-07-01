import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useGameStore } from '../stores/gameState'

beforeEach(() => {
    setActivePinia(createPinia())
    global.fetch = vi.fn(() =>
        Promise.resolve(new Response(JSON.stringify({}), { status: 200 }))
    )
})

describe('gameState store', () => {

    it('tiene los valores iniciales correctos', () => {
        const store = useGameStore()
        expect(store.hp).toBe(10)
        expect(store.maxHp).toBe(10)
        expect(store.roomCount).toBe(1)
        expect(store.playerDamage).toBe(1)
        expect(store.playerSpeed).toBe(150)
        expect(store.mejorasActivas).toEqual([])
    })

    it('reset() restaura todos los valores al estado inicial', () => {
        const store = useGameStore()
        store.setHp(3)
        store.incrementRoom()
        store.applyUpgrade('attack')
        store.reset()
        expect(store.hp).toBe(10)
        expect(store.maxHp).toBe(10)
        expect(store.roomCount).toBe(1)
        expect(store.playerDamage).toBe(1)
        expect(store.playerSpeed).toBe(150)
        expect(store.mejorasActivas).toEqual([])
    })

    it('setHp() actualiza el HP del jugador', () => {
        const store = useGameStore()
        store.setHp(6)
        expect(store.hp).toBe(6)
    })

    it('incrementRoom() aumenta el contador de salas en 1 por llamada', () => {
        const store = useGameStore()
        expect(store.roomCount).toBe(1)
        store.incrementRoom()
        expect(store.roomCount).toBe(2)
        store.incrementRoom()
        expect(store.roomCount).toBe(3)
    })

    it('applyUpgrade("health") aumenta maxHp y rellena HP sin superar el máximo', () => {
        const store = useGameStore()
        store.setHp(5)
        store.applyUpgrade('health')
        expect(store.maxHp).toBe(20)
        expect(store.hp).toBe(15)
        expect(store.mejorasActivas).toContain('health')
    })

    it('applyUpgrade("attack") aumenta el daño del jugador en 5', () => {
        const store = useGameStore()
        store.applyUpgrade('attack')
        expect(store.playerDamage).toBe(6)
        expect(store.mejorasActivas).toContain('attack')
    })

    it('applyUpgrade("speed") aumenta la velocidad un 10%', () => {
        const store = useGameStore()
        store.applyUpgrade('speed')
        expect(store.playerSpeed).toBe(165)
        expect(store.mejorasActivas).toContain('speed')
    })

    it('loadProgress() restaura HP, sala y mejoras desde el backend', async () => {
        const store = useGameStore()
        const mockData = {
            hp: 7,
            salaActual: 2,
            mejorasActivas: ['health', 'attack']
        }
        global.fetch = vi.fn(() =>
            Promise.resolve(new Response(JSON.stringify(mockData), { status: 200 }))
        )
        await store.loadProgress()
        expect(store.hp).toBe(7)
        expect(store.maxHp).toBe(20)
        expect(store.playerDamage).toBe(6)
        expect(store.roomCount).toBe(2)
        expect(store.mejorasActivas).toEqual(['health', 'attack'])
    })

    it('loadProgress() mantiene valores por defecto si el backend responde 401', async () => {
        const store = useGameStore()
        global.fetch = vi.fn(() =>
            Promise.resolve(new Response(JSON.stringify({}), { status: 401 }))
        )
        store.reset()
        await store.loadProgress()
        expect(store.hp).toBe(10)
        expect(store.roomCount).toBe(1)
        expect(store.mejorasActivas).toEqual([])
    })

    it('hasSavedRun es true cuando roomCount > 1', () => {
        const store = useGameStore()
        store.incrementRoom()
        expect(store.roomCount).toBe(2)
        expect(store.hasSavedRun).toBe(true)
    })

    it('continueSceneName mapea roomCount correctamente (1-indexed)', () => {
        const store = useGameStore()
        expect(store.roomCount).toBe(1)
        expect(store.continueSceneName).toBe('GameScene')
        store.incrementRoom()
        expect(store.roomCount).toBe(2)
        expect(store.continueSceneName).toBe('Scenario2')
        store.incrementRoom()
        expect(store.roomCount).toBe(3)
        expect(store.continueSceneName).toBe('Scenario3')
        store.incrementRoom()
        expect(store.roomCount).toBe(4)
        expect(store.continueSceneName).toBe('ScenarioBoss')
    })

    it('saveProgress() envía el estado actual al backend', async () => {
        const store = useGameStore()
        store.setHp(5)
        store.incrementRoom()
        store.applyUpgrade('speed')
        await store.saveProgress()
        const callArgs = global.fetch.mock.calls.at(-1)
        expect(callArgs[0]).toContain('/api/progress/save')
        expect(callArgs[1].method).toBe('POST')
        const body = JSON.parse(callArgs[1].body)
        expect(body.hp).toBe(5)
        expect(body.salaActual).toBe(2)
        expect(body.mejorasActivas).toContain('speed')
    })

})
