-- ============================================================
-- ESQUEMA DDL: BASE DE DATOS CATÁLOGO DE PRODUCTOS Y FAVORITOS
-- Motor: SQLite 3 con soporte de claves foráneas activadas
-- ============================================================

PRAGMA foreign_keys = ON;

-- 1. TABLA: usuarios
-- Almacena credenciales seguras (password_hash) y roles ('admin' o 'usuario')
CREATE TABLE IF NOT EXISTS usuarios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL,
  correo TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  rol TEXT NOT NULL CHECK(rol IN ('admin', 'usuario')) DEFAULT 'usuario',
  creado_en DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. TABLA: productos
-- Catálogo de productos con precio estrictamente mayor a 0
CREATE TABLE IF NOT EXISTS productos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL,
  descripcion TEXT NOT NULL,
  categoria TEXT NOT NULL,
  precio REAL NOT NULL CHECK(precio > 0),
  creado_en DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. TABLA: favoritos
-- Relaciona usuarios con productos.
-- Restricción UNIQUE(usuario_id, producto_id) para evitar duplicados.
-- ON DELETE CASCADE asegura que al eliminar un usuario o producto,
-- sus favoritos asociados se eliminen automáticamente manteniendo la integridad.
CREATE TABLE IF NOT EXISTS favoritos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario_id INTEGER NOT NULL,
  producto_id INTEGER NOT NULL,
  creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE,
  UNIQUE(usuario_id, producto_id)
);

-- Índices para optimizar búsquedas frecuentes
CREATE INDEX IF NOT EXISTS idx_usuarios_correo ON usuarios(correo);
CREATE INDEX IF NOT EXISTS idx_productos_categoria ON productos(categoria);
CREATE INDEX IF NOT EXISTS idx_favoritos_usuario ON favoritos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_favoritos_producto ON favoritos(producto_id);
