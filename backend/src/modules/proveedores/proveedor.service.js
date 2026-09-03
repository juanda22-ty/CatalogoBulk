import proveedorRepository from './proveedor.repository.js';
import AppError from '../../errors/AppError.js';

class ProveedorService {
  async crearProveedor(datos) {
    return await proveedorRepository.crear(datos);
  }

  async listarProveedores(query) {
    const page = parseInt(query.page, 10) || 1;
    const limit = Math.min(parseInt(query.limit, 10) || 20, 100);
    const filtro = {};

    if (query.activo !== undefined) {
      filtro.activo = query.activo === 'true';
    }

    return await proveedorRepository.obtenerTodos(filtro, { page, limit });
  }

  async obtenerPorId(id) {
    const proveedor = await proveedorRepository.obtenerPorId(id);
    if (!proveedor) {
      throw new AppError('Proveedor no encontrado', 404, 'NOT_FOUND');
    }
    return proveedor;
  }

  async actualizarProveedor(id, datos) {
    const proveedor = await proveedorRepository.actualizar(id, datos);
    if (!proveedor) {
      throw new AppError('Proveedor no encontrado', 404, 'NOT_FOUND');
    }
    return proveedor;
  }
}

export default new ProveedorService();