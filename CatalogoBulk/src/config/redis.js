import Redis from 'ioredis';
import env from './env.js';

const redisClient = new Redis({
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  maxRetriesPerRequest: null
});

redisClient.on('connect', () => {
  console.log(`[Redis] Conexión exitosa al host ${env.REDIS_HOST}`);
});

redisClient.on('error', (err) => {
  console.error(`[Redis ERROR] Fallo en la conexión: ${err.message}`);
});

export default redisClient;