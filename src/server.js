const app = require('./app');
const env = require('./config/env');
const initDb = require('./scripts/initDb');
const seed = require('./scripts/seed');
const db = require('./config/database');

// Inicializar esquema de base de datos
initDb();

// Si la base de datos está vacía, sembrar automáticamente datos iniciales
const productosCount = db.prepare('SELECT COUNT(*) as count FROM productos').get();
if (productosCount.count === 0) {
  seed();
}

const PORT = env.PORT;

const server = app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`);
  console.log(`📦 Base de datos activa: ${env.DB_PATH}`);
  console.log(`🔑 Entorno: ${env.NODE_ENV}`);
  console.log(`===============================================`);
});

module.exports = server;
