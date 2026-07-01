const GameProgress = require('../models/GameProgress')

const VALID_MEJORAS = ['health', 'attack', 'speed']

// Obtener progreso del usuario autenticado (upsert atómico evita race condition)
exports.getProgress = async (req, res) => {
    try {
        const progress = await GameProgress.findOneAndUpdate(
            { usuario: req.user.id },
            { $setOnInsert: { salaActual: 1, hp: 10, mejorasActivas: [] } },
            { new: true, upsert: true }
        )
        res.json(progress)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

// Guardar progreso (crea si no existe, actualiza si ya existe)
exports.saveProgress = async (req, res) => {
    try {
        const { salaActual, hp, mejorasActivas } = req.body

        if (
            typeof hp !== 'number' || hp < 0 || hp > 100 ||
            typeof salaActual !== 'number' || salaActual < 1 || salaActual > 4 ||
            !Array.isArray(mejorasActivas) ||
            mejorasActivas.some(m => !VALID_MEJORAS.includes(m))
        ) {
            return res.status(400).json({ message: 'Datos de progreso inválidos' })
        }

        const progress = await GameProgress.findOneAndUpdate(
            { usuario: req.user.id },
            { salaActual, hp, mejorasActivas },
            { new: true, upsert: true }
        )
        res.json(progress)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}
