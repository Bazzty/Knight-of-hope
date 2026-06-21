# DESIGN.md — Knight of Hope

**Integrantes:** Bastian Contreras · Ignacio Ovalle  
**Repositorio:** https://github.com/Bazzty/Knight-of-hope  

---

## 1. Descripción del juego

**Knight of Hope** es un juego roguelite 2D de vista lateral que corre completamente en el navegador. El jugador controla a un caballero que desciende a las catacumbas de la humanidad para enfrentarse a los males que causaron la caída de la antigua sociedad.

El caballero avanza por habitaciones, enfrenta enemigos y elige mejoras al limpiar cada sala. Si muere, vuelve al inicio (loop roguelite). En esta versión fullstack, el jugador puede registrarse, iniciar sesión y ver su posición en un **leaderboard global** con los mejores runs de todos los usuarios.

---

## 2. Mejoras y correcciones incorporadas desde la Solemne 2

Las siguientes mejoras identificadas en la evaluación anterior se incorporan en esta entrega:

| Mejora | Descripción |
|---|---|
| **Hitbox precisa** | Reducir las hitboxes del jugador y enemigos para que el combate se sienta más justo |
| **Barra de vida del jugador** | Mostrar la barra de HP visual sobre el caballero (ya existe en enemigos, faltaba en el jugador) |
| **KnockBack** | Efecto de empuje al recibir daño tanto en el jugador como en los enemigos |
| **Instrucciones de jugabilidad** | Pantalla o overlay con los controles del juego al iniciar |
| **Pantalla de configuración** | Vista funcional de configuración (volumen, idioma) |
| **Ajuste de visualización** | Corrección de escala y posicionamiento en distintas resoluciones de navegador |
| **Pulido de movimientos** | Suavizar transiciones de animación entre estado idle, caminar y atacar |

---

## 3. Nuevas mecánicas y pantallas

### Nuevas pantallas

| Pantalla | Descripción |
|---|---|
| **Login** | Formulario de inicio de sesión (email + contraseña). Redirige al menú principal si el token es válido |
| **Register** | Formulario de registro (nombre, email, contraseña). Al registrarse, hace login automático |
| **Leaderboard** | Top 10 de runs globales ordenadas por habitaciones limpiadas. Accesible desde el menú principal |
| **Game Over (mejorado)** | Muestra las estadísticas de la run (habitaciones limpiadas, daño total) y guarda el score si el usuario está autenticado |

### Nueva mecánica: Guardado de score
Al morir el caballero, si el usuario está autenticado, el run queda registrado automáticamente en el backend con la cantidad de habitaciones limpiadas. El leaderboard muestra los mejores runs de todos los jugadores.

---

## 4. Arquitectura Fullstack

```
┌─────────────────────────────────────────────────────────┐
│                        CLIENTE                          │
│                                                         │
│   Vue 3 + Phaser 3   →   Axios   →   REST API          │
│   (pantallas + juego)   (HTTP)    (headers JWT)         │
└─────────────────────────┬───────────────────────────────┘
                          │ HTTP/JSON
                          ▼
┌─────────────────────────────────────────────────────────┐
│                       BACKEND                           │
│                                                         │
│   Node.js + Express                                     │
│   ├── /api/auth        → registro y login               │
│   ├── /api/scores      → guardar y listar scores        │
│   └── /api/external    → proxy hacia D&D 5e API         │
│                                                         │
│   JWT (autenticación)  ·  bcrypt (hash de contraseñas) │
└─────────────────────────┬───────────────────────────────┘
                          │ Mongoose ODM
                          ▼
┌─────────────────────────────────────────────────────────┐
│                      MONGODB                            │
│   Colecciones: users · scores                           │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼ HTTP (desde backend)
┌─────────────────────────────────────────────────────────┐
│              SERVICIO REST EXTERNO                      │
│              D&D 5e API — dnd5eapi.co                   │
└─────────────────────────────────────────────────────────┘
```

### Estructura de carpetas del repositorio

```
Knight-of-hope/
├── frontend/                    ← código Vue + Phaser (migrado desde raíz)
│   ├── src/
│   │   ├── views/
│   │   │   ├── HomeView.vue
│   │   │   ├── GameView.vue
│   │   │   ├── LoginView.vue
│   │   │   ├── RegisterView.vue
│   │   │   └── LeaderboardView.vue
│   │   ├── game/               ← escenas Phaser
│   │   ├── stores/             ← Pinia
│   │   ├── router/
│   │   └── main.js
│   ├── Dockerfile
│   └── package.json
│
├── backend/                     ← API REST Node.js
│   ├── src/
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   └── Score.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   └── scores.js
│   │   ├── middleware/
│   │   │   └── auth.js          ← verificación JWT
│   │   └── app.js
│   ├── __tests__/
│   ├── Dockerfile
│   └── package.json
│
├── compose.yml                  ← orquesta frontend + backend + MongoDB
├── .github/workflows/main.yml   ← CI/CD
├── DESIGN.md
├── PLANNING.md
└── README.md
```

---

## 5. Modelo de datos (MongoDB)

### Colección `users`

```json
{
  "_id": "ObjectId",
  "name": "string",
  "email": "string (único)",
  "passwordHash": "string (bcrypt)",
  "createdAt": "Date"
}
```

### Colección `scores`

```json
{
  "_id": "ObjectId",
  "userId": "ObjectId (ref: users)",
  "userName": "string (desnormalizado para el leaderboard)",
  "roomsCleared": "number",
  "createdAt": "Date"
}
```

---

## 6. Endpoints principales de la API REST

### Autenticación

| Método | Endpoint | Auth | Descripción |
|---|---|---|---|
| `POST` | `/api/auth/register` | No | Registra un nuevo usuario (bcrypt + JWT) |
| `POST` | `/api/auth/login` | No | Login, devuelve JWT |

**Body de registro:**
```json
{ "name": "Bastian", "email": "b@mail.com", "password": "1234" }
```

**Respuesta de login:**
```json
{ "token": "eyJ...", "user": { "id": "...", "name": "Bastian" } }
```

### Scores

| Método | Endpoint | Auth | Descripción |
|---|---|---|---|
| `POST` | `/api/scores` | JWT | Guarda el score al terminar un run |
| `GET` | `/api/scores/leaderboard` | No | Top 10 scores globales |

**Body para guardar score:**
```json
{ "roomsCleared": 4 }
```

**Respuesta del leaderboard:**
```json
[
  { "userName": "Bastian", "roomsCleared": 7, "createdAt": "..." },
  ...
]
```

---

## 7. Servicio REST externo — Por definir

> **Pendiente:** El equipo está evaluando distintas opciones de API externa gratuita. Se actualizará este documento una vez confirmada la elección.

### Criterios de selección

- Gratuita y sin restricciones de uso relevantes para el proyecto
- Coherente con la temática del juego (fantasía medieval / roguelite)
- Consumida desde el **backend** para evitar problemas de CORS y ocultar claves si las hubiera

### Integración prevista

Una vez elegido el servicio, el backend expondrá un endpoint proxy (`GET /api/external/...`) que el frontend consumirá. Se documentarán aquí los endpoints externos específicos y su rol dentro del juego.

---

## 8. Stack tecnológico completo

| Herramienta | Rol |
|---|---|
| **Vue 3** | Framework UI — pantallas no-juego (menú, login, leaderboard) |
| **Phaser 3** | Motor de juego 2D en canvas |
| **Pinia** | Estado compartido Vue ↔ Phaser (HP, mejoras, auth) |
| **Axios** | Cliente HTTP del frontend para consumir la API |
| **Node.js + Express** | Servidor backend, API REST |
| **Mongoose** | ODM para MongoDB (sin relacion)|
| **bcrypt** | Hash de contraseñas |
| **jsonwebtoken** | Emisión y verificación de JWT |
| **MongoDB** | Base de datos de usuarios y scores |
| **API externa (por definir)** | Servicio REST externo — integración pendiente de análisis |
| **Vite** | Bundler del frontend (empaquetador) | 
| **pnpm** | Gestor de paquetes (frontend y backend) |
| **Vitest** | Pruebas unitarias del frontend |
| **Jest** | Pruebas unitarias del backend |
| **ESLint** | Linter (ambos lados) |
| **Docker + nginx** | Contenedor del frontend |
| **Docker (Node)** | Contenedor del backend |
| **Docker Compose** | Orquestación de los tres servicios |
| **GitHub Actions** | CI/CD: lint + tests + build + push a DockerHub |
