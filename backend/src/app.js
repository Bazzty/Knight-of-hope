const express = require('express')
const cors = require('cors')
const authRoutes = require('./routes/authRoutes')

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
    }
}))
app.use(express.json())

app.get('/', (req, res) => {
    res.send('¡Backend de Knight of Hope configurado correctamente!')
})

app.use('/api/auth', authRoutes)

module.exports = app