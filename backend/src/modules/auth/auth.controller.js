import authService from './auth.service.js';

class AuthController {
  async registrar(req, res, next) {
    try {
      const nuevoUsuario = await authService.registrar(req.body);
      res.status(201).json({
        mensaje: 'Usuario registrado exitosamente',
        data: nuevoUsuario
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: 'Por favor provea email y contraseña' });
      }

      const resultado = await authService.login(email, password);
      res.status(200).json(resultado);
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthController();