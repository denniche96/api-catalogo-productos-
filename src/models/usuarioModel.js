const db = require('../config/database');

const UsuarioModel = {
  // Buscar usuario por correo electrónico
  findByEmail(correo) {
    const stmt = db.prepare('SELECT * FROM usuarios WHERE LOWER(correo) = LOWER(?)');
    return stmt.get(correo);
  },

  // Buscar usuario por ID
  findById(id) {
    const stmt = db.prepare('SELECT id, nombre, correo, rol, creado_en FROM usuarios WHERE id = ?');
    return stmt.get(id);
  },

  // Crear un nuevo usuario (rol fijado por el llamador o por defecto 'usuario')
  create({ nombre, correo, passwordHash, rol = 'usuario' }) {
    const stmt = db.prepare(`
      INSERT INTO usuarios (nombre, correo, password_hash, rol)
      VALUES (?, LOWER(?), ?, ?)
    `);
    const info = stmt.run(nombre, correo, passwordHash, rol);
    return this.findById(info.lastInsertRowid);
  }
};

module.exports = UsuarioModel;
