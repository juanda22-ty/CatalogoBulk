import { Router } from 'express';
import categoriaController from './categoria.controller.js';
import auth from '../../middlewares/auth.js';
import autorizarRoles from '../../middlewares/rol.js';

const router = Router();

// Todas las rutas requieren autenticación
router.use(auth);

// Lectura accesible para cualquier usuario autenticado
router.get('/', (req, res, next) => categoriaController.listar(req, res, next));
router.get('/:id', (req, res, next) => categoriaController.obtenerPorId(req, res, next));

// Escritura restringida a administradores
router.post('/', autorizarRoles('admin'), (req, res, next) => categoriaController.crear(req, res, next));
router.put('/:id', autorizarRoles('admin'), (req, res, next) => categoriaController.actualizar(req, res, next));

export default router;