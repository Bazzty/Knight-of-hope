const User = require('../models/User')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

async function validateEmailWithAbstract(email) {
    const key = process.env.ABSTRACT_API_KEY
    if (!key) return
    const url = `https://emailvalidation.abstractapi.com/v1/?api_key=${key}&email=${encodeURIComponent(email)}`
    const res = await fetch(url)
    if (!res.ok) return
    const data = await res.json()
    if (data.is_valid_format?.value === false) {
        const err = new Error('El formato del email no es válido')
        err.isValidation = true
        throw err
    }
    if (data.is_disposable_email?.value === true) {
        const err = new Error('No se permiten emails temporales o desechables')
        err.isValidation = true
        throw err
    }
    if (data.deliverability === 'UNDELIVERABLE') {
        const err = new Error('El email no existe o no puede recibir mensajes')
        err.isValidation = true
        throw err
    }
}

const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
}

const CLEAR_COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
}

const register = async (req, res) => {
    try {
        const { name, email, password } = req.body

        if (!name?.trim() || !email?.trim() || !password) {
            return res.status(400).json({ message: 'Todos los campos son requeridos' })
        }
        if (password.length < 6) {
            return res.status(400).json({ message: 'La contraseña debe tener al menos 6 caracteres' })
        }

        await validateEmailWithAbstract(email)

        const existing = await User.findOne({ email })
        if (existing) {
            return res.status(400).json({ message: 'El email ya está registrado' })
        }

        const hash = await bcrypt.hash(password, 10)
        const user = await User.create({ name, email, password: hash })

        const token = jwt.sign(
            { id: user._id, name: user.name },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        )

        res.cookie('token', token, COOKIE_OPTIONS)
        res.status(201).json({ user: { id: user._id, name: user.name, email: user.email } })
    } catch (err) {
        const status = err.isValidation ? 400 : 500
        res.status(status).json({ message: err.isValidation ? err.message : 'Error en el servidor' })
    }
}

const login = async (req, res) => {
    try {
        const { email, password } = req.body

        if (!email?.trim() || !password) {
            return res.status(400).json({ message: 'Email y contraseña son requeridos' })
        }

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

        res.cookie('token', token, COOKIE_OPTIONS)
        res.json({ user: { id: user._id, name: user.name, email: user.email } })
    } catch (err) {
        res.status(500).json({ message: 'Error en el servidor' })
    }
}

const logout = (_req, res) => {
    res.clearCookie('token', CLEAR_COOKIE_OPTIONS)
    res.json({ message: 'Sesión cerrada' })
}

const me = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('name email')
        if (!user) return res.status(401).json({ message: 'Usuario no encontrado' })
        res.json({ user: { id: user._id, name: user.name, email: user.email } })
    } catch {
        res.status(500).json({ message: 'Error en el servidor' })
    }
}

module.exports = { register, login, logout, me }
