import { Router } from 'express';
import proveedorController from './proveedor.controller.js';

const router = Router();

// Endpoints definidos en la Sección 7.3
router.get('/', (req, res, next) => proveedorController.listar(req, res, next));
router.get('/:id', (req, res, next) => proveedorController.obtenerPorId(req, res, next));
router.post('/', (req, res, next) => proveedorController.crear(req, res, next));
router.put('/:id', (req, res, next) => proveedorController.actualizar(req, res, next));
router.delete('/:id', (req, res, next) => proveedorController.eliminar(req, res, next));

export default router;