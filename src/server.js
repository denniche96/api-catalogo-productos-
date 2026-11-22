const app = require('./app');
const env = require('./config/env');

const PORT = env.PORT;

const server = app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`);
  console.log(`📦 Entorno: ${env.NODE_ENV}`);
  console.log(`===============================================`);
});

module.exports = server;
