import { Router } from 'express';
import proveedorController from './proveedor.controller.js';
import auth from '../../middlewares/auth.js';
import autorizarRoles from '../../middlewares/rol.js';

const router = Router();

// Lectura pública: necesaria para los filtros del catálogo
router.get('/', (req, res, next) => proveedorController.listar(req, res, next));
router.get('/:id', (req, res, next) => proveedorController.obtenerPorId(req, res, next));

// Escritura restringida a administradores
router.post('/', auth, autorizarRoles('admin'), (req, res, next) => proveedorController.crear(req, res, next));
router.put('/:id', auth, autorizarRoles('admin'), (req, res, next) => proveedorController.actualizar(req, res, next));
router.delete('/:id', auth, autorizarRoles('admin'), (req, res, next) => proveedorController.eliminar(req, res, next));

export default router;
