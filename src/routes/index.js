const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const productosRoutes = require('./productosRoutes');
const favoritosRoutes = require('./favoritosRoutes');

router.use('/auth', authRoutes);
router.use('/productos', productosRoutes);
router.use('/favoritos', favoritosRoutes);

module.exports = router;
