import { Schema, model } from 'mongoose';

const categoriaSchema = new Schema(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre de la categoría es obligatorio'],
      unique: true,
      trim: true,
      lowercase: true
    },
    slug: {
      type: String,
      unique: true,
      trim: true,
      lowercase: true
    },
    descripcion: {
      type: String,
      trim: true,
      default: ''
    },
    activa: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

// Generar slug antes de guardar si no existe
categoriaSchema.pre('save', function () {
  if (this.isModified('nombre') && !this.slug) {
    this.slug = this.nombre
      .toLowerCase()
      .trim()
      .replace(/[\s\W-]+/g, '-');
  }
});

export default model('Categoria', categoriaSchema);