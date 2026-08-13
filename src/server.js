import env from './config/env.js';
import connectDB from './config/db.js';
import app from './app.js';
import './config/redis.js';

connectDB();

app.listen(env.PORT, () => {
  console.log(`=========================================`);
  console.log(`🚀 API corriendo en http://localhost:${env.PORT}`);
  console.log(`=========================================`);
});