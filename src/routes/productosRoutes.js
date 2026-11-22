const express = require('express');
const router = express.Router();
const productosController = require('../controllers/productosController');
const authenticateToken = require('../middlewares/authMiddleware');
const { requireAdmin } = require('../middlewares/roleMiddleware');
const { validateProducto, validateIdParam } = require('../middlewares/validateMiddleware');

// GET /api/productos - Público. Listar productos y filtrar por categoría
router.get('/', productosController.listar);

// GET /api/productos/:id - Público. Consultar un producto por ID
router.get('/:id', validateIdParam('id'), productosController.obtenerPorId);

// POST /api/productos - Administrador. Crear un nuevo producto
router.post('/', authenticateToken, requireAdmin, validateProducto, productosController.crear);

// PUT /api/productos/:id - Administrador. Actualizar un producto existente
router.put('/:id', authenticateToken, requireAdmin, validateIdParam('id'), validateProducto, productosController.actualizar);

// DELETE /api/productos/:id - Administrador. Eliminar un producto
router.delete('/:id', authenticateToken, requireAdmin, validateIdParam('id'), productosController.eliminar);

module.exports = router;
