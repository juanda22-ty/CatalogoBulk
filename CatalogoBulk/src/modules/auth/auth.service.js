import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Usuario from './usuario.model.js';
import AppError from '../../errors/AppError.js';
import env from '../../config/env.js';

class AuthService {
  async registrar(datosUsuario) {
    // Regla de seguridad: Impedir creación directa de administradores desde el endpoint público
    if (datosUsuario.rol === 'admin') {
      throw new AppError(
        'No está permitido registrarse con rol admin de manera directa',
        403,
        'FORBIDDEN_ROLE'
      );
    }

    const existeUsuario = await Usuario.findOne({ email: datosUsuario.email });
    if (existeUsuario) {
      throw new AppError('El correo electrónico ya está registrado', 409, 'DUPLICATE_KEY');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(datosUsuario.password, salt);

    const nuevoUsuario = await Usuario.create({
      ...datosUsuario,
      password: passwordHash,
      rol: datosUsuario.rol || 'user'
    });

    const usuarioRespuesta = nuevoUsuario.toObject();
    delete usuarioRespuesta.password;

    return usuarioRespuesta;
  }

  async login(email, password) {
    const usuario = await Usuario.findOne({ email }).select('+password');
    if (!usuario) {
      throw new AppError('Credenciales inválidas', 401, 'INVALID_CREDENTIALS');
    }

    if (!usuario.activo) {
      throw new AppError('La cuenta de usuario se encuentra desactivada', 403, 'ACCOUNT_DISABLED');
    }

    const esPasswordCorrecto = await bcrypt.compare(password, usuario.password);
    if (!esPasswordCorrecto) {
      throw new AppError('Credenciales inválidas', 401, 'INVALID_CREDENTIALS');
    }

    const payload = {
      id: usuario._id,
      email: usuario.email,
      rol: usuario.rol
    };

    const token = jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN || '8h'
    });

    const usuarioSinPassword = usuario.toObject();
    delete usuarioSinPassword.password;

    return {
      usuario: usuarioSinPassword,
      token
    };
  }
}

export default new AuthService();