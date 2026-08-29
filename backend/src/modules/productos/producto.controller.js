import productoService from './producto.service.js';

class ProductoController {
  async crear(req, res, next) {
    try {
      const nuevoProducto = await productoService.crearProducto(req.body);
      res.status(201).json(nuevoProducto);
    } catch (error) {
      next(error);
    }
  }

  async listar(req, res, next) {
    try {
      const resultado = await productoService.listarProductos(req.query);
      res.status(200).json(resultado);
    } catch (error) {
      next(error);
    }
  }

  async obtenerPorId(req, res, next) {
    try {
      const producto = await productoService.obtenerPorId(req.params.id);
      res.status(200).json(producto);
    } catch (error) {
      next(error);
    }
  }

  async actualizar(req, res, next) {
    try {
      const productoActualizado = await productoService.actualizarProducto(req.params.id, req.body);
      res.status(200).json(productoActualizado);
    } catch (error) {
      next(error);
    }
  }

  async eliminar(req, res, next) {
    try {
      await productoService.eliminarProducto(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async obtenerStats(req, res, next) {
    try {
      const stats = await productoService.obtenerEstadisticas();
      res.status(200).json(stats);
    } catch (error) {
      next(error);
    }
  }
}

export default new ProductoController();