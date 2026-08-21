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

  async eliminarProveedor(id) {
    const proveedor = await proveedorRepository.obtenerPorId(id);
    if (!proveedor) {
      throw new AppError('Proveedor no encontrado', 404, 'NOT_FOUND');
    }

    // Regla de integridad de la Sección 7.3: No eliminar si tiene productos asociados
    const productosAsociados = await proveedorRepository.contarProductosAsociados(id);
    if (productosAsociados > 0) {
      throw new AppError(
        'No se puede eliminar un proveedor con productos asociados. Desactívelo en su lugar.',
        409,
        'INTEGRITY_ERROR'
      );
    }

    await proveedorRepository.eliminar(id);
  }
}

export default new ProveedorService();