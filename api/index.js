import mongoose from 'mongoose';
import app from '../backend/src/app.js';
import env from '../backend/src/config/env.js';

// Vercel es serverless: se reutiliza la conexión a MongoDB entre invocaciones cálidas.
let cached = globalThis.__catalogoMongo;

async function conectarMongo() {
  if (!cached) {
    cached = globalThis.__catalogoMongo = { conn: null, promise: null };
  }
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      bufferCommands: false
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

export default async function handler(req, res) {
  try {
    await conectarMongo();
  } catch (error) {
    console.error('[MongoDB ERROR]', error.message);
    return res.status(500).json({ error: 'No se pudo conectar a la base de datos' });
  }

  return app(req, res);
}
