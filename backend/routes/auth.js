const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware');

// --- RUTAS PÚBLICAS ---

// POST /api/auth/login
router.post('https://vacontrol-production.up.railway.app/login', authController.login);

// --- RUTAS PROTEGIDAS ---

// GET /api/auth/me — obtener datos del usuario autenticado
router.get('/me', verifyToken, authController.getMe);

// PUT /api/auth/cambiar-password
router.put('/cambiar-password', verifyToken, authController.cambiarPassword);

module.exports = router;
