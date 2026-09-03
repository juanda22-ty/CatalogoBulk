import productoRepository from './producto.repository.js';
import proveedorRepository from '../proveedores/proveedor.repository.js';
import Proveedor from '../proveedores/proveedor.model.js';
import AppError from '../../errors/AppError.js';
import mongoose from 'mongoose';

class ProductoService {
  async crearProducto(datos) {
    // Validar existencia del proveedorId (Sección 7.2)
    const proveedor = await proveedorRepository.obtenerPorId(datos.proveedorId);
    if (!proveedor) {
      throw new AppError('El proveedorId especificado no existe', 404, 'PROVEEDOR_NOT_FOUND');
    }

    return await productoRepository.crear(datos);
  }

  async listarProductos(query) {
    const page = parseInt(query.page, 10) || 1;
    const limit = Math.min(parseInt(query.limit, 10) || 20, 100);
    const filtro = {};

    // Filtro opcional por categoría
    if (query.categoria) {
      filtro.categoria = query.categoria.toLowerCase().trim();
    }

    // Búsqueda por nombre (insensible a mayúsculas)
    if (query.q) {
      const termino = query.q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filtro.nombre = { $regex: termino, $options: 'i' };
    }

    // Filtro opcional por disponible (true/false)
    if (query.disponible !== undefined) {
      filtro.disponible = query.disponible === 'true';
    }

    // Filtro opcional por proveedor (acepta ObjectId o slug)
    if (query.proveedor) {
      if (mongoose.Types.ObjectId.isValid(query.proveedor)) {
        filtro.proveedorId = query.proveedor;
      } else {
        const proveedor = await Proveedor.findOne({ slug: query.proveedor.toLowerCase().trim() });
        if (proveedor) {
          filtro.proveedorId = proveedor._id;
        } else {
          // Si el slug no existe, retorna resultado vacío
          return { data: [], total: 0, page, limit };
        }
      }
    }

    return await productoRepository.obtenerTodos(filtro, { page, limit });
  }

  async obtenerPorId(id) {
    const producto = await productoRepository.obtenerPorId(id);
    if (!producto) {
      throw new AppError('Producto no encontrado', 404, 'NOT_FOUND');
    }
    return producto;
  }

  async actualizarProducto(id, datos) {
    // Si se envía proveedorId, se valida su existencia
    if (datos.proveedorId) {
      const proveedor = await proveedorRepository.obtenerPorId(datos.proveedorId);
      if (!proveedor) {
        throw new AppError('El proveedorId especificado no existe', 404, 'PROVEEDOR_NOT_FOUND');
      }
    }

    const productoActualizado = await productoRepository.actualizar(id, datos);
    if (!productoActualizado) {
      throw new AppError('Producto no encontrado', 404, 'NOT_FOUND');
    }
    return productoActualizado;
  }

  async obtenerEstadisticas() {
    return await productoRepository.obtenerStats();
  }
}

export default new ProductoService();