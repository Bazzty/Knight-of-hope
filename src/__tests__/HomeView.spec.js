import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { createPinia } from 'pinia'
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
        const pinia = createPinia()
        await router.push('/')
        const wrapper = mount(HomeView, {
            global: { plugins: [router, pinia] }
        })
        expect(wrapper.find('h1').text()).toBe('KNIGHT OF HOPE')
    })

    // Verifica que los cuatro botones del menú existen en el DOM.
    it('renderiza los botones PLAY, HOW TO PLAY, CONFIGURATIONS y QUIT', async () => {
        const router = makeRouter()
        const pinia = createPinia()
        await router.push('/')
        const wrapper = mount(HomeView, {
            global: { plugins: [router, pinia] }
        })
        const botones = wrapper.findAll('button')
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
        const pinia = createPinia()
        await router.push('/')
        const wrapper = mount(HomeView, {
            global: { plugins: [router, pinia] }
        })
        const pushSpy = vi.spyOn(router, 'push')
        await wrapper.find('button').trigger('click')
        vi.advanceTimersByTime(200)
        await flushPromises()
        expect(pushSpy).toHaveBeenCalledWith('/game')
    })

    // Verifica que CONFIGURATIONS muestra los controles de música e idioma.
    it('CONFIGURATIONS muestra modales correspondientes al hacer click', async () => {
        const router = makeRouter()
        const pinia = createPinia()
        await router.push('/')
        const wrapper = mount(HomeView, {
            global: { plugins: [router, pinia] }
        })
        const btnConfig = wrapper.findAll('button')[2]
        await btnConfig.trigger('click')
        expect(wrapper.text()).toContain('MUSIC')
        expect(wrapper.text()).toContain('LANGUAGE')
    })
})
