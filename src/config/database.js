const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const env = require('./env');

// Asegurar que el directorio de la base de datos exista
const dbDir = path.dirname(env.DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Inicializar conexión a SQLite
const db = new Database(env.DB_PATH, {
  // verbose: env.NODE_ENV === 'development' ? console.log : null
});

// Activar integridad referencial y modo WAL para concurrencia y durabilidad
db.pragma('foreign_keys = ON');
db.pragma('journal_mode = WAL');

module.exports = db;
