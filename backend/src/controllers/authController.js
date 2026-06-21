const User = require('../models/User')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const register = async (req, res) => {
    const { name, email, password } = req.body

    const existing = await User.findOne({ email })
    if (existing) {
        return res.status(400).json({ message: 'El email ya está registrado' })
    }

    const hash = await bcrypt.hash(password, 10)
    const user = await User.create({ name, email, password: hash })

    const token = jwt.sign(
        { id: user._id, name: user.name },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
    )

    res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email } })
}

const login = async (req, res) => {
    const { email, password } = req.body

    const user = await User.findOne({ email })
    if (!user) {
        return res.status(401).json({ message: 'Credenciales inválidas' })
    }

    const match = await bcrypt.compare(password, user.password)
    if (!match) {
        return res.status(401).json({ message: 'Credenciales inválidas' })
    }

    const token = jwt.sign(
        { id: user._id, name: user.name },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    )

    res.json({ token, user: { id: user._id, name: user.name, email: user.email } })
}

module.exports = { register, login }
