import Producto from './producto.model.js';

class ProductoRepository {
  async crear(datos) {
    return await Producto.create(datos);
  }

  async obtenerTodos(filtro = {}, opciones = { page: 1, limit: 20 }) {
    const skip = (opciones.page - 1) * opciones.limit;
    const [data, total] = await Promise.all([
      Producto.find(filtro).skip(skip).limit(opciones.limit).sort({ createdAt: -1 }),
      Producto.countDocuments(filtro)
    ]);
    return { data, total, page: opciones.page, limit: opciones.limit };
  }

  async obtenerPorId(id) {
    return await Producto.findById(id);
  }

  async actualizar(id, datos) {
    return await Producto.findByIdAndUpdate(id, datos, { new: true, runValidators: true });
  }

  async eliminar(id) {
    return await Producto.findByIdAndDelete(id);
  }

  async obtenerStats() {
    const [statsGenerales, porCategoria] = await Promise.all([
      Producto.aggregate([
        {
          $group: {
            _id: null,
            totalProductos: { $sum: 1 },
            precioPromedio: { $avg: '$precio' }
          }
        }
      ]),
      Producto.aggregate([
        {
          $group: {
            _id: '$categoria',
            count: { $sum: 1 }
          }
        },
        {
          $project: {
            _id: 0,
            categoria: '$_id',
            count: 1
          }
        }
      ])
    ]);

    const totalProductos = statsGenerales[0]?.totalProductos || 0;
    const precioPromedio = statsGenerales[0]?.precioPromedio 
      ? Number(statsGenerales[0].precioPromedio.toFixed(2)) 
      : 0;

    return {
      totalProductos,
      precioPromedio,
      porCategoria
    };
  }
}

export default new ProductoRepository();