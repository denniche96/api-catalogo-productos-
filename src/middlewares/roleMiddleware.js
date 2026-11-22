function requireRole(requiredRole) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'No autorizado',
        mensaje: 'Se requiere inicio de sesión previo'
      });
    }

    if (req.user.rol !== requiredRole) {
      return res.status(403).json({
        error: 'Acceso prohibido',
        mensaje: `Acceso denegado: se requieren privilegios de ${requiredRole} para realizar esta operación. Su rol actual es '${req.user.rol}'.`
      });
    }

    next();
  };
}

module.exports = {
  requireRole,
  requireAdmin: requireRole('admin')
};
