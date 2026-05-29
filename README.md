# Knight of Hope

A knight, fed up with cruelty, injustice, and power, challenges his own abilities by venturing into the catacombs of humanity — which hold the terrible reasons for the decline of ancient society.

A 2D roguelite game built with **Phaser 4** and **Vue 3**. Fight through dungeon rooms, defeat enemies, collect upgrades between battles, and face The Guardian in a final boss encounter with multiple phases.

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

| Tool | Role |
|------|------|
| Vue 3 | UI shell, mounts the canvas |
| Phaser 4 | Game engine — physics, scenes, sprites |
| Pinia | State management between scenes |
| Vite | Bundler / dev server |
| Vitest | Unit tests |
| pnpm | Package manager |

---

## Getting Started

### Requirements

- Node.js 22+
- pnpm

### Install dependencies

```bash
pnpm install
```

### Run in development

```bash
pnpm dev
```

Open `http://localhost:5173`

### Run tests

```bash
pnpm test:unit
```

### Build for production

```bash
pnpm build
```

---

## Run with Docker

### Build and start (local)
```bash
docker compose up --build
```
Open `http://localhost:8080`

### Stop (local)
```bash
docker compose down
```

### Pull and run from DockerHub
```bash
docker run -d -p 8080:80 --name knight-of-hope bazzty/knight-of-hope:latest
```
Open `http://localhost:8080`

### Stop DockerHub container
```bash
docker stop knight-of-hope
docker rm knight-of-hope
```

---

## CI/CD

GitHub Actions runs on every push:

1. Install dependencies
2. Run unit tests
3. Build the project
4. On merge to `main`: build Docker image and push to DockerHub
