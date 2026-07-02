# Knight of Hope

A knight, fed up with cruelty, injustice, and power, challenges his own abilities by venturing into the catacombs of humanity — which hold the terrible reasons for the decline of ancient society.

A 2D roguelite game built with **Phaser 3** and **Vue 3**. Fight through dungeon rooms, defeat enemies, collect upgrades between battles, and face The Guardian in a final boss encounter with multiple phases.

**Team:** [Bastian Contreras](https://github.com/Bazzty) · [Ignacio Ovalle](https://github.com/iovalleh21)

---

## Screenshots

| Menu | Room 1 |
|------|--------|
| ![Menu](docs/screenshots/menu.png) | ![Room 1](docs/screenshots/room1.png) |

| Room 3 | Boss |
|--------|------|
| ![Room 3](docs/screenshots/room3.png) | ![Boss](docs/screenshots/boss.png) |

---

## Features

- **4 combat rooms** — dungeon, ruins, cave, and throne room
- **3-phase boss** — The Guardian with rage mode, dialogue, and UNLEASHED form
- **Upgrade system** — choose between health, damage, or speed cards between rooms
- **Sprint mechanic** — double-tap a direction to dash at 1.6× speed
- **Block / parry** — hold SHIFT to raise your shield and negate incoming damage
- **Attack combo** — 3 rotating attack animations (sword swing, slash, arc)
- **Persistent HP** — life carries over between rooms via Pinia state
- **Full audio** — background music per room, boss music, sound effects
- **User accounts** — register, login, and save your progress across sessions

---

## Controls

| Action | Key |
|--------|-----|
| Move | Arrow keys / WASD |
| Sprint | Double-tap left or right |
| Attack | SPACE |
| Block | SHIFT (hold) |
| Advance dialogue | SPACE |
| Retry after death | SPACE |

---

## Stack

### Frontend
| Tool | Role |
|------|------|
| Vue 3 | UI shell, mounts the canvas |
| Phaser 3 | Game engine — physics, scenes, sprites |
| Pinia | State management between scenes |
| Vite | Bundler / dev server |
| Vitest | Unit tests |
| pnpm | Package manager |

### Backend
| Tool | Role |
|------|------|
| Node.js + Express | REST API server |
| MongoDB + Mongoose | Database and data models |
| JWT + HttpOnly Cookies | Secure authentication |
| bcrypt | Password hashing |

---

## Getting Started

You can run the project in two ways: **manually** (for development) or **with Docker** (recommended for a full setup).

---

### Option 1 — Manual (development)

#### Requirements
- Node.js 22+
- pnpm
- MongoDB running locally

#### 1. Install dependencies

```bash
# Frontend
cd frontend
pnpm install

# Backend
cd ../backend
pnpm install
```

#### 2. Configure environment variables

Create a `.env` file inside the `backend/` folder:

```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/knight_of_hope
JWT_SECRET=your_secret_here
ABSTRACT_API_KEY=your_key_here   # optional — skipped if not set
```

> `ABSTRACT_API_KEY` is used to validate emails on registration. If not set, validation is skipped and all emails are accepted.

#### 3. Start the servers

```bash
# Terminal 1 — backend
cd backend
pnpm dev

# Terminal 2 — frontend
cd frontend
pnpm dev
```

Open `http://localhost:5173`

#### 4. Run tests

```bash
# Frontend
cd frontend
pnpm test:unit

# Backend
cd backend
pnpm test
```

---

### Option 2 — Docker (full stack)

#### Requirements
- Docker Desktop

#### 1. Configure environment variables

Create a `.env` file in the **project root** (next to `docker-compose.yml`):

```env
JWT_SECRET=your_secret_here
ABSTRACT_API_KEY=your_key_here   # optional
```

#### 2. Build and start all services

```bash
docker compose up --build
```

This starts three containers:
| Container | What it does | Port |
|-----------|-------------|------|
| `mongo` | MongoDB database | internal only |
| `backend` | Express API | 3000 |
| `frontend` | Vue app served by nginx | 8080 |

Open `http://localhost:8080`

#### 3. Stop everything

```bash
docker compose down
```

To also delete the saved database data:

```bash
docker compose down -v
```

#### 4. Pull and run from DockerHub (no build needed)

```bash
docker pull bazzty/knight-of-hope-backend:latest
docker pull bazzty/knight-of-hope-frontend:latest
docker compose up
```

---

## CI/CD

GitHub Actions runs automatically on every push to `main` or `develop`:

| Job | Trigger | What it does |
|-----|---------|-------------|
| Frontend tests + build | every push | installs, tests, and builds the Vue app |
| Backend tests | every push | installs and runs Jest tests |
| Docker — frontend | merge to `main` | builds and pushes `bazzty/knight-of-hope-frontend:latest` to DockerHub |
| Docker — backend | merge to `main` | builds and pushes `bazzty/knight-of-hope-backend:latest` to DockerHub |

The Docker jobs only run after both test jobs pass.
