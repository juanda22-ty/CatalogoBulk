import categoriaRepository from './categoria.repository.js';
import AppError from '../../errors/AppError.js';

class CategoriaService {
  async crearCategoria(datos) {
    if (!datos.slug && datos.nombre) {
      datos.slug = datos.nombre
        .toLowerCase()
        .trim()
        .replace(/[\s\W-]+/g, '-');
    }
    return await categoriaRepository.crear(datos);
  }

  async listarCategorias(query = {}) {
    const filtro = {};
    if (query.activa !== undefined) {
      filtro.activa = query.activa === 'true';
    }
    return await categoriaRepository.obtenerTodas(filtro);
  }

  async obtenerPorId(id) {
    const categoria = await categoriaRepository.obtenerPorId(id);
    if (!categoria) {
      throw new AppError('Categoría no encontrada', 404, 'NOT_FOUND');
    }
    return categoria;
  }

  async actualizarCategoria(id, datos) {
    if (datos.nombre && !datos.slug) {
      datos.slug = datos.nombre
        .toLowerCase()
        .trim()
        .replace(/[\s\W-]+/g, '-');
    }

    const categoria = await categoriaRepository.actualizar(id, datos);
    if (!categoria) {
      throw new AppError('Categoría no encontrada', 404, 'NOT_FOUND');
    }
    return categoria;
  }
}

export default new CategoriaService();