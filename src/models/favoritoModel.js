const db = require('../config/database');

const FavoritoModel = {
  // Listar favoritos de un usuario específico, con datos completos del producto
  findByUserId(usuarioId) {
    const stmt = db.prepare(`
      SELECT 
        f.id AS favorito_id,
        f.usuario_id,
        f.producto_id,
        f.creado_en AS agregado_en,
        p.nombre,
        p.descripcion,
        p.categoria,
        p.precio
      FROM favoritos f
      INNER JOIN productos p ON f.producto_id = p.id
      WHERE f.usuario_id = ?
      ORDER BY f.creado_en DESC
    `);
    return stmt.all(usuarioId);
  },

  // Buscar un favorito específico por usuario y producto
  findOne(usuarioId, productoId) {
    const stmt = db.prepare(`
      SELECT id, usuario_id, producto_id, creado_en
      FROM favoritos
      WHERE usuario_id = ? AND producto_id = ?
    `);
    return stmt.get(usuarioId, productoId);
  },

  // Agregar un producto a favoritos
  create(usuarioId, productoId) {
    const stmt = db.prepare(`
      INSERT INTO favoritos (usuario_id, producto_id)
      VALUES (?, ?)
    `);
    const info = stmt.run(usuarioId, productoId);
    return {
      id: info.lastInsertRowid,
      usuario_id: usuarioId,
      producto_id: productoId
    };
  },

  // Eliminar un producto de favoritos del usuario
  delete(usuarioId, productoId) {
    const stmt = db.prepare(`
      DELETE FROM favoritos
      WHERE usuario_id = ? AND producto_id = ?
    `);
    const info = stmt.run(usuarioId, productoId);
    return info.changes > 0;
  }
};

module.exports = FavoritoModel;
