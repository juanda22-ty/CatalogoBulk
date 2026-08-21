import express from 'express';
import cors from 'cors';

// Rutas de los módulos
import authRoutes from './modules/auth/auth.routes.js';
import proveedorRoutes from './modules/proveedores/proveedor.routes.js';
import productoRoutes from './modules/productos/producto.routes.js';
import categoriaRoutes from './modules/categorias/categoria.routes.js';
import usuarioRoutes from './modules/usuarios/usuario.routes.js';

// Manejo de errores
import errorHandler from './middlewares/errorHandler.js';
import AppError from './errors/AppError.js';

const app = express();

// Middlewares globales
app.use(cors());
app.use(express.json());

// Montaje de rutas de la API v1
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/proveedores', proveedorRoutes);
app.use('/api/v1/productos', productoRoutes);
app.use('/api/v1/categorias', categoriaRoutes);
app.use('/api/v1/usuarios', usuarioRoutes);

// Manejo de rutas inexistentes (404)
app.use((req, res, next) => {
  next(new AppError(`No se encontró la ruta ${req.originalUrl} en el servidor`, 404, 'NOT_FOUND'));
});

// Middleware centralizado para captura de errores
app.use(errorHandler);

export default app;