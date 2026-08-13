const mongoose = require('mongoose');

const productoSchema = new mongoose.Schema(
  {
    sku: {
      type: String,
      required: [true, 'El SKU es requerido'],
      unique: true,
      trim: true,
      index: true
    },
    nombre: {
      type: String,
      required: [true, 'El nombre es requerido'],
      trim: true,
      minlength: [1, 'El nombre debe tener al menos 1 carácter']
    },
    precio: {
      type: Number,
      required: [true, 'El precio es requerido'],
      min: [0, 'El precio debe ser mayor o igual a 0']
    },
    stock: {
      type: Number,
      default: 0,
      min: [0, 'El stock no puede ser negativo'],
      validate: {
        validator: Number.isInteger,
        message: 'El stock debe ser un número entero'
      }
    },
    categoria: {
      type: String,
      required: [true, 'La categoría es requerida'],
      trim: true,
      minlength: [1, 'La categoría debe tener al menos 1 carácter'],
      index: true
    },
    descripcion: {
      type: String,
      default: null,
      trim: true
    },
    imagenUrl: {
      type: String,
      default: null,
      trim: true
    },
    proveedorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Proveedor',
      required: [true, 'El proveedorId es requerido'],
      index: true
    },
    disponible: {
      type: Boolean,
      default: function () {
        return this.stock > 0;
      }
    }
  },
  {
    timestamps: true
  }
);

// Mantiene 'disponible' sincronizado con 'stock' antes de guardar
productoSchema.pre('save', function (next) {
  if (this.isModified('stock')) {
    this.disponible = this.stock > 0;
  }
  next();
});

const Producto = mongoose.model('Producto', productoSchema);

module.exports = Producto;