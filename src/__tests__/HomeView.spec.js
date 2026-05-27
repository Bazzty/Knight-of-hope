import { describe, it, expect } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
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

    // Verifica que el título del juego se renderiza correctamente.
    // Si alguien cambia el texto del h1, este test lo detecta.
    it('muestra el título KNIGHT OF HOPE', async () => {
        const router = makeRouter()
        await router.push('/')
        const wrapper = mount(HomeView, {
            global: { plugins: [router] }
        })
        expect(wrapper.find('h1').text()).toBe('KNIGHT OF HOPE')
    })

    // Verifica que los tres botones del menú existen en el DOM.
    it('renderiza los botones PLAY, CONFIGURATIONS y QUIT', async () => {
        const router = makeRouter()
        await router.push('/')
        const wrapper = mount(HomeView, {
            global: { plugins: [router] }
        })
        const botones = wrapper.findAll('button')
        expect(botones).toHaveLength(3)
        expect(botones[0].text()).toBe('PLAY')
        expect(botones[1].text()).toBe('CONFIGURATIONS')
        expect(botones[2].text()).toBe('QUIT')
    })

    // Verifica que hacer click en PLAY navega a la ruta /game.
    // Es el flujo más crítico del menú — si falla, el juego no arranca.
    it('el botón PLAY navega a /game', async () => {
        const router = makeRouter()
        await router.push('/')
        const wrapper = mount(HomeView, {
            global: { plugins: [router] }
        })
        await wrapper.find('button').trigger('click')
        await flushPromises() // espera que la navegación asíncrona del router termine
        expect(router.currentRoute.value.path).toBe('/game')
    })

    // Verifica que CONFIGURATIONS muestra el texto "PRÓXIMAMENTE"
    // y que desaparece después de 1800ms (comportamiento del setTimeout).
    it('CONFIGURATIONS muestra el mensaje PRÓXIMAMENTE al hacer click', async () => {
        const router = makeRouter()
        await router.push('/')
        const wrapper = mount(HomeView, {
            global: { plugins: [router] }
        })
        const btnConfig = wrapper.findAll('button')[1]
        await btnConfig.trigger('click')
        expect(wrapper.text()).toContain('PRÓXIMAMENTE')
    })

})
