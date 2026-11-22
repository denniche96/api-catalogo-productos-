const express = require('express');
const router = express.Router();
const favoritosController = require('../controllers/favoritosController');
const authenticateToken = require('../middlewares/authMiddleware');
const { validateIdParam } = require('../middlewares/validateMiddleware');

// Todas las rutas de favoritos requieren estar autenticado
router.use(authenticateToken);

// GET /api/favoritos - Autenticado. Listar sus favoritos
router.get('/', favoritosController.listar);

// POST /api/favoritos - Autenticado. Agregar un producto a sus favoritos
router.post('/', favoritosController.agregar);

// DELETE /api/favoritos/:productoId - Autenticado. Quitar un producto de sus favoritos
router.delete('/:productoId', validateIdParam('productoId'), favoritosController.eliminar);

module.exports = router;
