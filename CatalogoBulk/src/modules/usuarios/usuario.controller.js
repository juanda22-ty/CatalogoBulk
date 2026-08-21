import usuarioService from './usuario.service.js';

class UsuarioController {
  async crear(req, res, next) {
    try {
      const usuario = await usuarioService.crear(req.body);
      res.status(201).json(usuario);
    } catch (error) {
      next(error);
    }
  }

  async listar(req, res, next) {
    try {
      const resultado = await usuarioService.listar(req.query);
      res.status(200).json(resultado);
    } catch (error) {
      next(error);
    }
  }

  async obtenerPorId(req, res, next) {
    try {
      const usuario = await usuarioService.obtenerPorId(req.params.id);
      res.status(200).json(usuario);
    } catch (error) {
      next(error);
    }
  }

  async actualizar(req, res, next) {
    try {
      const usuario = await usuarioService.actualizar(req.params.id, req.body, req.usuario.id);
      res.status(200).json(usuario);
    } catch (error) {
      next(error);
    }
  }

  async eliminar(req, res, next) {
    try {
      await usuarioService.eliminar(req.params.id, req.usuario.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export default new UsuarioController();
