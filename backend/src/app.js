const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const authRoutes = require('./routes/authRoutes')
const gameProgressRoutes = require('./routes/gameProgressRoutes')

const app = express()

const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:4173',
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

app.get('/', (req, res) => {
    res.send('¡Backend de Knight of Hope configurado correctamente!')
})

app.use('/api/auth', authRoutes)
app.use('/api/progress', gameProgressRoutes)

module.exports = app