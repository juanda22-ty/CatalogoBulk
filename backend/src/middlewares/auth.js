import jwt from 'jsonwebtoken';
import AppError from '../errors/AppError.js';
import env from '../config/env.js';

const auth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('Acceso no autorizado: Token no provisto', 401, 'UNAUTHORIZED'));
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    req.usuario = decoded; // Adjunta el payload decodificado ({ id, email, rol }) a la petición
    next();
  } catch (error) {
    return next(new AppError('Token inválido o expirado', 401, 'INVALID_TOKEN'));
  }
};

export default auth;