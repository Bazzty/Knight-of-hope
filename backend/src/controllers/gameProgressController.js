const GameProgress = require('../models/GameProgress')

// Obtener progreso del usuario autenticado
exports.getProgress = async (req, res) => {
    try {
        let progress = await GameProgress.findOne({ usuario: req.user.id })
        if (!progress) {
            progress = await GameProgress.create({ usuario: req.user.id })
        }
        res.json(progress)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

// Guardar progreso (crea si no existe, actualiza si ya existe)
exports.saveProgress = async (req, res) => {
    try {
        const { salaActual, hp, mejorasActivas } = req.body
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