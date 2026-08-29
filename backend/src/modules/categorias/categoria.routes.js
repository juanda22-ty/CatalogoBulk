import { Router } from 'express';
import categoriaController from './categoria.controller.js';
import auth from '../../middlewares/auth.js';
import autorizarRoles from '../../middlewares/rol.js';

const router = Router();

// Lectura pública: necesaria para los filtros del catálogo
router.get('/', (req, res, next) => categoriaController.listar(req, res, next));
router.get('/:id', (req, res, next) => categoriaController.obtenerPorId(req, res, next));

// Escritura restringida a administradores
router.post('/', auth, autorizarRoles('admin'), (req, res, next) => categoriaController.crear(req, res, next));
router.put('/:id', auth, autorizarRoles('admin'), (req, res, next) => categoriaController.actualizar(req, res, next));

export default router;
