const db = require('../config/database');

const ProductoModel = {
  // Listar todos los productos, con opción de filtrar por categoría
  findAll({ categoria } = {}) {
    if (categoria && categoria.trim().length > 0) {
      const stmt = db.prepare(`
        SELECT id, nombre, descripcion, categoria, precio, creado_en
        FROM productos
        WHERE LOWER(categoria) = LOWER(?)
        ORDER BY id ASC
      `);
      return stmt.all(categoria.trim());
    }

    const stmt = db.prepare(`
      SELECT id, nombre, descripcion, categoria, precio, creado_en
      FROM productos
      ORDER BY id ASC
    `);
    return stmt.all();
  },

  // Buscar producto por ID
  findById(id) {
    const stmt = db.prepare(`
      SELECT id, nombre, descripcion, categoria, precio, creado_en
      FROM productos
      WHERE id = ?
    `);
    return stmt.get(id);
  },

  // Crear un nuevo producto
  create({ nombre, descripcion, categoria, precio }) {
    const stmt = db.prepare(`
      INSERT INTO productos (nombre, descripcion, categoria, precio)
      VALUES (?, ?, ?, ?)
    `);
    const info = stmt.run(nombre, descripcion, categoria, Number(precio));
    return this.findById(info.lastInsertRowid);
  },

  // Actualizar un producto existente
  update(id, { nombre, descripcion, categoria, precio }) {
    const stmt = db.prepare(`
      UPDATE productos
      SET nombre = ?, descripcion = ?, categoria = ?, precio = ?
      WHERE id = ?
    `);
    const info = stmt.run(nombre, descripcion, categoria, Number(precio), id);
    if (info.changes === 0) return null;
    return this.findById(id);
  },

  // Eliminar un producto por ID (cascada automática hacia favoritos por clave foránea)
  delete(id) {
    const stmt = db.prepare('DELETE FROM productos WHERE id = ?');
    const info = stmt.run(id);
    return info.changes > 0;
  }
};

module.exports = ProductoModel;
