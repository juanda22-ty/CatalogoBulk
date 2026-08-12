import express from 'express';
import mongoose from 'mongoose';
import redisClient from './config/redis.js';

const app = express();

app.use(express.json());

app.get('/health', (req, res) => {
  const mongoStatus = mongoose.connection.readyState === 1 ? 'up' : 'down';
  const redisStatus = redisClient.status === 'ready' ? 'up' : 'down';

  const isHealthy = mongoStatus === 'up' && redisStatus === 'up';
  
  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'ok' : 'error',
    mongo: mongoStatus,
    redis: redisStatus
  });
});

export default app;