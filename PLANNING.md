# PLANNING.md — Knight of Hope

**Integrantes:** Bastian Contreras · Ignacio Ovalle
**Repositorio:** https://github.com/Bazzty/Knight-of-hope

---

# Parte 1 — Solemne 2

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
- [x] Docker: crear `Dockerfile` y probar localmente
- [x] GitHub Actions: configurar CI/CD completo
- [x] Escribir pruebas unitarias (mínimo 5-10 tests)
- [x] Crear cuenta en DockerHub y subir la imagen
- [x] Completar `README.md`
- [x] Pruebas finales en Chrome, Firefox y Safari
- [x] Pulir arte, sonidos, balance del juego

### Lo que se logró completar
- `DungeonScene.js` como clase base para todas las salas de combate — elimina ~70% de código duplicado entre escenas (GameScene, Scenario2, Scenario3, ScenarioBoss ahora heredan de ella)
- Corregido bug en `player.js`: el HP persistido desde Pinia ahora se respeta correctamente al crear el jugador
- Corregido bug en `GameScene.js`: `store.reset()` ya no sobreescribe el HP al cambiar de sala
- Scenario3 y ScenarioBoss migrados al sistema de herencia de DungeonScene
- Barra de HP visual añadida al slime en Sala 2 y Sala 3 (faltaba)
- GitHub Actions CI configurado (`.github/workflows/ci.yml`): corre tests y build en cada push/PR a `main` y `develop`
- Job de Docker en CI: build y push automático a DockerHub en cada merge a `main`
- 11 tests unitarios con Vitest: 7 del store (`gameState.spec.js`) y 4 de HomeView (`HomeView.spec.js`)
- Assets reorganizados en subcarpetas (`backgrounds/`, `player/`, `enemies/`, `effects/`, `ui/`)
- Eliminados assets sin usar: `dungeon.png`, `Scenario2.png`, `knight.png`, `room4.png`, `torch.png`, `hero.png`
- Eliminados archivos muertos: `remove_bg.js`, `save_image.js`, `style.css`, `App.spec.js`, carpeta `components/`
- `Dockerfile` multi-etapa (Node 22 + nginx), `docker-compose.yml` y `.dockerignore` configurados
- Imagen subida a DockerHub (`bazzty/knight-of-hope`)
- `README.md` completo con instrucciones de desarrollo, Docker y CI/CD
- Música y efectos de sonido agregados al juego

### Lo que no se logró y el motivo
> Se completaron todas las tareas planificadas para esta semana.

## Tareas de mejoras futuras FRONTEND
- [ ] Vista: Mejorar Hitbox
- [ ] Aumentar niveles
- [ ] Colocar barra de vida a personaje jugador
- [ ] KnockBack a jugador y enemigos
- [ ] Agregar configuración y salida
- [ ] Disminuir los efectos visuales
- [ ] Ajustar Visualizacion navegador
- [ ] Intercambio de idiomas Español-Inglés
- [ ] Intrucciones de jugabilidad
- [ ] Pulir movimientos de los personajes

---

---

# Parte 2 — Solemne 3

**Entrega final:** 02 de julio de 2026

---

## Semana 1 — Replanificación, setup del backend y autenticación

### Tareas planificadas
- [x] Actualizar `DESIGN.md` con la arquitectura fullstack (frontend, API REST, MongoDB, servicio externo)
- [x] Actualizar `PLANNING.md` con la nueva planificación por semana
- [x] Estructurar el repositorio con carpetas `frontend/` y `backend/`
- [x] Inicializar el proyecto backend (Node.js + Express + pnpm)
- [x] Configurar conexión a MongoDB 
- [ ] Configurar GitHub Actions (`.github/workflows/main.yml`): linter y pruebas unitarias de frontend y backend en cada push
- [ ] Modelo `User` en MongoDB (nombre, email, password hash, fecha de creación)
- [ ] Endpoint `POST /api/auth/register` — registro de usuario con contraseña hasheada (bcrypt)
- [ ] Endpoint `POST /api/auth/login` — login con emisión de JWT
- [ ] Aplicar las mejoras y correcciones del feedback de la Solemne 2 al juego
- [ ] Middleware de autenticación para rutas protegidas
- [ ] Pantalla de registro e inicio de sesión en el frontend (Vue)
- [ ] Integrar token JWT en el frontend (almacenamiento y envío en headers)

### Lo que se logró completar
> _(completar al finalizar la semana)_

### Lo que no se logró y el motivo
> _(completar al finalizar la semana)_

---

## Semana 2 — Progreso persistente, mejoras S2 y servicio externo 

### Tareas planificadas
- [ ] Modelo `GameProgress` en MongoDB: usuario, sala actual, HP y mejoras activas
- [ ] Endpoint `POST /api/progress/save` — guarda el estado del run al salir del juego (ruta protegida con JWT)
- [ ] Endpoint `GET /api/progress` — recupera el último progreso guardado del usuario autenticado
- [ ] Al iniciar sesión, detectar si existe un run guardado y ofrecer continuar desde la sala guardada o empezar de nuevo
- [ ] Al salir del juego, llamar automáticamente al endpoint de guardado con la sala actual, HP y mejoras activas
- [ ] Integrar el servicio REST externo elegido (definido en `DESIGN.md`)
- [ ] Pruebas unitarias del backend: endpoints de auth y progreso
- [ ] Pruebas unitarias del frontend (nuevos componentes de auth y progreso)

### Lo que se logró completar
> _(completar al finalizar la semana)_

### Lo que no se logró y el motivo
> _(completar al finalizar la semana)_

---

## Semana 3 — Docker, CI/CD y entrega final 

### Tareas planificadas
- [ ] `Dockerfile` para el **backend** (Node.js)
- [ ] `compose.yml` que levante los tres servicios: frontend, backend y MongoDB
- [ ] Actualizar GitHub Actions: agregar job de build y push de **ambas** imágenes a DockerHub
- [ ] Subir imagen del backend a DockerHub
- [ ] Actualizar `README.md`: instrucciones de ejecución local, Docker Compose y links a DockerHub
- [ ] Pruebas finales end-to-end en Chrome, Firefox y Safari
- [ ] Verificar que `PLANNING.md` esté actualizado semana a semana

### Lo que se logró completar
> _(completar al finalizar la semana)_

### Lo que no se logró y el motivo
> _(completar al finalizar la semana)_
