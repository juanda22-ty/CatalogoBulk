import Usuario from '../auth/usuario.model.js';

class UsuarioRepository {
  async crear(datos) {
    return await Usuario.create(datos);
  }

  async obtenerTodos(filtro = {}, opciones = { page: 1, limit: 20 }) {
    const skip = (opciones.page - 1) * opciones.limit;
    const [data, total] = await Promise.all([
      Usuario.find(filtro).skip(skip).limit(opciones.limit).sort({ createdAt: -1 }),
      Usuario.countDocuments(filtro)
    ]);
    return { data, total, page: opciones.page, limit: opciones.limit };
  }

  async obtenerPorId(id) {
    return await Usuario.findById(id);
  }

  async obtenerPorEmail(email) {
    return await Usuario.findOne({ email: email.toLowerCase().trim() });
  }

  async actualizar(id, datos) {
    return await Usuario.findByIdAndUpdate(id, datos, { new: true, runValidators: true });
  }

  async eliminar(id) {
    return await Usuario.findByIdAndDelete(id);
  }
}

export default new UsuarioRepository();
