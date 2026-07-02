const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const authRoutes = require('./routes/authRoutes')
const gameProgressRoutes = require('./routes/gameProgressRoutes')

const app = express()

// ─── Middleware ────────────────────────────────────────────────────────────────

const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:4173',
    'http://localhost:8080',
]

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true)
        } else {
            callback(new Error('CORS: origen no permitido'))
        }
    },
    credentials: true,
}))
app.use(express.json())
app.use(cookieParser())

// ─── Rutas ─────────────────────────────────────────────────────────────────────

app.get('/', (req, res) => {
    res.send('¡Backend de Knight of Hope configurado correctamente!')
})

app.use('/api/auth', authRoutes)
app.use('/api/progress', gameProgressRoutes)

// ─── Manejo de errores ─────────────────────────────────────────────────────────

app.use((req, res) => {
    res.status(404).json({ message: 'Ruta no encontrada' })
})

app.use((err, req, res, next) => {
    console.error(err)
    res.status(500).json({ message: 'Error en el servidor' })
})

module.exports = app
