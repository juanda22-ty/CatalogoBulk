import AppError from '../errors/AppError.js';

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Manejo de claves duplicadas en MongoDB (Error 11000) -> 409 Conflict
  if (err.code === 11000) {
    const campo = Object.keys(err.keyValue || {})[0] || 'recurso';
    const mensaje = `El ${campo} '${err.keyValue[campo]}' ya existe`;
    error = new AppError(mensaje, 409, 'DUPLICATE_KEY');
  }

  // Errores de validación de Mongoose -> 400 Bad Request
  if (err.name === 'ValidationError') {
    const mensajes = Object.values(err.errors).map((val) => val.message);
    error = new AppError(mensajes.join(', '), 400, 'VALIDATION_ERROR');
  }

  // Error de ID inválido de Mongoose (CastError) -> 404 Not Found
  if (err.name === 'CastError') {
    error = new AppError('Recurso no encontrado', 404, 'NOT_FOUND');
  }

  const statusCode = error.statusCode || 500;
  const message = error.message || 'Error interno del servidor';

  res.status(statusCode).json({
    error: message,
    ...(error.codigo && { codigo: error.codigo })
  });
};

export default errorHandler;