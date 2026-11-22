const jwt = require('jsonwebtoken');
const env = require('../config/env');

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).json({
      error: 'No autorizado',
      mensaje: 'Token de autenticación no proporcionado. Se requiere cabecera Authorization: Bearer <token>'
    });
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({
      error: 'No autorizado',
      mensaje: 'Formato de cabecera inválido. Debe ser: Bearer <token>'
    });
  }

  const token = parts[1];

  jwt.verify(token, env.JWT_SECRET, (err, decoded) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
          error: 'No autorizado',
          mensaje: 'El token de autenticación ha expirado. Por favor inicie sesión nuevamente.'
        });
      }
      return res.status(401).json({
        error: 'No autorizado',
        mensaje: 'Token de autenticación inválido o firma no verificada.'
      });
    }

    // Inyectar datos del usuario autenticado en la petición
    req.user = decoded;
    next();
  });
}

module.exports = authenticateToken;
