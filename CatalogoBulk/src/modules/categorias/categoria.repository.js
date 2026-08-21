import Categoria from './categoria.model.js';
import Producto from '../productos/producto.model.js';

class CategoriaRepository {
  async crear(datos) {
    return await Categoria.create(datos);
  }

  async obtenerTodas(filtro = {}) {
    return await Categoria.find(filtro).sort({ nombre: 1 });
  }

  async obtenerPorId(id) {
    return await Categoria.findById(id);
  }

  async obtenerPorSlug(slug) {
    return await Categoria.findOne({ slug });
  }

  async actualizar(id, datos) {
    return await Categoria.findByIdAndUpdate(id, datos, { new: true, runValidators: true });
  }

  async contarProductosAsociados(nombreCategoria) {
    return await Producto.countDocuments({ categoria: nombreCategoria.toLowerCase().trim() });
  }
}

export default new CategoriaRepository();