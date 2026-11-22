const fs = require('fs');
const path = require('path');
const db = require('../config/database');

function initDb() {
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');

  // Ejecutar el script DDL completo
  db.exec(schemaSql);
  console.log('✅ Esquema de base de datos verificado e inicializado correctamente.');
}

if (require.main === module) {
  initDb();
  process.exit(0);
}

module.exports = initDb;
