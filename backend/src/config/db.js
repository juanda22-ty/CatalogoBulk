import mongoose from 'mongoose';
import env from './env.js'; // Nota: en ESM es obligatorio poner la extensión .js

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[MongoDB] Conexión exitosa: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[MongoDB ERROR] No se pudo conectar a la base de datos: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;