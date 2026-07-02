const GameProgress = require('../models/GameProgress')

// ─── Constantes ────────────────────────────────────────────────────────────────

const VALID_MEJORAS = ['health', 'attack', 'speed']

// ─── Lógica de negocio ─────────────────────────────────────────────────────────

exports.getProgress = async (req, res) => {
    try {
        const progress = await GameProgress.findOne({ usuario: req.user.id })
        res.json(progress || { salaActual: 1, hp: 10, mejorasActivas: [] })
    } catch {
        res.status(500).json({ message: 'Error en el servidor' })
    }
}

exports.saveProgress = async (req, res) => {
    try {
        const { salaActual, hp, mejorasActivas } = req.body

        if (
            typeof hp !== 'number' || hp < 0 || hp > 100 ||
            typeof salaActual !== 'number' || salaActual < 1 || salaActual > 5 ||
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
    } catch {
        res.status(500).json({ message: 'Error en el servidor' })
    }
}
