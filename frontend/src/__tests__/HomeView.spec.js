import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { createPinia, setActivePinia } from 'pinia'
import { useGameStore } from '@/stores/gameState'
import HomeView from '../views/HomeView.vue'

// createMemoryHistory() simula el router sin necesitar una URL real del navegador.
// Es el modo correcto para tests unitarios.
function makeRouter() {
    return createRouter({
        history: createMemoryHistory(),
        routes: [
            { path: '/', component: HomeView },
            { path: '/game', component: { template: '<div />' } },
        ],
    })
}

describe('HomeView', () => {

    // Mockeamos `Audio` para que devuelva Promesas resueltas y no bloquee los tests.
    let _RealAudio
    beforeEach(() => {
        _RealAudio = global.Audio
        global.Audio = class {
            constructor() {
                this.paused = true
                this.currentTime = 0
                this.loop = false
                this.volume = 1
                this.preload = 'auto'
            }
            canPlayType() { return 'probably' }
            play() { this.paused = false; return Promise.resolve() }
            pause() { this.paused = true }
        }
        // Mock fetch para que loadProgress() retorne sin progreso guardado
        global.fetch = vi.fn(() =>
            Promise.resolve(new Response(JSON.stringify({ hp: 10, salaActual: 1, mejorasActivas: [] }), { status: 200 }))
        )
        vi.useFakeTimers()
    })
    afterEach(() => {
        global.Audio = _RealAudio
        try { vi.useRealTimers() } catch (e) { }
    })

    // Verifica que el título del juego se renderiza correctamente.
    // Si alguien cambia el texto del h1, este test lo detecta.
    it('muestra el título KNIGHT OF HOPE', async () => {
        const router = makeRouter()
        await router.push('/')
        const wrapper = mount(HomeView, {
            global: { plugins: [router, createPinia()] }
        })
        expect(wrapper.find('h1').text()).toBe('KNIGHT OF HOPE')
    })

    // Verifica que los cuatro botones del menú existen en el DOM.
    it('renderiza los botones PLAY, HOW TO PLAY, CONFIGURATIONS y QUIT', async () => {
        const router = makeRouter()
        await router.push('/')
        const wrapper = mount(HomeView, {
            global: { plugins: [router, createPinia()] }
        })
        const botones = wrapper.findAll('.botones .btn')
        expect(botones).toHaveLength(4)
        expect(botones[0].text()).toBe('PLAY')
        expect(botones[1].text()).toBe('HOW TO PLAY')
        expect(botones[2].text()).toBe('CONFIGURATIONS')
        expect(botones[3].text()).toBe('QUIT')
    })

    // Verifica que hacer click en PLAY navega a la ruta /game.
    // Es el flujo más crítico del menú — si falla, el juego no arranca.
    it('el botón PLAY navega a /game', async () => {
        const router = makeRouter()
        await router.push('/')
        const wrapper = mount(HomeView, {
            global: { plugins: [router, createPinia()] }
        })
        const pushSpy = vi.spyOn(router, 'push')
        await wrapper.find('button').trigger('click')
        // avanzar el timer para ejecutar el setTimeout del componente
        vi.advanceTimersByTime(200)
        await flushPromises() // espera promesas internas
        expect(pushSpy).toHaveBeenCalledWith('/game')
    })

    // Helper para montar con datos mock de progreso guardado
    async function mountWithSavedRun(roomCount = 2, hp = 7, mejoras = ['health']) {
        global.fetch = vi.fn(() =>
            Promise.resolve(new Response(JSON.stringify({
                hp, salaActual: roomCount, mejorasActivas: mejoras
            }), { status: 200 }))
        )
        const pinia = createPinia()
        setActivePinia(pinia)
        const store = useGameStore()
        const router = makeRouter()
        await router.push('/')
        const wrapper = mount(HomeView, {
            global: { plugins: [router, pinia] }
        })
        await flushPromises()
        return { store, router, wrapper }
    }

    // Verifica que el modal de continuar aparece al hacer PLAY si hay run guardado
    it('PLAY muestra modal de continuar si hay run guardado', async () => {
        const { wrapper } = await mountWithSavedRun()
        expect(wrapper.text()).not.toContain('SAVED RUN')
        const playBtn = wrapper.findAll('.botones .btn')[0]
        await playBtn.trigger('click')
        await flushPromises()
        expect(wrapper.text()).toContain('SAVED RUN')
        expect(wrapper.text()).toContain('CONTINUE')
        expect(wrapper.text()).toContain('NEW GAME')
    })

    // Verifica que CONTINUE navega a /game con continueRun true
    it('CONTINUE navega a /game y activa continueRun', async () => {
        const { store, router, wrapper } = await mountWithSavedRun(2)
        const playBtn = wrapper.findAll('.botones .btn')[0]
        await playBtn.trigger('click')
        await flushPromises()
        const pushSpy = vi.spyOn(router, 'push')
        const btns = wrapper.findAll('.continue-buttons .btn')
        await btns[0].trigger('click')
        vi.advanceTimersByTime(200)
        await flushPromises()
        expect(pushSpy).toHaveBeenCalledWith('/game')
        expect(store.continueRun).toBe(true)
    })

    // Verifica que NEW GAME navega a /game y resetea el progreso
    it('NEW GAME navega a /game y resetea el progreso', async () => {
        const { store, router, wrapper } = await mountWithSavedRun(2, 7)
        const playBtn = wrapper.findAll('.botones .btn')[0]
        await playBtn.trigger('click')
        await flushPromises()
        const pushSpy = vi.spyOn(router, 'push')
        const btns = wrapper.findAll('.continue-buttons .btn')
        await btns[1].trigger('click')
        vi.advanceTimersByTime(200)
        await flushPromises()
        expect(pushSpy).toHaveBeenCalledWith('/game')
        expect(store.roomCount).toBe(1)
        expect(store.hp).toBe(10)
        expect(store.continueRun).toBe(false)
    })

    // Verifica que el modal NO aparece cuando no hay progreso guardado
    it('no muestra modal de continuar si no hay run guardado', async () => {
        const router = makeRouter()
        await router.push('/')
        const wrapper = mount(HomeView, {
            global: { plugins: [router, createPinia()] }
        })
        await flushPromises()
        expect(wrapper.text()).not.toContain('SAVED RUN')
        expect(wrapper.find('.botones').exists()).toBe(true)
    })

    // Verifica que CONFIGURATIONS abre el modal con opciones de música e idioma.
    it('CONFIGURATIONS abre el modal de configuración', async () => {
        const router = makeRouter()
        await router.push('/')
        const wrapper = mount(HomeView, {
            global: { plugins: [router, createPinia()] }
        })
        const btnConfig = wrapper.findAll('.botones .btn')[2]
        await btnConfig.trigger('click')
        expect(wrapper.text()).toContain('CONFIGURATIONS')
        expect(wrapper.find('input[type="range"]').exists()).toBe(true)
    })

})
