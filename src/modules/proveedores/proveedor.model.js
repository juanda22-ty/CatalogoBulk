const mongoose = require('mongoose');

const proveedorSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre es requerido'],
      unique: true,
      trim: true
    },
    slug: {
      type: String,
      required: [true, 'El slug es requerido'],
      unique: true,
      lowercase: true,
      trim: true
    },
    contactoEmail: {
      type: String,
      default: null,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Por favor ingrese un email de contacto válido'
      ]
    },
    logoUrl: {
      type: String,
      default: null,
      trim: true
    },
    activo: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

const Proveedor = mongoose.model('Proveedor', proveedorSchema);

module.exports = Proveedor;