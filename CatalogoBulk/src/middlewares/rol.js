import AppError from '../errors/AppError.js';

const autorizarRoles = (...rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.usuario || !rolesPermitidos.includes(req.usuario.rol)) {
      return next(
        new AppError('No tiene permisos para realizar esta acción', 403, 'FORBIDDEN')
      );
    }
    next();
  };
};

export default autorizarRoles;