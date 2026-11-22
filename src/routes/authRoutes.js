const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateRegistro, validateLogin } = require('../middlewares/validateMiddleware');

// POST /api/auth/registro - Registro de nuevo usuario (rol 'usuario')
router.post('/registro', validateRegistro, authController.registro);

// POST /api/auth/login - Inicio de sesión y emisión de JWT
router.post('/login', validateLogin, authController.login);

module.exports = router;
