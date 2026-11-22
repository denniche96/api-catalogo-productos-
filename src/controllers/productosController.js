const ProductoModel = require('../models/productoModel');

const productosController = {
  // GET /productos - Público. Listar productos y filtrar por categoría opcional (?categoria=...)
  async listar(req, res, next) {
    try {
      const { categoria } = req.query;
      const productos = ProductoModel.findAll({ categoria });

      return res.status(200).json({
        total: productos.length,
        categoriaFiltro: categoria || null,
        productos
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /productos/:id - Público. Consultar detalle de un producto por ID
  async obtenerPorId(req, res, next) {
    try {
      const { id } = req.params;
      const producto = ProductoModel.findById(id);

      if (!producto) {
        return res.status(404).json({
          error: 'Producto no encontrado',
          mensaje: `No existe ningún producto con el identificador ${id}.`
        });
      }

      return res.status(200).json({
        producto
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /productos - Administrador. Crear un nuevo producto
  async crear(req, res, next) {
    try {
      const { nombre, descripcion, categoria, precio } = req.body;

      const nuevoProducto = ProductoModel.create({
        nombre,
        descripcion,
        categoria,
        precio
      });

      return res.status(201).json({
        mensaje: 'Producto creado exitosamente',
        producto: nuevoProducto
      });
    } catch (error) {
      next(error);
    }
  },

  // PUT /productos/:id - Administrador. Actualizar un producto existente
  async actualizar(req, res, next) {
    try {
      const { id } = req.params;
      const { nombre, descripcion, categoria, precio } = req.body;

      // Verificar existencia antes de actualizar
      const productoExistente = ProductoModel.findById(id);
      if (!productoExistente) {
        return res.status(404).json({
          error: 'Producto no encontrado',
          mensaje: `No se puede actualizar. No existe ningún producto con el identificador ${id}.`
        });
      }

      const productoActualizado = ProductoModel.update(id, {
        nombre,
        descripcion,
        categoria,
        precio
      });

      return res.status(200).json({
        mensaje: 'Producto actualizado exitosamente',
        producto: productoActualizado
      });
    } catch (error) {
      next(error);
    }
  },

  // DELETE /productos/:id - Administrador. Eliminar un producto
  async eliminar(req, res, next) {
    try {
      const { id } = req.params;

      // Verificar existencia antes de eliminar
      const productoExistente = ProductoModel.findById(id);
      if (!productoExistente) {
        return res.status(404).json({
          error: 'Producto no encontrado',
          mensaje: `No se puede eliminar. No existe ningún producto con el identificador ${id}.`
        });
      }

      ProductoModel.delete(id);

      return res.status(200).json({
        mensaje: 'Producto eliminado exitosamente del catálogo',
        idEliminado: id
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = productosController;
