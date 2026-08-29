import app from './app.js';
import connectDB from './config/db.js';
import env from './config/env.js';

const PORT = env.PORT || 3000;

const iniciarServidor = async () => {
  try {
    // 1. Conectar a MongoDB en Docker
    await connectDB();

    // 2. Levantar el servidor HTTP
    app.listen(PORT, () => {
      console.log(`[Servidor] Corriendo en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error(`[Servidor ERROR] Fallo al iniciar la aplicación: ${error.message}`);
    process.exit(1);
  }
};

iniciarServidor();