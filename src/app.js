const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes');
const { notFoundHandler, errorHandler } = require('./middlewares/errorMiddleware');

const app = express();

// Middlewares globales de parsing y seguridad básica
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ruta raíz con información general de la API
app.get('/', (req, res) => {
  res.status(200).json({
    nombre: 'API Catálogo de Productos y Favoritos',
    version: '1.0.0',
    descripcion: 'API REST con autenticación JWT, roles y persistencia SQLite',
    endpoints: {
      auth: {
        registro: 'POST /api/auth/registro',
        login: 'POST /api/auth/login'
      },
      productos: {
        listar: 'GET /api/productos',
        filtrar: 'GET /api/productos?categoria=:nombre',
        obtener: 'GET /api/productos/:id',
        crear: 'POST /api/productos (Admin)',
        actualizar: 'PUT /api/productos/:id (Admin)',
        eliminar: 'DELETE /api/productos/:id (Admin)'
      },
      favoritos: {
        listar: 'GET /api/favoritos (Autenticado)',
        agregar: 'POST /api/favoritos (Autenticado)',
        eliminar: 'DELETE /api/favoritos/:productoId (Autenticado)'
      }
    }
  });
});

// Montar rutas de la API bajo el prefijo /api y también como alias raíz
app.use('/api', apiRoutes);
app.use('/', apiRoutes);

// Manejador de rutas no encontradas (404)
app.use(notFoundHandler);

// Manejador centralizado de errores (500)
app.use(errorHandler);

module.exports = app;
