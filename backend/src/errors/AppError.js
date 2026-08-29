class AppError extends Error {
  constructor(message, statusCode, codigo = null) {
    super(message);
    this.statusCode = statusCode;
    this.codigo = codigo;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;