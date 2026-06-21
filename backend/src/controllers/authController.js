const User = require('../models/User')
const bcrypt = require('bcrypt')

const register = async (req, res) => {
    const { name, email, password } = req.body

    const existing = await User.findOne({ email })
    if (existing) {
        return res.status(400).json({ message: 'El email ya está registrado' })
    }

    const hash = await bcrypt.hash(password, 10)
    const user = await User.create({ name, email, password: hash })

    res.status(201).json({ id: user._id, name: user.name, email: user.email })
}

module.exports = { register }
