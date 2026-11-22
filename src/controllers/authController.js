const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UsuarioModel = require('../models/usuarioModel');
const env = require('../config/env');

const authController = {
  // POST /auth/registro
  // Público. Crea un usuario normal (rol siempre fijado en 'usuario').
  async registro(req, res, next) {
    try {
      const { nombre, correo, password } = req.body;

      // Verificar si el correo ya está registrado
      const usuarioExistente = UsuarioModel.findByEmail(correo);
      if (usuarioExistente) {
        return res.status(409).json({
          error: 'Conflicto',
          mensaje: 'El correo electrónico ya se encuentra registrado por otro usuario.'
        });
      }

      // Hashear la contraseña con salt 10
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      // IMPORTANTE: El registro público SIEMPRE asigna rol 'usuario'.
      // Se ignora deliberadamente cualquier campo 'rol' enviado por el cliente.
      const nuevoUsuario = UsuarioModel.create({
        nombre,
        correo,
        passwordHash,
        rol: 'usuario'
      });

      // Retornar 201 Created sin exponer jamás contraseñas ni hashes
      return res.status(201).json({
        mensaje: 'Usuario registrado exitosamente',
        usuario: {
          id: nuevoUsuario.id,
          nombre: nuevoUsuario.nombre,
          correo: nuevoUsuario.correo,
          rol: nuevoUsuario.rol,
          creado_en: nuevoUsuario.creado_en
        }
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /auth/login
  // Público. Valida credenciales y emite un token JWT firmado con expiración.
  async login(req, res, next) {
    try {
      const { correo, password } = req.body;

      // Buscar usuario en base de datos
      const usuario = UsuarioModel.findByEmail(correo);
      if (!usuario) {
        return res.status(401).json({
          error: 'Credenciales inválidas',
          mensaje: 'El correo electrónico o la contraseña ingresados son incorrectos.'
        });
      }

      // Validar contraseña contra el hash almacenado
      const passwordValido = await bcrypt.compare(password, usuario.password_hash);
      if (!passwordValido) {
        return res.status(401).json({
          error: 'Credenciales inválidas',
          mensaje: 'El correo electrónico o la contraseña ingresados son incorrectos.'
        });
      }

      // Generar JWT con datos mínimos necesarios (id, nombre, correo, rol)
      const payload = {
        id: usuario.id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: usuario.rol
      };

      const token = jwt.sign(payload, env.JWT_SECRET, {
        expiresIn: env.JWT_EXPIRES_IN
      });

      // Retornar 200 OK con token y datos de usuario sin hashes
      return res.status(200).json({
        mensaje: 'Inicio de sesión exitoso',
        token,
        usuario: {
          id: usuario.id,
          nombre: usuario.nombre,
          correo: usuario.correo,
          rol: usuario.rol
        }
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = authController;
