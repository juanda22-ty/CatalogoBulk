import { Router } from 'express';
import usuarioController from './usuario.controller.js';
import auth from '../../middlewares/auth.js';
import autorizarRoles from '../../middlewares/rol.js';

const router = Router();

// Toda la gestión de usuarios requiere autenticación y rol admin
router.use(auth, autorizarRoles('admin'));

router.get('/', (req, res, next) => usuarioController.listar(req, res, next));
router.get('/:id', (req, res, next) => usuarioController.obtenerPorId(req, res, next));
router.post('/', (req, res, next) => usuarioController.crear(req, res, next));
router.put('/:id', (req, res, next) => usuarioController.actualizar(req, res, next));

export default router;
