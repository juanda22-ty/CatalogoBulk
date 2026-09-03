import { Router } from 'express';
import productoController from './producto.controller.js';
import auth from '../../middlewares/auth.js';
import autorizarRoles from '../../middlewares/rol.js';

const router = Router();

// Lectura pública: el catálogo es la página oficial del sitio
router.get('/', (req, res, next) => productoController.listar(req, res, next));

// Estadísticas accesibles para cualquier usuario autenticado.
// Importante: debe registrarse ANTES de '/:id' para no ser capturada por ese patrón.
router.get('/stats', auth, (req, res, next) => productoController.obtenerStats(req, res, next));

router.get('/:id', (req, res, next) => productoController.obtenerPorId(req, res, next));

// Endpoints de escritura (exclusivos para rol admin)
router.post('/', auth, autorizarRoles('admin'), (req, res, next) => productoController.crear(req, res, next));
router.put('/:id', auth, autorizarRoles('admin'), (req, res, next) => productoController.actualizar(req, res, next));

export default router;
