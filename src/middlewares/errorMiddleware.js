function notFoundHandler(req, res, next) {
  res.status(404).json({
    error: 'Recurso no encontrado',
    mensaje: `La ruta solicitada ${req.method} ${req.originalUrl} no existe en este servidor.`
  });
}

function errorHandler(err, req, res, next) {
  console.error('❌ Error capturado en el servidor:', err);

  const status = err.status || 500;
  const message = err.status ? err.message : 'Ocurrió un error interno en el servidor.';

  res.status(status).json({
    error: err.name || 'InternalServerError',
    mensaje: message
  });
}

module.exports = {
  notFoundHandler,
  errorHandler
};
