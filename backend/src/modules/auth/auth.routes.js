import { Router } from 'express';
import authController from './auth.controller.js';

const router = Router();

router.post('/register', (req, res, next) => authController.registrar(req, res, next));
router.post('/login', (req, res, next) => authController.login(req, res, next));

export default router;