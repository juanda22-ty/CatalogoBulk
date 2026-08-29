import categoriaService from './categoria.service.js';

class CategoriaController {
  async crear(req, res, next) {
    try {
      const nuevaCategoria = await categoriaService.crearCategoria(req.body);
      res.status(201).json(nuevaCategoria);
    } catch (error) {
      next(error);
    }
  }

  async listar(req, res, next) {
    try {
      const categorias = await categoriaService.listarCategorias(req.query);
      res.status(200).json(categorias);
    } catch (error) {
      next(error);
    }
  }

  async obtenerPorId(req, res, next) {
    try {
      const categoria = await categoriaService.obtenerPorId(req.params.id);
      res.status(200).json(categoria);
    } catch (error) {
      next(error);
    }
  }

  async actualizar(req, res, next) {
    try {
      const categoriaActualizada = await categoriaService.actualizarCategoria(req.params.id, req.body);
      res.status(200).json(categoriaActualizada);
    } catch (error) {
      next(error);
    }
  }
}

export default new CategoriaController();