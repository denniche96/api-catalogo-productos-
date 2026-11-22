const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const env = {
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  JWT_SECRET: process.env.JWT_SECRET || 'clave_secreta_jwt_por_defecto_segura',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '2h',
  DB_PATH: process.env.DB_PATH || path.join(__dirname, '../../data/database.sqlite')
};

module.exports = env;
