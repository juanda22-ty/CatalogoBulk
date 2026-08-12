// Carga las variables del archivo .env al objeto process.env
require('dotenv').config();

// Lista estricta de las variables requeridas en la Sección 3 del contrato
const requiredVariables = [
  'PORT',
  'MONGO_URI',
  'REDIS_HOST',
  'REDIS_PORT',
  'JWT_SECRET',
  'JWT_EXPIRES_IN',
  'MAX_FILE_SIZE_MB',
  'BATCH_SIZE',
  'CACHE_TTL_SECONDS',
  'IMPORT_ERRORS_CAP'
];

// Verificamos si falta alguna variable
const missingVariables = requiredVariables.filter(
  (variable) => !process.env[variable]
);

// Si falta al menos una variable, fallamos temprano con process.exit(1)
if (missingVariables.length > 0) {
  console.error('===================================================');
  console.error('[ERROR FATAL] Faltan variables de entorno obligatorias:');
  console.error(missingVariables.join(', '));
  console.error('Revisa tu archivo .env y vuelve a intentarlo.');
  console.error('===================================================');
  process.exit(1);
}

// Exportamos las variables limpias y parseadas para usarlas en toda la app
export const PORT = process.env.PORT || 3000;
export const MONGO_URI = process.env.MONGO_URI;
export const REDIS_HOST = process.env.REDIS_HOST;
export const REDIS_PORT = process.env.REDIS_PORT;
export const JWT_SECRET = process.env.JWT_SECRET;
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;
export const MAX_FILE_SIZE_MB = parseInt(process.env.MAX_FILE_SIZE_MB, 10);
export const BATCH_SIZE = parseInt(process.env.BATCH_SIZE, 10);
export const CACHE_TTL_SECONDS = parseInt(process.env.CACHE_TTL_SECONDS, 10);
export const IMPORT_ERRORS_CAP = parseInt(process.env.IMPORT_ERRORS_CAP, 10);