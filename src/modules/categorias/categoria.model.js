const mongoose = require('mongoose');

const categoriaSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: [true, 'El slug es requerido'],
      unique: true,
      lowercase: true,
      trim: true
    },
    nombre: {
      type: String,
      required: [true, 'El nombre es requerido'],
      trim: true
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
    }
  },
  {
    timestamps: true
  }
);

const Categoria = mongoose.model('Categoria', categoriaSchema);

module.exports = Categoria;