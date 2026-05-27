# PLANNING.md — Knight of Hope

**Integrantes:** Bastian Contreras · [Ignacio Ovalle]  
**Repositorio:** https://github.com/Bazzty/Knight-of-hope  
**Entrega final:** 28 de mayo de 2026  

---

## Semana 1 — Diseño y configuración (04 de mayo – 10 de mayo)

### Tareas planificadas
- [x] Crear el repositorio en GitHub
- [x] Redactar y subir `DESIGN.md` con mockups y descripción del juego
- [x] Redactar y subir `PLANNING.md` con la planificación
- [x] Enviar correo al profesor con nombres + link al repo
- [x] Configurar el proyecto: Vue + Vite + pnpm + ESLint + Vitest
- [x] Integrar Phaser 3 y mostrar un canvas en blanco dentro de Vue

### Lo que se logró completar
- Se creó el repositorio en GitHub con la estructura base del proyecto
- Se redactaron y subieron `DESIGN.md` y `PLANNING.md`
- Se envió el correo al profesor con los nombres del equipo y el link al repositorio
- Se configuró el proyecto con Vue 3 + Vite + pnpm + ESLint + Vitest
- Se integró Phaser dentro de Vue y se logró mostrar el canvas en pantalla
- Se configuraron Vue Router (`/` → HomeView, `/game` → GameView) y Pinia

### Lo que no se logró y el motivo
- No se instaló phaser 3, por temas de actualización, aunque no interviene con las necesidades del proyecto y phaser 3 es suficiente, optamos por investigar nuevas tecnologias y ver si realmente hay diferencias entre versiones

---

## Semana 2 — Mecánicas base 

### Tareas planificadas
- [x] Crear Vista de juego y modelos
- [x] Caballero en pantalla con movimiento (teclado)
- [x] Caballero con animación de caminar y atacar
- [x] Primera habitación con bordes (no salirse de los límites)
- [x] Un enemigo básico que persigue al caballero
- [x] Sistema de colisiones: el enemigo daña al caballero
- [x] El caballero puede atacar y eliminar al enemigo

### Lo que se logró completar
- `GameView.vue` monta y destruye el canvas de Phaser correctamente (`initGame` / `destroyGame`) evitando memory leaks al navegar
- Player (`createPlayer()`) con movimiento horizontal mediante flechas/WASD, ataque con SPACE y flip horizontal
- Animaciones de caminar y atacar con spritesheets dedicados (`movimientoFinal.png`, `Ataquefinal.png`), frames 69×69
- Escenario de mazmorra con fondo (`dungeon.png`) y antorchas animadas (`torch-flicker`, 25 frames a 10 fps)
- Colisión con los bordes del mundo mediante `physics.world.setBounds`
- Enemigo básico que persigue al jugador en el eje X y ataca con cooldown de 2.5 segundos
- Sistema de combate con hitboxes invisibles usando `physics.add.overlap`
- HP del jugador (10) con iframes tras recibir daño y efecto de parpadeo (~1 segundo)
- HUD de vida del jugador en pantalla
- HP del enemigo (3) con barra visual que lo sigue en cada frame
- Game Over al morir el jugador → `scene.restart()`

### Lo que no se logró y el motivo
> Se completaron todas las tareas planificadas para esta semana.

---

## Semana 3 — Sistema de habitaciones y mejoras (18 mayo – 25 mayo)

### Tareas planificadas
- [x] Sistema de habitaciones: al limpiar una, se genera la siguiente
- [ ] Transición entre habitaciones (animación o fade)
- [x] 1-2 tipos de enemigos distintos con diferente comportamiento
- [x] Pantalla de mejoras al limpiar habitación (3 opciones aleatorias)
- [x] Aplicar las mejoras al caballero (daño, vida, velocidad)
- [x] Pantalla de Game Over y reinicio

### Lo que se logró completar
- Scenario2 con enemigo slime (comportamiento y sprites distintos al caballero enemigo)
- Transición Sala 1 → Sala 2 mediante door trigger al eliminar al enemigo
- Menú principal (HomeView) con fondo pixel art, botones PLAY / CONFIGURATIONS / QUIT y fuente Press Start 2P
- HP persistente entre escenas mediante Pinia store (`gameState`)
- Canvas de Phaser escalado al tamaño de la ventana con `Scale.FIT`
- Scenario2 arranca directamente sin pantalla de introducción
- Fix: `gameOver` se resetea correctamente en cada restart evitando sprites congelados
- Animación de muerte del caballero y pantalla de Game Over con retry en ambas salas

### Lo que no se logró y el motivo
- Transición animada entre habitaciones: se optó por cambio directo de escena para priorizar estabilidad

---

## Semana 4 — Pulido y entrega 

### Tareas planificadas
- [ ] Docker: crear `Dockerfile` y probar localmente
- [ ] GitHub Actions: configurar CI/CD completo
- [ ] Escribir pruebas unitarias (mínimo 5-10 tests)
- [ ] Crear cuenta en DockerHub y subir la imagen
- [ ] Completar `README.md`
- [ ] Pruebas finales en Chrome, Firefox y Safari
- [ ] Pulir arte, sonidos, balance del juego

### Lo que se logró completar
> _Completar al cierre de la semana…_

### Lo que no se logró y el motivo
> _Completar al cierre de la semana…_
