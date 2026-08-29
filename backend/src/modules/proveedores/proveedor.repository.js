import Proveedor from './proveedor.model.js';
import Producto from '../productos/producto.model.js';

class ProveedorRepository {
  async crear(datos) {
    return await Proveedor.create(datos);
  }

  async obtenerTodos(filtro = {}, opciones = { page: 1, limit: 20 }) {
    const skip = (opciones.page - 1) * opciones.limit;
    const [data, total] = await Promise.all([
      Proveedor.find(filtro).skip(skip).limit(opciones.limit).sort({ createdAt: -1 }),
      Proveedor.countDocuments(filtro)
    ]);
    return { data, total, page: opciones.page, limit: opciones.limit };
  }

  async obtenerPorId(id) {
    return await Proveedor.findById(id);
  }

  async actualizar(id, datos) {
    return await Proveedor.findByIdAndUpdate(id, datos, { new: true, runValidators: true });
  }

  async eliminar(id) {
    return await Proveedor.findByIdAndDelete(id);
  }

  async contarProductosAsociados(proveedorId) {
    return await Producto.countDocuments({ proveedorId });
  }
}

export default new ProveedorRepository();