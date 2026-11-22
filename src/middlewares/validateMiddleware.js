// Validador de formato de correo electrónico
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateRegistro(req, res, next) {
  const { nombre, correo, password } = req.body;
  const errores = [];

  if (!nombre || typeof nombre !== 'string' || nombre.trim().length === 0) {
    errores.push('El campo "nombre" es obligatorio y debe ser un texto no vacío.');
  }

  if (!correo || typeof correo !== 'string' || !emailRegex.test(correo.trim())) {
    errores.push('El campo "correo" es obligatorio y debe tener un formato de email válido.');
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    errores.push('El campo "password" es obligatorio y debe tener al menos 6 caracteres.');
  }

  if (errores.length > 0) {
    return res.status(400).json({
      error: 'Datos de validación incorrectos',
      detalles: errores
    });
  }

  req.body.nombre = nombre.trim();
  req.body.correo = correo.trim().toLowerCase();
  next();
}

function validateLogin(req, res, next) {
  const { correo, password } = req.body;
  const errores = [];

  if (!correo || typeof correo !== 'string' || !emailRegex.test(correo.trim())) {
    errores.push('El campo "correo" es obligatorio y debe ser un correo válido.');
  }

  if (!password || typeof password !== 'string' || password.length === 0) {
    errores.push('El campo "password" es obligatorio.');
  }

  if (errores.length > 0) {
    return res.status(400).json({
      error: 'Datos de validación incorrectos',
      detalles: errores
    });
  }

  req.body.correo = correo.trim().toLowerCase();
  next();
}

function validateProducto(req, res, next) {
  const { nombre, descripcion, categoria, precio } = req.body;
  const errores = [];

  if (!nombre || typeof nombre !== 'string' || nombre.trim().length === 0) {
    errores.push('El campo "nombre" es obligatorio y debe ser un texto no vacío.');
  }

  if (!descripcion || typeof descripcion !== 'string' || descripcion.trim().length === 0) {
    errores.push('El campo "descripcion" es obligatorio y debe ser un texto no vacío.');
  }

  if (!categoria || typeof categoria !== 'string' || categoria.trim().length === 0) {
    errores.push('El campo "categoria" es obligatorio y debe ser un texto no vacío.');
  }

  if (precio === undefined || precio === null || typeof precio !== 'number' || isNaN(precio) || precio <= 0) {
    errores.push('El campo "precio" es obligatorio y debe ser un número estrictamente mayor que cero.');
  }

  if (errores.length > 0) {
    return res.status(400).json({
      error: 'Datos de producto inválidos',
      detalles: errores
    });
  }

  req.body.nombre = nombre.trim();
  req.body.descripcion = descripcion.trim();
  req.body.categoria = categoria.trim();
  req.body.precio = Number(precio);
  next();
}

function validateIdParam(paramName = 'id') {
  return (req, res, next) => {
    const rawId = req.params[paramName];
    const parsedId = Number(rawId);

    if (!Number.isInteger(parsedId) || parsedId <= 0) {
      return res.status(400).json({
        error: 'Identificador inválido',
        mensaje: `El parámetro '${paramName}' debe ser un número entero positivo mayor a 0.`
      });
    }

    req.params[paramName] = parsedId;
    next();
  };
}

module.exports = {
  validateRegistro,
  validateLogin,
  validateProducto,
  validateIdParam
};
