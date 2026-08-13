import dotenv from 'dotenv';
dotenv.config();

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

const missingVariables = requiredVariables.filter(
  (variable) => !process.env[variable]
);

if (missingVariables.length > 0) {
  console.error('===================================================');
  console.error('[ERROR FATAL] Faltan variables de entorno obligatorias:');
  console.error(missingVariables.join(', '));
  console.error('Revisa tu archivo .env y vuelve a intentarlo.');
  console.error('===================================================');
  process.exit(1);
}

export default {
  PORT: process.env.PORT || 3000,
  MONGO_URI: process.env.MONGO_URI,
  REDIS_HOST: process.env.REDIS_HOST,
  REDIS_PORT: process.env.REDIS_PORT,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
  MAX_FILE_SIZE_MB: parseInt(process.env.MAX_FILE_SIZE_MB, 10),
  BATCH_SIZE: parseInt(process.env.BATCH_SIZE, 10),
  CACHE_TTL_SECONDS: parseInt(process.env.CACHE_TTL_SECONDS, 10),
  IMPORT_ERRORS_CAP: parseInt(process.env.IMPORT_ERRORS_CAP, 10)
};