const express = require('express')
const router = express.Router()
const { getProgress, saveProgress } = require('../controllers/gameProgressController')
const auth = require('../middleware/auth')

router.get('/', auth, getProgress)
router.post('/save', auth, saveProgress)

module.exports = router
