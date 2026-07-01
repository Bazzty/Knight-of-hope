const mongoose = require('mongoose')

const gameProgressSchema = new mongoose.Schema({
    usuario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    salaActual: {
        type: Number,
        default: 1
    },
    hp: {
        type: Number,
        default: 10
    },
    mejorasActivas: [{
        type: String
    }]
}, { timestamps: true })

module.exports = mongoose.model('GameProgress', gameProgressSchema)