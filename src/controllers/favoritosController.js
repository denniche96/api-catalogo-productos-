const FavoritoModel = require('../models/favoritoModel');
const ProductoModel = require('../models/productoModel');

const favoritosController = {
  // GET /favoritos - Autenticado. Listar únicamente los favoritos del usuario autenticado
  async listar(req, res, next) {
    try {
      // Identidad extraída exclusivamente del token JWT verificado (req.user.id)
      const usuarioId = req.user.id;
      const favoritos = FavoritoModel.findByUserId(usuarioId);

      return res.status(200).json({
        total: favoritos.length,
        usuarioId,
        favoritos
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /favoritos - Autenticado. Agregar un producto a sus favoritos
  async agregar(req, res, next) {
    try {
      const usuarioId = req.user.id;
      const { productoId } = req.body;

      // Validación de campo productoId
      const parsedProductoId = Number(productoId);
      if (!productoId || !Number.isInteger(parsedProductoId) || parsedProductoId <= 0) {
        return res.status(400).json({
          error: 'Datos inválidos',
          mensaje: 'El campo "productoId" es obligatorio y debe ser un número entero positivo mayor a 0.'
        });
      }

      // 1. Validar existencia del producto en el catálogo
      const producto = ProductoModel.findById(parsedProductoId);
      if (!producto) {
        return res.status(404).json({
          error: 'Producto no encontrado',
          mensaje: `No existe ningún producto con el identificador ${parsedProductoId}.`
        });
      }

      // 2. Validar que no sea un favorito duplicado
      const favoritoExistente = FavoritoModel.findOne(usuarioId, parsedProductoId);
      if (favoritoExistente) {
        return res.status(409).json({
          error: 'Conflicto',
          mensaje: 'El producto ya se encuentra en su lista de favoritos.'
        });
      }

      // 3. Crear el favorito
      const nuevoFavorito = FavoritoModel.create(usuarioId, parsedProductoId);

      return res.status(201).json({
        mensaje: 'Producto agregado a favoritos exitosamente',
        favorito: {
          id: nuevoFavorito.id,
          usuario_id: usuarioId,
          producto_id: parsedProductoId,
          producto: {
            nombre: producto.nombre,
            categoria: producto.categoria,
            precio: producto.precio
          }
        }
      });
    } catch (error) {
      next(error);
    }
  },

  // DELETE /favoritos/:productoId - Autenticado. Quitar un producto de sus favoritos
  async eliminar(req, res, next) {
    try {
      const usuarioId = req.user.id;
      const { productoId } = req.params;

      // Verificar si el favorito existe para este usuario específico
      const favoritoExistente = FavoritoModel.findOne(usuarioId, productoId);
      if (!favoritoExistente) {
        return res.status(404).json({
          error: 'Favorito no encontrado',
          mensaje: `El producto ${productoId} no se encuentra en su lista de favoritos.`
        });
      }

      // Eliminar el favorito
      FavoritoModel.delete(usuarioId, productoId);

      return res.status(200).json({
        mensaje: 'Producto eliminado de favoritos exitosamente',
        productoId
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = favoritosController;
