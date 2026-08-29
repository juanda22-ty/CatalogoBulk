import bcrypt from 'bcryptjs';
import usuarioRepository from './usuario.repository.js';
import AppError from '../../errors/AppError.js';

class UsuarioService {
  async crear(datos) {
    if (!datos.password) {
      throw new AppError('La contraseña es requerida', 400, 'VALIDATION_ERROR');
    }

    const existe = await usuarioRepository.obtenerPorEmail(datos.email);
    if (existe) {
      throw new AppError('El correo electrónico ya está registrado', 409, 'DUPLICATE_KEY');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(datos.password, salt);

    const usuario = await usuarioRepository.crear({
      email: datos.email,
      password: passwordHash,
      rol: datos.rol || 'user',
      activo: datos.activo !== undefined ? datos.activo : true
    });

    const usuarioSinPassword = usuario.toObject();
    delete usuarioSinPassword.password;
    return usuarioSinPassword;
  }

  async listar(query = {}) {
    const page = parseInt(query.page, 10) || 1;
    const limit = Math.min(parseInt(query.limit, 10) || 20, 100);
    const filtro = {};

    if (query.activo !== undefined) {
      filtro.activo = query.activo === 'true';
    }
    if (query.rol) {
      filtro.rol = query.rol;
    }

    return await usuarioRepository.obtenerTodos(filtro, { page, limit });
  }

  async obtenerPorId(id) {
    const usuario = await usuarioRepository.obtenerPorId(id);
    if (!usuario) {
      throw new AppError('Usuario no encontrado', 404, 'NOT_FOUND');
    }
    return usuario;
  }

  async actualizar(id, datos, usuarioActualId) {
    const usuario = await usuarioRepository.obtenerPorId(id);
    if (!usuario) {
      throw new AppError('Usuario no encontrado', 404, 'NOT_FOUND');
    }

    // Reglas de seguridad: un admin no puede quitarse su rol ni desactivarse a sí mismo
    if (String(id) === String(usuarioActualId)) {
      if (datos.rol && datos.rol !== usuario.rol) {
        throw new AppError('No puedes cambiar tu propio rol', 403, 'FORBIDDEN');
      }
      if (datos.activo === false) {
        throw new AppError('No puedes desactivar tu propia cuenta', 403, 'FORBIDDEN');
      }
    }

    // Si cambia el email, validar unicidad
    if (datos.email && datos.email.toLowerCase().trim() !== usuario.email) {
      const existe = await usuarioRepository.obtenerPorEmail(datos.email);
      if (existe && String(existe._id) !== String(id)) {
        throw new AppError('El correo electrónico ya está registrado', 409, 'DUPLICATE_KEY');
      }
    }

    const cambios = { ...datos };

    // Si se envía contraseña, hashearla; si no, no modificarla
    if (datos.password) {
      const salt = await bcrypt.genSalt(10);
      cambios.password = await bcrypt.hash(datos.password, salt);
    } else {
      delete cambios.password;
    }

    const actualizado = await usuarioRepository.actualizar(id, cambios);
    const usuarioSinPassword = actualizado.toObject();
    delete usuarioSinPassword.password;
    return usuarioSinPassword;
  }

  async eliminar(id, usuarioActualId) {
    if (String(id) === String(usuarioActualId)) {
      throw new AppError('No puedes eliminar tu propia cuenta', 403, 'FORBIDDEN');
    }

    const usuario = await usuarioRepository.obtenerPorId(id);
    if (!usuario) {
      throw new AppError('Usuario no encontrado', 404, 'NOT_FOUND');
    }

    await usuarioRepository.eliminar(id);
  }
}

export default new UsuarioService();
