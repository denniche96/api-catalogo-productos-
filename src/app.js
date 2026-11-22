const express = require('express');
const cors = require('cors');

const app = express();

// Middlewares globales
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ruta de estado / salud
app.get('/', (req, res) => {
  res.status(200).json({
    nombre: 'API Catálogo de Productos y Favoritos',
    version: '1.0.0',
    estado: 'activo',
    docs: '/api'
  });
});

module.exports = app;
