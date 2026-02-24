const express = require('express');
const { moderationWebhook, moderateManually } = require('../controllers/moderationController');
const auth = require('../middlewares/auth');
const router = express.Router();

// Webhook pour les services IA (sans authentification)
router.post('/webhook', moderationWebhook);

// Routes admin (protégées)
router.post('/manual', auth, moderateManually);

module.exports = router;