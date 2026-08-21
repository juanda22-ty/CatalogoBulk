import { Router } from 'express';
import productoController from './producto.controller.js';
import auth from '../../middlewares/auth.js';
import autorizarRoles from '../../middlewares/rol.js';

const router = Router();

// Todas las rutas de productos requieren autenticación (Sección 7.2)
router.use(auth);

// Endpoints de lectura (cualquier rol autenticado)
router.get('/', (req, res, next) => productoController.listar(req, res, next));
router.get('/stats', (req, res, next) => productoController.obtenerStats(req, res, next));
router.get('/:id', (req, res, next) => productoController.obtenerPorId(req, res, next));

// Endpoints de escritura (exclusivos para rol admin)
router.post('/', autorizarRoles('admin'), (req, res, next) => productoController.crear(req, res, next));
router.put('/:id', autorizarRoles('admin'), (req, res, next) => productoController.actualizar(req, res, next));
router.delete('/:id', autorizarRoles('admin'), (req, res, next) => productoController.eliminar(req, res, next));

export default router;