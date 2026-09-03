import proveedorService from './proveedor.service.js';

class ProveedorController {
  async crear(req, res, next) {
    try {
      const nuevoProveedor = await proveedorService.crearProveedor(req.body);
      res.status(201).json(nuevoProveedor);
    } catch (error) {
      next(error);
    }
  }

  async listar(req, res, next) {
    try {
      const resultado = await proveedorService.listarProveedores(req.query);
      res.status(200).json(resultado);
    } catch (error) {
      next(error);
    }
  }

  async obtenerPorId(req, res, next) {
    try {
      const proveedor = await proveedorService.obtenerPorId(req.params.id);
      res.status(200).json(proveedor);
    } catch (error) {
      next(error);
    }
  }

  async actualizar(req, res, next) {
    try {
      const proveedorActualizado = await proveedorService.actualizarProveedor(req.params.id, req.body);
      res.status(200).json(proveedorActualizado);
    } catch (error) {
      next(error);
    }
  }
}

export default new ProveedorController();